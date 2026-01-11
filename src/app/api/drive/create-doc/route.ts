import { NextRequest, NextResponse } from 'next/server';
import { createDoc } from '@/lib/google/drive-crud';
import { requireDriveAuth } from '../drive-auth';

export async function POST(request: NextRequest) {
  const auth = requireDriveAuth(request);
  if (auth) return auth;

  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId) {
    return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID' }, { status: 500 });
  }

  const body = await request.json();
  const title = body?.title as string | undefined;
  const folderPath = body?.folderPath as string | undefined;
  const content = body?.content as string | undefined;

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  try {
    const result = await createDoc({
      rootId,
      title,
      folderPath,
      content,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Create doc failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
