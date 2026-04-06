import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cmsPasswordIsValid } from '@/lib/cms-files';

export const runtime = 'nodejs';

// Allow up to 20 MB uploads (App Router uses this to override the default 1 MB limit)
export const maxDuration = 60;

const PUBLIC_ROOT = path.join(process.cwd(), 'public');

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ico',
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadToGitHub(filePath: string, buffer: Buffer): Promise<void> {
  const token = process.env.CMS_GITHUB_TOKEN;
  const owner = process.env.CMS_GITHUB_OWNER;
  const repo = process.env.CMS_GITHUB_REPO;
  const branch = process.env.CMS_GITHUB_BRANCH ?? 'main';

  if (!token || !owner || !repo) {
    throw new Error('GitHub persistence is not configured for uploads.');
  }

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}`;

  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const getResponse = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
    headers: authHeaders,
  });

  let sha: string | undefined;
  if (getResponse.ok) {
    const fileData = (await getResponse.json()) as { sha?: string };
    sha = fileData.sha;
  } else if (getResponse.status !== 404) {
    throw new Error('Unable to access file on GitHub.');
  }

  const body: Record<string, unknown> = {
    message: `cms: upload ${filePath}`,
    content: buffer.toString('base64'),
    branch,
  };

  if (sha !== undefined) {
    body.sha = sha;
  }

  const putResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!putResponse.ok) {
    throw new Error('Unable to upload file to GitHub.');
  }
}

export async function POST(request: Request) {
  const password = request.headers.get('x-cms-password');

  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Unable to parse upload. The file may be too large or the request was malformed.' },
      { status: 400 },
    );
  }

  try {
    const file = formData.get('file');
    const folder = formData.get('folder');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File is too large. Maximum 20 MB.' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `File type "${ext}" is not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}` },
        { status: 400 },
      );
    }

    const safeName = sanitizeFilename(file.name);
    const targetFolder = typeof folder === 'string' && folder.trim()
      ? folder.trim().replace(/^\/+|\/+$/g, '').replace(/\.\./g, '')
      : '';

    const relativePath = targetFolder ? `${targetFolder}/${safeName}` : safeName;
    const publicPath = `/${relativePath}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const hasGitHub = Boolean(process.env.CMS_GITHUB_TOKEN);

    // Always write to local filesystem first for instant preview
    const absolutePath = path.resolve(PUBLIC_ROOT, relativePath);

    if (!absolutePath.startsWith(PUBLIC_ROOT + path.sep) && absolutePath !== PUBLIC_ROOT) {
      return NextResponse.json({ error: 'Invalid upload path.' }, { status: 400 });
    }

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    // Fire-and-forget GitHub sync for persistence — don't block the response
    if (hasGitHub) {
      void uploadToGitHub(`public/${relativePath}`, buffer).catch(() => {});
    }

    return NextResponse.json({ url: publicPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
