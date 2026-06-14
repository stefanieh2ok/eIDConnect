import { NextRequest, NextResponse } from 'next/server';
import { logClaraAiOutput } from '@/lib/ai/clara-ai-audit';
import { getChatProvider } from '@/lib/ai/get-chat-provider';
import { buildClaraSystemPrompt, type AddressMode } from '@/lib/clara-system-prompt';

const DU_SCOPE_FALLBACK =
  'Ich kann dir in dieser Vorschau bei Meldungen, Beteiligungsverfahren, Abstimmungen, Wahlen und Terminen helfen. Wenn du magst, nenne ich dir als Nächstes die zuständige Stelle und den möglichen Ablauf.';
const SIE_SCOPE_FALLBACK =
  'Ich kann Ihnen in dieser Vorschau bei Meldungen, Beteiligungsverfahren, Abstimmungen, Wahlen und Terminen helfen. Wenn Sie möchten, nenne ich Ihnen als Nächstes die zuständige Stelle und den möglichen Ablauf.';

export async function POST(request: NextRequest) {
  let userMessage = '';
  try {
    const { message, context, preferences, addressMode } = await request.json();
    userMessage = String(message ?? '');
    const mode: AddressMode = (addressMode as AddressMode) || 'du';

    if (!userMessage) {
      return NextResponse.json({ error: 'Nachricht ist erforderlich' }, { status: 400 });
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

    if (!process.env.OPENAI_API_KEY) {
      const fallback = mode === 'sie' ? SIE_SCOPE_FALLBACK : DU_SCOPE_FALLBACK;
      await logClaraAiOutput({
        request,
        channel: 'chat',
        model: 'local-fallback',
        provider: 'local',
        inputText: userMessage,
        outputText: fallback,
        fallback: true,
      });
      return NextResponse.json({
        response: fallback,
        source: 'local-fallback',
        timestamp: new Date().toISOString(),
      });
    }

    const provider = getChatProvider();
    const result = await provider.completeChat({
      systemPrompt,
      userMessage,
    });

    await logClaraAiOutput({
      request,
      channel: 'chat',
      model: result.model,
      provider: result.providerId,
      inputText: userMessage,
      outputText: result.content,
      sourceRefs: context ? [String(context)] : undefined,
    });

    return NextResponse.json({
      response: result.content,
      source: result.providerId,
      timestamp: new Date().toISOString(),
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
    const fallback = mode === 'sie' ? SIE_SCOPE_FALLBACK : DU_SCOPE_FALLBACK;
    await logClaraAiOutput({
      request,
      channel: 'chat',
      model: 'error-fallback',
      provider: 'local',
      inputText: userMessage,
      outputText: fallback,
      fallback: true,
    }).catch(() => undefined);
    return NextResponse.json(
      {
        response: fallback,
        source: 'error-fallback',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
