import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Enrollment requires authentication. Please sign in to continue.' },
    { status: 401 }
  );
}
