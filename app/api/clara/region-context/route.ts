import { NextRequest, NextResponse } from 'next/server';
import { createAPIHeaders, getAPIConfig } from '@/lib/api-config';
import { buildClaraSystemPrompt, type AddressMode } from '@/lib/clara-system-prompt';

const MAX_CHARS = 520;

function buildFallback(
  addressMode: AddressMode,
  county: string,
  regionLabel: string,
): string {
  const formal = addressMode === 'sie';
  if (county && regionLabel) {
    return formal
      ? `Für Ihre Eingabe ordnet die App den Bereich „${regionLabel}" zu; aus Postleitzahl und Ort ist der Kreis/Landkreis „${county}" abgeleitet. Bundes-, Landes-, Kreis- und Kommunalebene sind für typische Anliegen relevant; Wahlen und Inhalte in der App folgen dieser regionalen Einordnung.`
      : `Für deine Eingabe ordnet die App den Bereich „${regionLabel}" zu; aus PLZ und Ort ist der Kreis/Landkreis „${county}" abgeleitet. Bundes-, Landes-, Kreis- und Kommunalebene sind für typische Anliegen relevant; Wahlen und Inhalte in der App folgen dieser Einordnung.`;
  }
  if (regionLabel) {
    return formal
      ? `Die App nutzt aktuell den Bereich „${regionLabel}" für Inhalte und Filter. Mit vollständiger Postleitzahl und Wohnort wird die Zuordnung zum Kreis präziser.`
      : `Die App nutzt aktuell den Bereich „${regionLabel}" für Inhalte und Filter. Mit vollständiger PLZ und Wohnort wird die Zuordnung zum Kreis präziser.`;
  }
  return formal
    ? 'Geben Sie Postleitzahl und Wohnort ein – daraus leitet die App die regionale Zuordnung (Kreis, Inhalte) ab.'
    : 'Gib Postleitzahl und Wohnort ein – daraus leitet die App die regionale Zuordnung (Kreis, Inhalte) ab.';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const street = typeof body.street === 'string' ? body.street : '';
    const plz = typeof body.plz === 'string' ? body.plz : '';
    const city = typeof body.city === 'string' ? body.city : '';
    const county = typeof body.county === 'string' ? body.county : '';
    const regionLabel = typeof body.regionLabel === 'string' ? body.regionLabel : '';
    const addressMode: AddressMode = body.addressMode === 'du' ? 'du' : 'sie';

    const fallback = buildFallback(addressMode, county.trim(), regionLabel.trim());

    let apiKey: string;
    let baseURL: string;
    let model: string;
    try {
      const config = getAPIConfig();
      apiKey = config.openai.apiKey;
      baseURL = config.openai.baseURL;
      model = config.openai.model;
    } catch {
      return NextResponse.json({ text: fallback, source: 'fallback' as const });
    }

    const addrLine = [street.trim(), plz.trim(), city.trim()].filter(Boolean).join(', ');
    const userMessage = `Nur mit diesen Angaben arbeiten (keine weiteren Orte oder Behörden erfinden):
- Adresszeile: ${addrLine || 'noch unvollständig'}
- Aus PLZ/Ort abgeleiteter Kreis/Landkreis (Heuristik in der App): ${county.trim() || 'nicht ermittelt'}
- Anzeigename der App-Region: ${regionLabel.trim() || 'nicht gesetzt'}

Aufgabe: In höchstens drei kurzen Sätzen die Ebenen Bund, Land, Kreis und Kommune für typische Bürgerangelegenheiten an diesem Ort sachlich einordnen. Am Ende in einem Halbsatz erwähnen, dass Inhalte und Wahlen in der App nach dieser regionalen Einordnung gefiltert werden können. Keine Rechtsberatung.`;

    const systemPrompt = buildClaraSystemPrompt({
      addressMode,
      personalizationEnabled: false,
      context: 'Onboarding: Region aus Adresseingabe (ohne eID-Validierung). Nur Fakten aus der Nutzereingabe und der mitgelieferten Heuristik.',
    });

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: createAPIHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 220,
        temperature: 0.35,
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ text: fallback, source: 'fallback' as const });
    }

    const data = await response.json();
    let text = (data.choices?.[0]?.message?.content as string | undefined)?.trim() ?? '';
    if (!text) {
      return NextResponse.json({ text: fallback, source: 'fallback' as const });
    }
    if (text.length > MAX_CHARS) {
      text = `${text.slice(0, MAX_CHARS - 1)}…`;
    }

    return NextResponse.json({ text, source: 'clara' as const });
  } catch (e) {
    console.error('Clara region-context:', e);
    return NextResponse.json({ text: '', source: 'error' as const });
  }
}
