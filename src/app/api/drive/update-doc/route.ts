import { NextRequest, NextResponse } from 'next/server';
import { updateDoc } from '@/lib/google/drive-crud';
import { requireDriveAuth } from '../drive-auth';

export async function POST(request: NextRequest) {
  const auth = requireDriveAuth(request);
  if (auth) return auth;

  const body = await request.json();
  const docId = body?.docId as string | undefined;
  const content = body?.content as string | undefined;

  if (!docId || content === undefined) {
    return NextResponse.json({ error: 'Missing docId or content' }, { status: 400 });
  }

  try {
    const result = await updateDoc({ docId, content });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Update doc failed', message: error?.message || error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
