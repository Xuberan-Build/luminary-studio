import { NextRequest, NextResponse } from 'next/server';
import { createFolder } from '@/lib/google/drive-crud';
import { requireDriveAuth } from '../drive-auth';

export async function POST(request: NextRequest) {
  const auth = requireDriveAuth(request);
  if (auth) return auth;

  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId) {
    return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID' }, { status: 500 });
  }

  const body = await request.json();
  const folderPath = body?.path as string | undefined;

  if (!folderPath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const result = await createFolder(rootId, folderPath);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Create folder failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
