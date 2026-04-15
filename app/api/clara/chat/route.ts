import { NextRequest, NextResponse } from 'next/server';
import { getAPIConfig, createAPIHeaders } from '@/lib/api-config';
import { CLARA_FISCAL_AND_BUDGET_GUIDANCE } from '@/lib/clara-fiscal-guidance';

export async function POST(request: NextRequest) {
  try {
    const { message, context, preferences } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Nachricht ist erforderlich' },
        { status: 400 }
      );
    }

    const config = getAPIConfig();
    const headers = createAPIHeaders(config.openai.apiKey);

    const hasPreferences =
      !!preferences &&
      typeof preferences === 'object' &&
      Object.keys(preferences as Record<string, unknown>).length > 0;
    const prefText = hasPreferences ? JSON.stringify(preferences) : 'keine';

    // Clara's System-Prompt: neutral erklären (keine Abstimmungs-Empfehlung)
    const systemPrompt = `Du bist Clara, eine freundliche und kompetente KI-Assistentin für eIDConnect (Demonstrationsumgebung).

WICHTIGER HINWEIS:
Du darfst **keine** Abstimmungsempfehlung geben (kein „dafür/dagegen“, kein „enthält“ als Empfehlung, kein „so sollen Sie/du stimmen“).
Du darfst aber erklären:
- welche Argumente es gibt (Pro/Contra),
- welche Aspekte relevant sind (Relevanz),
- welche Aspekte man bei einer eigenen Entscheidung berücksichtigen kann (ohne Entscheidung zu steuern),
- und welche Quellen man prüfen sollte.

${CLARA_FISCAL_AND_BUDGET_GUIDANCE}

Deine Persönlichkeit:
- Freundlich, aber professionell
- Analytisch und faktenbasiert
- Neutral, aber hilfreich
- Spricht immer auf Deutsch

Nutzerpräferenzen: ${prefText}
Kontext: ${context || 'Allgemeine politische Beratung'}

Antworte immer auf Deutsch und sei hilfreich bei politischen Fragen.`;

    const response = await fetch(`${config.openai.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.55,
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
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Clara Chat API Fehler:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      {
        error: 'Clara ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.',
        details: process.env.NODE_ENV === 'development' ? message : undefined
      },
      { status: 500 }
    );
  }
}
