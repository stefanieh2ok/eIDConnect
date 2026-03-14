import { NextRequest, NextResponse } from 'next/server';
import { getAPIConfig, createAPIHeaders } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const { votingCard, preferences } = await request.json();
    
    if (!votingCard) {
      return NextResponse.json(
        { error: 'Abstimmungsdaten sind erforderlich' },
        { status: 400 }
      );
    }

    const config = getAPIConfig();
    const headers = createAPIHeaders(config.openai.apiKey);

    // Clara's Analyse-Prompt für Abstimmungen
    const systemPrompt = `Du bist Clara, eine KI-Assistentin für politische Analyse. Analysiere die folgende Abstimmung basierend auf den Nutzerpräferenzen.

Nutzerpräferenzen: ${JSON.stringify(preferences || {})}

Antworte im folgenden JSON-Format:
{
  "personalMatch": 85,
  "reasoning": "Basierend auf deinen Umwelt-Prioritäten...",
  "pros": ["Pro-Argument 1", "Pro-Argument 2"],
  "cons": ["Contra-Argument 1"],
  "recommendation": "strong_yes",
  "confidence": 92,
  "alternativePerspectives": ["Alternative Sicht 1", "Alternative Sicht 2"]
}

Empfehlungen: strong_yes, yes, neutral, no, strong_no
Vertrauen: 0-100%`;

    const userPrompt = `Analysiere diese Abstimmung:

Titel: ${votingCard.title}
Kategorie: ${votingCard.category}
Beschreibung: ${votingCard.description}
Schnelle Fakten: ${votingCard.quickFacts?.join(', ') || 'Keine'}

Aktuelle Ergebnisse:
- Dafür: ${votingCard.yes}%
- Dagegen: ${votingCard.no}%
- Enthaltungen: ${votingCard.abstain}%

Gib eine personalisierte Analyse basierend auf den Nutzerpräferenzen.`;

    const response = await fetch(`${config.openai.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.6,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '{}';

    try {
      const analysis = JSON.parse(analysisText);
      
      return NextResponse.json({
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      // Fallback falls JSON-Parsing fehlschlägt
      return NextResponse.json({
        analysis: {
          personalMatch: 50,
          reasoning: analysisText,
          pros: ['Analyse verfügbar'],
          cons: [],
          recommendation: 'neutral',
          confidence: 70,
          alternativePerspectives: ['Weitere Informationen erforderlich']
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Clara Analyse API Fehler:', error);
    const message = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      {
        error: 'Clara kann momentan keine Analyse durchführen. Bitte versuchen Sie es später erneut.',
        details: process.env.NODE_ENV === 'development' ? message : undefined
      },
      { status: 500 }
    );
  }
}
