import { NextRequest, NextResponse } from 'next/server';
import { getAPIConfig, createAPIHeaders } from '@/lib/api-config';
import { buildClaraSystemPrompt, type AddressMode } from '@/lib/clara-system-prompt';

const DU_SCOPE_FALLBACK =
  'Ich kann dir in dieser Demo bei Meldungen, Beteiligungsverfahren, Abstimmungen, Wahlen und Terminen helfen. Wenn du magst, nenne ich dir als Nächstes die zuständige Stelle und den möglichen Ablauf.';
const SIE_SCOPE_FALLBACK =
  'Ich kann Ihnen in dieser Demo bei Meldungen, Beteiligungsverfahren, Abstimmungen, Wahlen und Terminen helfen. Wenn Sie möchten, nenne ich Ihnen als Nächstes die zuständige Stelle und den möglichen Ablauf.';

export async function POST(request: NextRequest) {
  try {
    const { message, context, preferences, addressMode } = await request.json();
    const mode: AddressMode = (addressMode as AddressMode) || 'du';
    
    if (!message) {
      return NextResponse.json(
        { error: 'Nachricht ist erforderlich' },
        { status: 400 }
      );
    }

    const hasPreferences =
      !!preferences &&
      typeof preferences === 'object' &&
      Object.keys(preferences as Record<string, unknown>).length > 0;

    const systemPrompt = buildClaraSystemPrompt({
      addressMode: mode,
      personalizationEnabled: hasPreferences,
      preferencesJson: hasPreferences ? JSON.stringify(preferences) : undefined,
      context: context || undefined,
    });

    // Robuster Demo-Fallback: Clara bleibt nutzbar, auch wenn kein API-Key hinterlegt ist.
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: mode === 'sie' ? SIE_SCOPE_FALLBACK : DU_SCOPE_FALLBACK,
        source: 'local-fallback',
        timestamp: new Date().toISOString(),
      });
    }

    const config = getAPIConfig();
    const headers = createAPIHeaders(config.openai.apiKey);

    const response = await fetch(`${config.openai.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const claraResponse = data.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

    return NextResponse.json({
      response: claraResponse,
      source: 'openai',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Clara Chat API Fehler:', error);
    let mode: AddressMode = 'du';
    try {
      const url = new URL(request.url);
      const m = url.searchParams.get('addressMode');
      if (m === 'sie') mode = 'sie';
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      {
        response: mode === 'sie' ? SIE_SCOPE_FALLBACK : DU_SCOPE_FALLBACK,
        source: 'error-fallback',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
