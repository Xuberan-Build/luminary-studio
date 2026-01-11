import { NextRequest, NextResponse } from 'next/server';
import { moveFile } from '@/lib/google/drive-crud';
import { requireDriveAuth } from '../drive-auth';

export async function POST(request: NextRequest) {
  const auth = requireDriveAuth(request);
  if (auth) return auth;

  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId) {
    return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID' }, { status: 500 });
  }

  const body = await request.json();
  const fileId = body?.fileId as string | undefined;
  const folderPath = body?.folderPath as string | undefined;
  const folderId = body?.folderId as string | undefined;

  if (!fileId || (!folderPath && !folderId)) {
    return NextResponse.json(
      { error: 'Missing fileId or target folder' },
      { status: 400 }
    );
  }

  try {
    const result = await moveFile({ rootId, fileId, folderPath, folderId });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Move failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
