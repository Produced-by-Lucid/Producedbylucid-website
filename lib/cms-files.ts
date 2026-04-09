import fs from 'node:fs/promises';
import path from 'node:path';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

const EDITABLE_EXTENSIONS = new Set(['.json', '.md']);

function normalizeRelativePath(input: string) {
  const normalized = input.replace(/\\/g, '/').replace(/^\/+/, '');

  if (!normalized) {
    throw new Error('Invalid path.');
  }

  if (normalized.includes('..')) {
    throw new Error('Path traversal is not allowed.');
  }

  return normalized;
}

function resolveContentPath(relativePath: string) {
  const safePath = normalizeRelativePath(relativePath);
  const absolutePath = path.resolve(CONTENT_ROOT, safePath);
  const rootWithSep = `${CONTENT_ROOT}${path.sep}`;

  if (!absolutePath.startsWith(rootWithSep) && absolutePath !== CONTENT_ROOT) {
    throw new Error('Path is outside the content directory.');
  }

  const extension = path.extname(absolutePath).toLowerCase();

  if (!EDITABLE_EXTENSIONS.has(extension)) {
    throw new Error('Only .json and .md files are editable.');
  }

  return { absolutePath, safePath };
}

async function walkContentFiles(currentPath: string, relativeDir = ''): Promise<string[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const entryAbsolutePath = path.join(currentPath, entry.name);
    const entryRelativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await walkContentFiles(entryAbsolutePath, entryRelativePath)));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (EDITABLE_EXTENSIONS.has(extension)) {
      files.push(entryRelativePath);
    }
  }

  return files;
}

export async function listEditableContentFiles() {
  const files = await walkContentFiles(CONTENT_ROOT);
  return files.sort((left, right) => left.localeCompare(right));
}

export async function readEditableContentFile(relativePath: string) {
  const { absolutePath, safePath } = resolveContentPath(relativePath);
  const content = await fs.readFile(absolutePath, 'utf8');
  return { path: safePath, content };
}

function formatGitHubPersistenceError(status: number, message: string, owner: string, repo: string) {
  if (status === 403 && message.includes('Resource not accessible by personal access token')) {
    return `GitHub token cannot access ${owner}/${repo}. For org repos, create a fine-grained token with Contents: Read and write, set Resource owner to ${owner}, grant repository access to ${repo}, and complete org approval/SSO authorization if required.`;
  }

  if (status === 401) {
    return 'GitHub token is invalid or expired. Rotate CMS_GITHUB_TOKEN and redeploy.';
  }

  if (status === 404) {
    return `GitHub path or repository was not found. Verify CMS_GITHUB_OWNER, CMS_GITHUB_REPO, and CMS_GITHUB_BRANCH for ${owner}/${repo}.`;
  }

  return `${message} (GitHub API ${status})`;
}

async function writeEditableContentFileToGitHub(safePath: string, content: string): Promise<void> {
  const token = process.env.CMS_GITHUB_TOKEN;
  const owner = process.env.CMS_GITHUB_OWNER;
  const repo = process.env.CMS_GITHUB_REPO;
  const branch = process.env.CMS_GITHUB_BRANCH ?? 'main';

  if (!token || !owner || !repo) {
    const missing: string[] = [];
    if (!token) missing.push('CMS_GITHUB_TOKEN');
    if (!owner) missing.push('CMS_GITHUB_OWNER');
    if (!repo) missing.push('CMS_GITHUB_REPO');

    throw new Error(
      `GitHub persistence is not configured. Missing: ${missing.join(', ')}. Required in production.`,
    );
  }

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/content/${safePath}`;

  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Step 1 — get current SHA (required when updating an existing file)
  const getResponse = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
    headers: authHeaders,
  });

  let sha: string | undefined;
  if (getResponse.ok) {
    const fileData = (await getResponse.json()) as { sha?: string };
    sha = fileData.sha;
  } else if (getResponse.status !== 404) {
    const errorData = (await getResponse.json().catch(() => ({}))) as { message?: string };
    const message = errorData.message ?? 'Unable to access file metadata on GitHub.';
    throw new Error(formatGitHubPersistenceError(getResponse.status, message, owner, repo));
  }

  // Step 2 — commit the new content
  const body: Record<string, unknown> = {
    message: `cms: update ${safePath}`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  };

  if (sha !== undefined) {
    body.sha = sha;
  }

  let putResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // On a 409 SHA conflict (stale SHA due to a concurrent write), re-fetch the
  // latest SHA and retry once. This handles the race condition that can occur
  // when two saves fire close together (e.g. after uploading image + video).
  if (putResponse.status === 409) {
    const retryGet = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      headers: authHeaders,
    });

    if (retryGet.ok) {
      const retryFileData = (await retryGet.json()) as { sha?: string };
      if (retryFileData.sha) {
        body.sha = retryFileData.sha;
        putResponse = await fetch(apiUrl, {
          method: 'PUT',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
    }
  }

  if (!putResponse.ok) {
    const errorData = (await putResponse.json().catch(() => ({}))) as { message?: string };
    const message = errorData.message ?? 'Unable to persist file to GitHub.';
    throw new Error(formatGitHubPersistenceError(putResponse.status, message, owner, repo));
  }
}

export async function writeEditableContentFile(relativePath: string, content: string) {
  const { absolutePath, safePath } = resolveContentPath(relativePath);

  // Try to write locally (works in dev / self-hosted). On read-only filesystems
  // (e.g. Vercel serverless) this will throw EROFS/EACCES and we fall back to
  // writing directly to GitHub as the primary store.
  let localWriteOk = false;
  try {
    await fs.writeFile(absolutePath, content, 'utf8');
    localWriteOk = true;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'EROFS' && code !== 'EACCES' && code !== 'EPERM') throw err;
    // Read-only filesystem — will use GitHub as primary below
  }

  if (process.env.CMS_GITHUB_TOKEN) {
    if (!localWriteOk) {
      // Production read-only FS: await GitHub synchronously so the caller
      // knows whether the save actually succeeded.
      await writeEditableContentFileToGitHub(safePath, content);
    } else {
      // Dev / self-hosted: local write succeeded, sync GitHub in background.
      void writeEditableContentFileToGitHub(safePath, content).catch(() => {});
    }
  } else if (!localWriteOk) {
    throw new Error(
      'File system is read-only and no GitHub token is configured. ' +
      'Set CMS_GITHUB_TOKEN, CMS_GITHUB_OWNER, and CMS_GITHUB_REPO to enable CMS saves in production.',
    );
  }

  return { path: safePath };
}

async function deleteEditableContentFileFromGitHub(safePath: string): Promise<void> {
  const token = process.env.CMS_GITHUB_TOKEN;
  const owner = process.env.CMS_GITHUB_OWNER;
  const repo = process.env.CMS_GITHUB_REPO;
  const branch = process.env.CMS_GITHUB_BRANCH ?? 'main';

  if (!token || !owner || !repo) return;

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/content/${safePath}`;
  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Get current SHA (required to delete via GitHub API)
  const getResponse = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers: authHeaders });
  if (!getResponse.ok) return; // file doesn't exist on GitHub, nothing to delete

  const fileData = (await getResponse.json()) as { sha?: string };
  if (!fileData.sha) return;

  const deleteResponse = await fetch(apiUrl, {
    method: 'DELETE',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `cms: delete ${safePath}`, sha: fileData.sha, branch }),
  });

  if (!deleteResponse.ok) {
    const errorData = (await deleteResponse.json().catch(() => ({}))) as { message?: string };
    const message = errorData.message ?? 'Unable to delete file on GitHub.';
    throw new Error(formatGitHubPersistenceError(deleteResponse.status, message, owner, repo));
  }
}

export async function deleteEditableContentFile(relativePath: string) {
  const { absolutePath, safePath } = resolveContentPath(relativePath);

  let localDeleteOk = false;
  try {
    await fs.unlink(absolutePath);
    localDeleteOk = true;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'EROFS' && code !== 'EACCES' && code !== 'EPERM') throw err;
  }

  if (process.env.CMS_GITHUB_TOKEN) {
    if (!localDeleteOk) {
      await deleteEditableContentFileFromGitHub(safePath);
    } else {
      void deleteEditableContentFileFromGitHub(safePath).catch(() => {});
    }
  } else if (!localDeleteOk) {
    throw new Error(
      'File system is read-only and no GitHub token is configured. Cannot delete file in production.',
    );
  }

  return { path: safePath };
}

export function cmsPasswordIsValid(password: string | null) {
  const expectedPassword = process.env.CMS_DASHBOARD_PASSWORD;

  if (!expectedPassword) {
    return true;
  }

  return password === expectedPassword;
}
