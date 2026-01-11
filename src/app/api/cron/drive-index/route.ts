import { NextRequest, NextResponse } from 'next/server';
import { syncDriveIndex } from '@/lib/google/drive-indexer';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!rootId) {
    return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID' }, { status: 500 });
  }

  try {
    const result = await syncDriveIndex(rootId);
    return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Drive index sync failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
