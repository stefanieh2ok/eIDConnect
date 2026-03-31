import { NextRequest, NextResponse } from 'next/server';
import { getAPIConfig, createAPIHeaders } from '@/lib/api-config';
import { buildClaraSystemPrompt, type AddressMode } from '@/lib/clara-system-prompt';

export async function POST(request: NextRequest) {
  try {
    const { message, context, preferences, addressMode } = await request.json();
    
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

    const systemPrompt = buildClaraSystemPrompt({
      addressMode: (addressMode as AddressMode) || 'du',
      personalizationEnabled: hasPreferences,
      preferencesJson: hasPreferences ? JSON.stringify(preferences) : undefined,
      context: context || undefined,
    });

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
