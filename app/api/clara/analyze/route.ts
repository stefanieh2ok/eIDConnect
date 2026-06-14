import { NextRequest, NextResponse } from 'next/server';
import { logClaraAiOutput } from '@/lib/ai/clara-ai-audit';
import { getChatProvider } from '@/lib/ai/get-chat-provider';
import { buildClaraAnalyzePrompt, type AddressMode } from '@/lib/clara-system-prompt';
import { buildHaushaltKontextFuerPrompt, haushaltScopeFromVotingCardId } from '@/data/haushaltsOfficialRefs';

const fallbackAnalysis = {
  personalMatch: 50,
  reasoning:
    'Das ist eine KI-gestützte Zusammenfassung in dieser Konzeptvorschau. Ich kann keine Empfehlung geben, aber ich kann Pro- und Contra-Aspekte neutral strukturieren und auf offizielle Quellen verweisen.',
  pros: ['Neutrale Einordnung der Verfahrensschritte moeglich', 'Relevante Fristen und Zuständigkeiten koennen benannt werden'],
  cons: ['Ohne offizielle Detailquellen bleibt die Einordnung begrenzt', 'Keine politische Empfehlung oder Gewichtung einzelner Optionen'],
  confidence: 60,
  alternativePerspectives: ['Pruefen Sie die zustaendige Wahl- oder Verwaltungsstelle', 'Vergleichen Sie offizielle Unterlagen der beteiligenden Positionen'],
};

export async function POST(request: NextRequest) {
  let inputFingerprint = '';
  try {
    const { votingCard, preferences, addressMode } = await request.json();

    if (!votingCard) {
      return NextResponse.json({ error: 'Abstimmungsdaten sind erforderlich' }, { status: 400 });
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

    const ki = votingCard.kiAnalysis;
    const haushaltScope = haushaltScopeFromVotingCardId(String(votingCard.id ?? ''));
    const haushaltBlock = buildHaushaltKontextFuerPrompt(haushaltScope);
    const sourceRefs = [haushaltScope, votingCard.id].filter(Boolean).map(String);

    const userPrompt = `Analysiere diese Abstimmung in der Konzeptvorschau (Inhalt ist Teil der Beispielkarte, im Sinne der Vorschau zu verwenden):

Titel: ${votingCard.title}
Kategorie: ${votingCard.category}
Beschreibung: ${votingCard.description}
Schnelle Fakten / Kennzahlen: ${votingCard.quickFacts?.join(' | ') || 'Keine'}
Haushalt / Auswirkung (Beispielfeld): ${ki?.financialImpact || 'nicht gesondert hinterlegt'}

Aktuelle Ergebnisverteilung in der Vorschau (Karte):
- Dafür: ${votingCard.yes}%
- Dagegen: ${votingCard.no}%
- Enthaltungen: ${votingCard.abstain}%
- Stimmenzahl (Beispiel): ${votingCard.votes}

Pflicht:
- Pro- und Contra-Argumente müssen sich auf konkrete Zahlen, Kosten oder Fristen aus Beschreibung oder Schnelle Fakten beziehen, soweit vorhanden (z. B. Mio. €, Monate, Prozent).
- Für Haushalts-/Finanzthemen: zusätzliche öffentliche Beträge NUR aus dem folgenden Haushaltsblock (amtliche Links + verifizierte Hinweise). Keine Schätzungen, keine „typischen“ Kommunalwerte.
- Keine Abstimmungsempfehlung.

${haushaltBlock}`;

    inputFingerprint = `${votingCard.id}:${votingCard.title}`;

    if (!process.env.OPENAI_API_KEY) {
      const out = JSON.stringify(fallbackAnalysis);
      await logClaraAiOutput({
        request,
        channel: 'analyze',
        model: 'local-fallback',
        provider: 'local',
        inputText: inputFingerprint,
        outputText: out,
        sourceRefs,
        fallback: true,
      });
      return NextResponse.json({
        analysis: fallbackAnalysis,
        source: 'local-fallback',
        timestamp: new Date().toISOString(),
      });
    }

    const provider = getChatProvider();
    const result = await provider.completeChat({
      systemPrompt,
      userMessage: userPrompt,
      maxTokens: 800,
      temperature: 0.6,
    });

    const analysisText = result.content || '{}';

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

      await logClaraAiOutput({
        request,
        channel: 'analyze',
        model: result.model,
        provider: result.providerId,
        inputText: inputFingerprint,
        outputText: JSON.stringify(normalizedAnalysis),
        sourceRefs,
      });

      return NextResponse.json({
        analysis: normalizedAnalysis,
        source: result.providerId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      const parsedFallback = {
        personalMatch: 50,
        reasoning: analysisText,
        pros: ['Analyse verfügbar'],
        cons: [],
        confidence: 70,
        alternativePerspectives: ['Weitere Informationen erforderlich'],
      };
      await logClaraAiOutput({
        request,
        channel: 'analyze',
        model: result.model,
        provider: result.providerId,
        inputText: inputFingerprint,
        outputText: analysisText,
        sourceRefs,
      });
      return NextResponse.json({
        analysis: parsedFallback,
        source: 'parse-fallback',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Clara Analyse API Fehler:', error);
    const out = JSON.stringify(fallbackAnalysis);
    await logClaraAiOutput({
      request,
      channel: 'analyze',
      model: 'error-fallback',
      provider: 'local',
      inputText: inputFingerprint,
      outputText: out,
      fallback: true,
    }).catch(() => undefined);
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
