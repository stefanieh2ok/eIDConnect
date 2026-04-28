import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const url = new URL('/favicon-32x32.png', request.url);
  return NextResponse.redirect(url, 307);
}
