import { NextResponse } from 'next/server';
import { cmsPasswordIsValid, listEditableContentFiles } from '@/lib/cms-files';

export async function GET(request: Request) {
  const password = request.headers.get('x-cms-password');

  if (!cmsPasswordIsValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const files = await listEditableContentFiles();
  return NextResponse.json({ files });
}
