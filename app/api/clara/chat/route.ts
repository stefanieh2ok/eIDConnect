import { NextRequest, NextResponse } from 'next/server';
import { getAPIConfig, createAPIHeaders } from '@/lib/api-config';

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

    // Clara's System-Prompt für deutsche politische Beratung
    const systemPrompt = `Du bist Clara, eine freundliche und kompetente KI-Assistentin für eIDConnect. Du hilfst deutschen Bürgern bei politischen Entscheidungen.

Deine Persönlichkeit:
- Freundlich, aber professionell
- Analytisch und faktenbasiert
- Neutral, aber hilfreich
- Spricht immer auf Deutsch
- Basiert Empfehlungen auf den Nutzerpräferenzen

Nutzerpräferenzen: ${JSON.stringify(preferences || {})}
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
