import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
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

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string,
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const ext = path.extname(filename).toLowerCase();
  const resourceType =
    ext === '.mp4' || ext === '.webm' ? 'video' : 'image';

  // Cloudinary public_id should not include the extension
  const baseName = filename.replace(/\.[^.]+$/, '');

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || undefined,
        public_id: baseName,
        resource_type: resourceType,
        overwrite: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed.'));
        } else {
          resolve(result.secure_url);
        }
      },
    );
    stream.end(buffer);
  });
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
    );

    if (hasCloudinary) {
      // Upload to Cloudinary and return the CDN URL directly.
      const url = await uploadToCloudinary(buffer, targetFolder, safeName);
      return NextResponse.json({ url });
    }

    // Fallback: write to local public/ directory (development without Cloudinary).
    const relativePath = targetFolder ? `${targetFolder}/${safeName}` : safeName;
    const absolutePath = path.resolve(PUBLIC_ROOT, relativePath);

    if (!absolutePath.startsWith(PUBLIC_ROOT + path.sep) && absolutePath !== PUBLIC_ROOT) {
      return NextResponse.json({ error: 'Invalid upload path.' }, { status: 400 });
    }

    try {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, buffer);
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
        return NextResponse.json(
          {
            error:
              'File system is read-only and Cloudinary is not configured. ' +
              'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable uploads in production.',
          },
          { status: 500 },
        );
      }
      throw err;
    }

    return NextResponse.json({ url: `/${relativePath}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
