import { NextRequest, NextResponse } from 'next/server';
import { getAPIConfig, createAPIHeaders } from '@/lib/api-config';
import { buildClaraAnalyzePrompt, type AddressMode } from '@/lib/clara-system-prompt';

const fallbackAnalysis = {
  personalMatch: 50,
  reasoning:
    'Das ist eine KI-gestuetzte Zusammenfassung in der Demo. Ich kann keine Empfehlung geben, aber ich kann Pro- und Contra-Aspekte neutral strukturieren und auf offizielle Quellen verweisen.',
  pros: ['Neutrale Einordnung der Verfahrensschritte moeglich', 'Relevante Fristen und Zuständigkeiten koennen benannt werden'],
  cons: ['Ohne offizielle Detailquellen bleibt die Einordnung begrenzt', 'Keine politische Empfehlung oder Gewichtung einzelner Optionen'],
  confidence: 60,
  alternativePerspectives: ['Pruefen Sie die zustaendige Wahl- oder Verwaltungsstelle', 'Vergleichen Sie offizielle Unterlagen der beteiligten Positionen'],
};

export async function POST(request: NextRequest) {
  try {
    const { votingCard, preferences, addressMode } = await request.json();
    
    if (!votingCard) {
      return NextResponse.json(
        { error: 'Abstimmungsdaten sind erforderlich' },
        { status: 400 }
      );
    }

    const hasPreferences =
      !!preferences &&
      typeof preferences === 'object' &&
      Object.keys(preferences as Record<string, unknown>).length > 0;

    const systemPrompt = buildClaraAnalyzePrompt({
      addressMode: (addressMode as AddressMode) || 'du',
      personalizationEnabled: hasPreferences,
      preferencesJson: hasPreferences ? JSON.stringify(preferences) : undefined,
      context: `Abstimmung: ${votingCard.title} (${votingCard.category})`,
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        analysis: fallbackAnalysis,
        source: 'local-fallback',
        timestamp: new Date().toISOString(),
      });
    }

    const config = getAPIConfig();
    const headers = createAPIHeaders(config.openai.apiKey);

    const userPrompt = `Analysiere diese Abstimmung:

Titel: ${votingCard.title}
Kategorie: ${votingCard.category}
Beschreibung: ${votingCard.description}
Schnelle Fakten: ${votingCard.quickFacts?.join(', ') || 'Keine'}

Aktuelle Ergebnisse:
- Dafür: ${votingCard.yes}%
- Dagegen: ${votingCard.no}%
- Enthaltungen: ${votingCard.abstain}%

Gib eine sachliche, neutrale Analyse. Keine Abstimmungsempfehlung.`;

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
      const clamp0to100 = (n: unknown) => {
        if (typeof n !== 'number' || !Number.isFinite(n)) return null;
        return Math.max(0, Math.min(100, n));
      };

      const normalizedAnalysis = {
        personalMatch: clamp0to100(analysis?.thematicRelevance ?? analysis?.personalMatch) ?? 50,
        reasoning: typeof analysis?.reasoning === 'string' ? analysis.reasoning : analysisText,
        pros: Array.isArray(analysis?.pros) ? analysis.pros.filter((p: unknown) => typeof p === 'string') : ['Analyse verfügbar'],
        cons: Array.isArray(analysis?.cons) ? analysis.cons.filter((c: unknown) => typeof c === 'string') : [],
        confidence: clamp0to100(analysis?.confidence) ?? 70,
        alternativePerspectives: Array.isArray(analysis?.alternativePerspectives)
          ? analysis.alternativePerspectives.filter((p: unknown) => typeof p === 'string')
          : ['Weitere Informationen erforderlich'],
      };
      
      return NextResponse.json({
        analysis: normalizedAnalysis,
        source: 'openai',
        timestamp: new Date().toISOString()
      });
    } catch {
      return NextResponse.json({
        analysis: {
          personalMatch: 50,
          reasoning: analysisText,
          pros: ['Analyse verfügbar'],
          cons: [],
          confidence: 70,
          alternativePerspectives: ['Weitere Informationen erforderlich']
        },
        source: 'parse-fallback',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Clara Analyse API Fehler:', error);
    return NextResponse.json(
      {
        analysis: fallbackAnalysis,
        source: 'error-fallback',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
