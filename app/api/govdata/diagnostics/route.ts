import { NextResponse } from 'next/server';
import { buildGovDataDiagnostics, isGovDataDiagnosticsEnabled } from '@/lib/govdata/diagnostics';

export async function GET() {
  if (!isGovDataDiagnosticsEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const diagnostics = await buildGovDataDiagnostics();
    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Gov-data diagnostics failed',
      },
      { status: 500 },
    );
  }
}
