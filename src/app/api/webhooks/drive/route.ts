import { NextRequest, NextResponse } from 'next/server';
import { syncDriveIndex } from '@/lib/google/drive-indexer';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-goog-channel-token');
  const expectedToken = process.env.GOOGLE_DRIVE_WEBHOOK_TOKEN;
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!rootId) {
    return NextResponse.json({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID' }, { status: 500 });
  }

  try {
    const resourceState = request.headers.get('x-goog-resource-state');
    if (resourceState && resourceState !== 'sync') {
      await syncDriveIndex(rootId);
    }
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Drive webhook sync failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
