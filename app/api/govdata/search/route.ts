import { NextResponse } from 'next/server';
import { resolveGovDataForCase } from '@/lib/govdata/govDataResolver';
import type { MatchInput } from '@/lib/govdata/serviceMatcher';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MatchInput>;
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const mode = body.mode === 'business' || body.mode === 'unsure' ? body.mode : 'private';

    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }

    const resolution = await resolveGovDataForCase({
      text,
      mode,
      plz: typeof body.plz === 'string' ? body.plz : undefined,
      bundesland: typeof body.bundesland === 'string' ? body.bundesland : undefined,
      wohnort: typeof body.wohnort === 'string' ? body.wohnort : undefined,
    });

    return NextResponse.json(resolution);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Gov-data resolution failed',
      },
      { status: 500 },
    );
  }
}
