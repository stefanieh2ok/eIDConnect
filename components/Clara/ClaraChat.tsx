import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import ClaraVoiceInterface from './ClaraVoiceInterface';
import { ClaraAI } from '@/services/claraAI';
import { ensureStructuredClaraResponse, parseClaraStructuredResponse } from '@/lib/clara-response-format';
import type { AddressMode } from '@/lib/clara-system-prompt';
import { claraChatWelcomeContent } from '@/data/claraChatWelcome';

const LAVENDER = {
  bg: 'linear-gradient(180deg, #F5F0FF 0%, #EDE9FE 50%, #F3E8FF 100%)',
  border: '#E6E6FA',
  header: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 30%, #7C3AED 60%, #8B5CF6 100%)',
  headerGrad: '#B19CD9',
  text: '#5B21B6',
  bubble: 'linear-gradient(145deg, #EDE9FE 0%, #E9D5FF 50%, #EDE9FE 100%)',
  accent: '#7C3AED'
};

function ClaraStructuredMessageBody({ content }: { content: string }) {
  const sections = parseClaraStructuredResponse(content);
  if (!sections) {
    return <div className="text-sm whitespace-pre-line break-words">{content}</div>;
  }
  return (
    <div className="space-y-2">
      {sections.map((s) => (
        <div
          key={s.id}
          className="rounded-lg border px-2.5 py-2 text-[12px] leading-snug"
          style={{ borderColor: 'rgba(91, 33, 182, 0.22)', background: 'rgba(255,255,255,0.55)' }}
        >
          <div className="text-[10px] font-extrabold uppercase tracking-wide opacity-85" style={{ color: '#5B21B6' }}>
            {s.id}) {s.title}
          </div>
          <div className="mt-1 whitespace-pre-wrap break-words text-[12px] text-gray-800">{s.body || '—'}</div>
        </div>
      ))}
    </div>
  );
}

const IRIDESCENT_BUTTON: React.CSSProperties = {
  background: 'linear-gradient(145deg, #6D28D9 0%, #7C3AED 35%, #8B5CF6 65%, #A78BFA 100%)',
  boxShadow: '0 0 16px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 12px rgba(91, 33, 182, 0.25)',
  border: '1px solid rgba(255,255,255,0.35)'
};

interface ClaraMessage {
  id: string;
  type: 'user' | 'clara';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ClaraProps {
  level: string;
  onPointsEarned: (points: number) => void;
  selectedWahl?: any;
  initialPrompt?: string;
  autoSendInitialPrompt?: boolean;
  /**
   * Im Clara-Dock-Sheet: kein zweites Header-Pattern, kein zusätzlicher „Sprechen“-Button
   * (Sprache läuft über die Pille / globales Voice-Overlay) — vermeidet doppelte Voice-Zeilen.
   */
  embedVariant?: 'default' | 'dockSheet';
}

const ClaraChat: React.FC<ClaraProps> = ({
  level,
  onPointsEarned,
  selectedWahl,
  initialPrompt,
  autoSendInitialPrompt = false,
  embedVariant = 'default',
}) => {
  const { state } = useApp();
  const isFormal = state.anrede === 'sie';
  const t = (du: string, sie: string) => isFormal ? sie : du;
  const addressMode: AddressMode = isFormal ? 'sie' : 'du';
  const claraAI = useMemo(
    () => new ClaraAI(state.preferences as any, state.consentClaraPersonalization, addressMode),
    [state.preferences, state.consentClaraPersonalization, addressMode],
  );

  const [messages, setMessages] = useState<ClaraMessage[]>([
    {
      id: '1',
      type: 'clara',
      content: claraChatWelcomeContent(isFormal),
      timestamp: new Date(),
      sources: ['eID Beteiligung / Clara (KI-gestützt, EU AI Act)'],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const dockSheet = embedVariant === 'dockSheet';
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const lastAutoPromptRef = useRef<string>('');

  const scrollToBottom = () => {
    const sc = messagesScrollRef.current;
    if (sc) {
      sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  useEffect(() => {
    const prompt = (initialPrompt || '').trim();
    if (!autoSendInitialPrompt || !prompt) return;
    if (prompt === lastAutoPromptRef.current) return;
    lastAutoPromptRef.current = prompt;

    const run = async () => {
      const userMessage: ClaraMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: prompt,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsTyping(true);

      try {
        const context = selectedWahl
          ? `Kontext: ${selectedWahl.name || 'Wahl'} (${selectedWahl.wahlkreis || ''}) · Ebene: ${level}`
          : `Ebene: ${level}`;
        const apiAnswer = await claraAI.generateChatResponse(prompt, context);
        setIsSafeMode(claraAI.wasLastChatSafeMode());
        const claraMessage: ClaraMessage = {
          id: (Date.now() + 1).toString(),
          type: 'clara',
          content: apiAnswer,
          timestamp: new Date(),
          sources: ['Clara (KI-gestuetzt, System Prompt v6)']
        };
        setMessages(prev => [...prev, claraMessage]);
      } catch (_) {
        setIsSafeMode(true);
        const response = getClaraResponse(prompt);
        const claraMessage: ClaraMessage = {
          id: (Date.now() + 1).toString(),
          type: 'clara',
          content: ensureStructuredClaraResponse(response.content, addressMode),
          timestamp: new Date(),
          sources: response.sources
        };
        setMessages(prev => [...prev, claraMessage]);
      } finally {
        setIsTyping(false);
        onPointsEarned(5);
      }
    };

    run();
  }, [autoSendInitialPrompt, initialPrompt, selectedWahl, level, onPointsEarned, claraAI, addressMode]);

  // Lokaler Safe Fallback (keine politischen Einzelbehauptungen ohne verifizierte Quelle)
  const getClaraResponse = (question: string): { content: string; sources: string[] } => {
    const q = question.toLowerCase();
    const outOfScope = ['wetter', 'kochen', 'rezept', 'sport', 'fussball', 'film', 'musik'];

    if (outOfScope.some((w) => q.includes(w))) {
      return {
        content: t(
          'Safe Mode: Diese Frage liegt außerhalb meines Zuständigkeitsbereichs. Ich helfe dir neutral bei Orientierung, Meldungen, Beteiligungsverfahren, Wahlen und Terminen.',
          'Safe Mode: Diese Frage liegt außerhalb meines Zuständigkeitsbereichs. Ich helfe Ihnen neutral bei Orientierung, Meldungen, Beteiligungsverfahren, Wahlen und Terminen.',
        ),
        sources: ['Clara Safe Mode'],
      };
    }

    if (q.includes('empfehlung') || q.includes('soll ich') || q.includes('was wuerdest') || q.includes('was würdest')) {
      return {
        content: 'Ich gebe keine politische Empfehlung. Dazu liegt mir hier keine verifizierte offizielle Quelle vor.',
        sources: ['Clara Safe Mode'],
      };
    }

    if (
      q.includes('wie funktioniert') ||
      q.includes('ablauf') ||
      q.includes('frist') ||
      q.includes('buergerbegehren') ||
      q.includes('bürgerbegehren')
    ) {
      return {
        content: t(
          'Safe Mode: Ich kann dir den Ablauf neutral erklaeren. Fuer verbindliche Informationen nutze bitte die offiziellen Stellen und Unterlagen.',
          'Safe Mode: Ich kann Ihnen den Ablauf neutral erklaeren. Fuer verbindliche Informationen nutzen Sie bitte die offiziellen Stellen und Unterlagen.',
        ),
        sources: ['Clara Safe Mode'],
      };
    }

    return {
      content: 'Dazu liegt mir hier keine verifizierte offizielle Quelle vor.',
      sources: ['Clara Safe Mode'],
    };
  };

  const sendMessageWithText = async (rawText: string) => {
    const messageText = rawText.trim();
    if (!messageText) return;

    const userMessage: ClaraMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const context = selectedWahl
        ? `Kontext: ${selectedWahl.name || 'Wahl'} (${selectedWahl.wahlkreis || ''}) · Ebene: ${level}`
        : `Ebene: ${level}`;
      const apiAnswer = await claraAI.generateChatResponse(messageText, context);
      setIsSafeMode(claraAI.wasLastChatSafeMode());
      const claraMessage: ClaraMessage = {
        id: (Date.now() + 1).toString(),
        type: 'clara',
        content: apiAnswer,
        timestamp: new Date(),
        sources: ['Clara (KI-gestuetzt, System Prompt v6)']
      };
      setMessages(prev => [...prev, claraMessage]);
    } catch (_) {
      setIsSafeMode(true);
      const response = getClaraResponse(messageText);
      const claraMessage: ClaraMessage = {
        id: (Date.now() + 1).toString(),
        type: 'clara',
        content: ensureStructuredClaraResponse(response.content, addressMode),
        timestamp: new Date(),
        sources: response.sources
      };
      setMessages(prev => [...prev, claraMessage]);
    } finally {
      setIsTyping(false);
      onPointsEarned(5);
    }
  };

  const sendMessage = async () => {
    await sendMessageWithText(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = level === 'bund' 
    ? [
        'Was ist das Programm der SPD?',
        'Was ist das Programm der CDU?',
        'Was ist das Programm der GRÜNEN?',
        'Was ist das Programm der FDP?',
        'Was ist das Programm der AfD?',
        'Was ist das Programm der Linken?',
        'Wie funktioniert das Wahlsystem?',
        'Was ist der Unterschied zwischen Erst- und Zweitstimme?',
        'Wie funktioniert ein Bürgerbegehren?'
      ]
    : level === 'land'
    ? [
        'Welche Parteien treten bei der Landtagswahl an?',
        'Was ist das Programm der CDU?',
        'Was ist das Programm der SPD?',
        'Wie war das Ergebnis der letzten Landtagswahl?',
        'Wie funktioniert die Landtagswahl?',
        'Welche Kandidaten gibt es?',
      ]
    : [
        'Wie funktioniert die Kommunalwahl?',
        'Was macht ein Gemeinderat?',
        'Welche Beteiligungsmöglichkeiten gibt es in Kirkel?',
        'Was ist ein Bürgerbegehren?',
        'Wann ist die nächste Kommunalwahl?',
      ];

  const compactQuickQuestions = quickQuestions.slice(0, 5);

  return (
    <div
      className={
        'flex h-full min-h-0 max-h-full w-full flex-col overflow-hidden ' +
        (dockSheet ? '' : 'rounded-xl border-2 shadow-xl')
      }
      style={
        dockSheet
          ? {}
          : { borderColor: '#8B5CF6', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)' }
      }
    >
      {/* Header – im Dock-Sheet entfällt die Doppel-Leiste (äußeres Modal hat bereits Kontext). */}
      {!dockSheet ? (
        <div
          className="p-2.5 rounded-t-xl text-white border-b border-white/20 flex-shrink-0"
          style={{
            background: LAVENDER.header,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 20px rgba(76, 29, 149, 0.3)',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold sm:text-base">Clara – Digitale Assistentin</h2>
              <p className="text-[11px] opacity-95">Neutral • Quellenbasiert • EU AI Act</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCompliance((prev) => !prev)}
              className="rounded-md border border-white/40 px-2 py-1 text-[10px] font-semibold hover:bg-white/10"
            >
              {showCompliance ? 'Weniger' : 'Info'}
            </button>
          </div>
          {showCompliance && (
            <p className="mt-1.5 text-[10px] leading-snug opacity-90">
              <strong>Verfahren ja, Meinung nein.</strong> Clara gibt keine Wahlempfehlung, verweist auf offizielle Quellen
              und verarbeitet Eingaben nur für die bereitgestellte Funktion.
            </p>
          )}
          {isSafeMode && (
            <p className="mt-1 rounded-md bg-amber-100/90 px-2 py-1 text-[10px] font-semibold text-amber-900">
              Eingeschraenkter Modus: Clara beantwortet aktuell nur neutral und verfahrensorientiert.
            </p>
          )}
        </div>
      ) : isSafeMode ? (
        <div className="flex-shrink-0 border-b px-3 py-2" style={{ borderColor: LAVENDER.border, background: LAVENDER.bg }}>
          <p className="rounded-md bg-amber-100/90 px-2 py-1 text-[10px] font-semibold text-amber-900">
            Eingeschraenkter Modus: Clara beantwortet aktuell nur neutral und verfahrensorientiert.
          </p>
        </div>
      ) : null}

      {/* Messages – scrollbar, nicht abgeschnitten */}
      <div
        ref={messagesScrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-3"
        style={{ background: LAVENDER.bg }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-2 break-words ${message.type === 'user' ? 'bg-gray-200 text-gray-900' : ''}`} style={message.type === 'clara' ? { background: LAVENDER.bubble, color: LAVENDER.text, border: '1px solid rgba(139, 92, 246, 0.2)' } : {}}>
              <div className="flex-1 min-w-0">
                {message.content.startsWith('ARIA EXECUTIVE INTELLIGENCE') ? (
                  <div className="aria-box">
                    <div className="aria-label">ARIA EXECUTIVE INTELLIGENCE</div>
                    <div className="aria-content whitespace-pre-line text-sm break-words">
                      {message.content.replace(/^ARIA EXECUTIVE INTELLIGENCE\n\n/, '')}
                    </div>
                  </div>
                ) : message.type === 'clara' ? (
                  <ClaraStructuredMessageBody content={message.content} />
                ) : (
                  <div className="text-sm whitespace-pre-line break-words">{message.content}</div>
                )}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t text-xs break-words" style={{ borderColor: LAVENDER.border }}>
                    <span className="font-semibold" style={{ color: LAVENDER.text }}>Quellenverweis:</span>
                    {message.sources.map((source, index) => (
                      <div key={index} className="mt-0.5" style={{ color: LAVENDER.text }}>• {source}</div>
                    ))}
                  </div>
                )}
                <div className="text-[10px] opacity-60 mt-1">{message.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2" style={{ background: LAVENDER.bubble, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: LAVENDER.accent }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: LAVENDER.accent, animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: LAVENDER.accent, animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {!dockSheet ? (
        <div className="px-3 py-2 border-t flex-shrink-0" style={{ borderColor: LAVENDER.border, background: LAVENDER.bg }}>
          <div className="text-[11px] text-gray-500 mb-1.5">Schnellfragen:</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {compactQuickQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => void sendMessageWithText(question)}
                disabled={isTyping}
                className="shrink-0 whitespace-nowrap text-[11px] px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                style={{ background: LAVENDER.bubble, color: LAVENDER.text }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Input (+ optional Sprechen nur außerhalb Dock-Sheet) */}
      <div className="p-3 border-t flex-shrink-0" style={{ borderColor: LAVENDER.border }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            autoFocus={false}
            placeholder={t('Frag Clara: Was sagt die SPD zum Thema Wohnen?', 'Fragen Sie Clara: Was sagt die SPD zum Thema Wohnen?')}
            className="flex-1 p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: LAVENDER.border, background: LAVENDER.bg }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 py-2.5 text-white rounded-lg text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={!inputMessage.trim() || isTyping ? { backgroundColor: LAVENDER.border } : { ...IRIDESCENT_BUTTON, color: LAVENDER.text }}
          >
            Senden
          </button>
          {!dockSheet ? (
            <button
              type="button"
              onClick={() => setShowVoice(true)}
              className="px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:shadow-lg"
              style={{ ...IRIDESCENT_BUTTON, color: LAVENDER.text }}
            >
              Sprechen
            </button>
          ) : null}
        </div>
      </div>

      {!dockSheet ? (
        <div className="px-3 pb-3 flex-shrink-0">
          <div
            className="rounded-lg p-2 text-[10px] leading-snug"
            style={{ background: LAVENDER.bubble, color: LAVENDER.text, border: `1px solid ${LAVENDER.border}` }}
          >
            Eingaben werden nur für diese Funktion verarbeitet.
          </div>
        </div>
      ) : null}

      {showVoice && !dockSheet ? (
        <ClaraVoiceInterface
          isOpen={showVoice}
          onClose={() => setShowVoice(false)}
          currentCard={null}
        />
      ) : null}
    </div>
  );
};

export default ClaraChat;