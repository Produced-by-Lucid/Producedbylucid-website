import { NextResponse } from 'next/server';
import {
  cmsPasswordIsValid,
  deleteEditableContentFile,
  readEditableContentFile,
  writeEditableContentFile,
} from '@/lib/cms-files';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function toRelativePath(pathSegments: string[]) {
  return pathSegments.join('/');
}

export async function GET(request: Request, context: RouteContext) {
  const password = request.headers.get('x-cms-password');

  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { path } = await context.params;
    const result = await readEditableContentFile(toRelativePath(path));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read file.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const password = request.headers.get('x-cms-password');

  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: string };

    if (typeof body.content !== 'string') {
      return NextResponse.json({ error: 'A string content field is required.' }, { status: 400 });
    }

    const { path } = await context.params;
    const result = await writeEditableContentFile(toRelativePath(path), body.content);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to write file.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const password = request.headers.get('x-cms-password');

  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { path } = await context.params;
    const result = await deleteEditableContentFile(toRelativePath(path));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete file.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
