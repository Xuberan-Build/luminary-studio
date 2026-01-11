import { NextRequest, NextResponse } from 'next/server';
import { renameFile } from '@/lib/google/drive-crud';
import { requireDriveAuth } from '../drive-auth';

export async function POST(request: NextRequest) {
  const auth = requireDriveAuth(request);
  if (auth) return auth;

  const body = await request.json();
  const fileId = body?.fileId as string | undefined;
  const name = body?.name as string | undefined;

  if (!fileId || !name) {
    return NextResponse.json({ error: 'Missing fileId or name' }, { status: 400 });
  }

  try {
    const result = await renameFile({ fileId, name });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Rename failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
