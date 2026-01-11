import { NextRequest, NextResponse } from 'next/server';

export function requireDriveAuth(request: NextRequest) {
  const expected = process.env.DRIVE_API_TOKEN || process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'Missing DRIVE_API_TOKEN' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const alt = request.headers.get('x-drive-token') || '';

  if (bearer === expected || alt === expected) {
    return null;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
