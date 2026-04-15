import React, { useState, useRef, useEffect } from 'react';
import { WAHLEN_DATA } from '@/data/constants';
import { getProgramEntry } from '@/data/partyProgramRegistry';
import { isTrustedEvidenceUrl, sanitizeEvidenceSources } from '@/lib/clara-evidence';
import ClaraVoiceInterface from './ClaraVoiceInterface';

const LAVENDER = {
  bg: 'linear-gradient(180deg, #F5F0FF 0%, #EDE9FE 50%, #F3E8FF 100%)',
  border: '#E6E6FA',
  header: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 30%, #7C3AED 60%, #8B5CF6 100%)',
  headerGrad: '#B19CD9',
  text: '#5B21B6',
  bubble: 'linear-gradient(145deg, #EDE9FE 0%, #E9D5FF 50%, #EDE9FE 100%)',
  accent: '#7C3AED'
};

/* Spaciger Farbverlauf für Clara-Buttons (Lavendel/Violett) */
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
  selectedWahl?: any; // Aktuelle Wahl für Parteiprogramm-Zugriff
}

type StructuredAnswer = {
  content: string;
  sources: string[];
};

const ClaraChat: React.FC<ClaraProps> = ({ level, onPointsEarned, selectedWahl }) => {
  const [messages, setMessages] = useState<ClaraMessage[]>([
    {
      id: '1',
      type: 'clara',
      content: 'Hallo! Ich bin Clara, dein KI-Assistent für politische Informationen. Ich informiere neutral auf Basis von Quellen – ohne Beratung oder Wahlempfehlung. Du kannst mich z. B. zu Wahlprogrammen, Kandidaten oder dem Wahlsystem fragen. Jede Antwort enthält einen Quellenverweis.',
      timestamp: new Date(),
      sources: ['eIDConnect / Clara KI-Agent']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderSource = (source: string, index: number) => {
    const urlMatch = source.match(/https?:\/\/\S+/i);
    if (!urlMatch) {
      return (
        <div key={index} className="mt-0.5 break-words" style={{ color: LAVENDER.text }}>
          • {source}
        </div>
      );
    }
    const url = urlMatch[0];
    const label = source.replace(url, '').replace(/\s[-–:]\s*$/, '').trim() || url;
    const trusted = isTrustedEvidenceUrl(url);
    return (
      <div key={index} className="mt-0.5 break-words" style={{ color: LAVENDER.text }}>
        • {label}{' '}
        <a
          className={`underline ${trusted ? 'hover:opacity-80' : 'opacity-70'}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
        {!trusted ? <span className="ml-1 text-[10px] opacity-80">(nicht auf Trusted-Whitelist)</span> : null}
      </div>
    );
  };

  const getRegistryRegion = (): 'bund' | 'saarland' | 'saarpfalz-kreis' | 'kirkel' => {
    if (level === 'bund') return 'bund';
    if (level === 'land') return 'saarland';
    if (level === 'kommune') return 'kirkel';
    return 'saarpfalz-kreis';
  };

  const getProgramAvailabilityHint = (party: string): { hint: string; source?: string } => {
    const region = getRegistryRegion();
    const year = region === 'bund' ? 2025 : 2026;
    const entry = getProgramEntry(region, year, party);
    if (!entry) {
      return {
        hint: 'Hinweis: Für diese Partei liegt in der Registry noch kein verifizierter Programmeintrag vor.',
      };
    }
    if (entry.status === 'verified') {
      return {
        hint: `Hinweis: Programmquelle verifiziert (${year}).`,
        source: entry.sourceUrl
          ? `Registry-Status: verified (${year}) – ${entry.sourceUrl}`
          : `Registry-Status: verified (${year})`,
      };
    }
    if (entry.status === 'partial') {
      return {
        hint: 'Hinweis: Teilabdeckung; meist Listen-/Zwischenstand, keine vollständige Endfassung.',
        source: entry.sourceUrl
          ? `Registry-Status: partial (${year}) – ${entry.sourceUrl}`
          : `Registry-Status: partial (${year})`,
      };
    }
    return {
      hint: 'Hinweis: Für diese Partei fehlt aktuell eine verifizierte Programmquelle.',
      source: `Registry-Status: missing (${year})`,
    };
  };

  const getCurrentWahl = () =>
    selectedWahl ||
    WAHLEN_DATA.find(
      (w) =>
        (level === 'bund' && w.level === 'bund') ||
        (level === 'land' && w.level === 'land') ||
        (level === 'kommune' && w.level === 'kommune')
    );

  const PARTY_ALIASES: Record<string, string[]> = {
    SPD: ['spd', 'sozialdemokrat'],
    CDU: ['cdu', 'csu', 'christlich demokratisch'],
    GRÜNE: ['grüne', 'gruene', 'grünen', 'bündnis 90', 'buendnis 90', 'b90'],
    FDP: ['fdp', 'freie demokratische'],
    'DIE LINKE': ['linke', 'die linke'],
    AfD: ['afd', 'alternative für deutschland'],
    BSW: ['bsw', 'bündnis sahra wagenknecht', 'buendnis sahra wagenknecht'],
  };

  const extractPartyName = (question: string): string | null => {
    const q = question.toLowerCase();
    for (const [party, aliases] of Object.entries(PARTY_ALIASES)) {
      if (aliases.some((alias) => q.includes(alias))) return party;
      if (q.includes(party.toLowerCase())) return party;
    }
    return null;
  };

  const buildStructuredResponse = (input: {
    core: string;
    facts: string[];
    pros: string[];
    cons: string[];
    uncertainty: string;
    sources: string[];
  }): StructuredAnswer => {
    const safeSources = sanitizeEvidenceSources(input.sources);
    const content = [
      `Kernaussage: ${input.core}`,
      '',
      'Zahlen & Fakten:',
      ...input.facts.map((f) => `- ${f}`),
      '',
      'Pro:',
      ...input.pros.map((p) => `- ${p}`),
      '',
      'Contra:',
      ...input.cons.map((c) => `- ${c}`),
      '',
      `Unsicherheiten: ${input.uncertainty}`,
      '',
      'Hinweis: Clara gibt keine Wahlempfehlung.',
    ].join('\n');
    return { content, sources: safeSources };
  };

  // Strict-Evidence: Nur aus hinterlegten Daten/Registry antworten.
  const getClaraResponse = (question: string): StructuredAnswer => {
    const lowerQuestion = question.toLowerCase();
    const wahl = getCurrentWahl();
    const asksProgram =
      ['programm', 'wahlprogramm', 'parteiprogramm', 'was plant', 'positionen', 'ziele', 'was will', 'was sagt'].some(
        (keyword) => lowerQuestion.includes(keyword)
      );
    const party = extractPartyName(lowerQuestion);

    if (asksProgram && party) {
      const partei = wahl?.parteien?.find((p: { name: string }) =>
        p.name.toLowerCase().includes(party.toLowerCase()) || party.toLowerCase().includes(p.name.toLowerCase())
      );
      const registry = getProgramAvailabilityHint(party);
      const sourceList = [
        wahl?.name ? `Wahlkontext: ${wahl.name}` : 'Wahlkontext: nicht eindeutig auflösbar',
        registry.source ?? 'Registry-Status: nicht vorhanden',
      ];

      if (!partei?.programm) {
        return buildStructuredResponse({
          core: `Für ${party} liegt in den hinterlegten Daten aktuell kein belastbarer Programmtext vor.`,
          facts: [`Region: ${getRegistryRegion()}`, registry.hint],
          pros: ['Transparenz: fehlende Quelle wird offen ausgewiesen.'],
          cons: ['Inhaltliche Aussage zum Programm ist aktuell nicht verifizierbar.'],
          uncertainty: 'Ohne verifizierte Primärquelle keine belastbare Programmauskunft.',
          sources: sourceList,
        });
      }

      return buildStructuredResponse({
        core: `Programmhinweise zu ${partei.name} für ${wahl?.name ?? 'die aktuelle Wahl'} liegen vor.`,
        facts: [partei.programm, registry.hint],
        pros: ['Direkter Bezug zu hinterlegten Wahl-/Programmdaten.'],
        cons: [registry.hint.includes('Teilabdeckung') ? 'Programmstand ist nur teilweise verifiziert.' : 'Details müssen in Originalquellen gegengeprüft werden.'],
        uncertainty: 'Zusammenfassung aus hinterlegten Daten, nicht aus Live-Web-Recherche.',
        sources: sourceList,
      });
    }

    if (lowerQuestion.includes('wahlsystem') || lowerQuestion.includes('erststimme') || lowerQuestion.includes('zweitstimme')) {
      return buildStructuredResponse({
        core: 'Das Wahlsystem wird als personalisierte Verhältniswahl dargestellt.',
        facts: [
          'Erststimme: Wahl einer Person im Wahlkreis.',
          'Zweitstimme: maßgeblich für Sitzverteilung nach Parteien.',
          'Beide Stimmen sind gültig und haben unterschiedliche Funktionen.',
        ],
        pros: ['Klare Trennung der Funktionen beider Stimmen verbessert Nachvollziehbarkeit.'],
        cons: ['Komplexität kann ohne erklärende Beispiele zu Missverständnissen führen.'],
        uncertainty: 'Detailregeln können je Wahltyp/Änderungsstand variieren.',
        sources: [
          'Bundeswahlgesetz (BWahlG): https://www.gesetze-im-internet.de/bwahlg/',
          'Bundeswahlleiter – Wahlsystem: https://www.bundeswahlleiterin.de',
        ],
      });
    }

    const candidate = wahl?.kandidaten?.find((c: { name: string }) => lowerQuestion.includes(String(c.name).toLowerCase()));
    if (candidate) {
      const candidateSources =
        (candidate.quellen as string[] | undefined)?.length
          ? (candidate.quellen as string[])
          : ['Kandidatenprofil ohne verifizierte Quellenangabe (Status: partial/missing)'];
      return buildStructuredResponse({
        core: `Profilhinweise zu ${candidate.name} wurden aus den hinterlegten Kandidatendaten abgeleitet.`,
        facts: [
          `Partei: ${candidate.partei}`,
          `Beruf: ${candidate.beruf}`,
          `Positionen: ${(candidate.positionen || []).slice(0, 3).join(' · ') || 'Keine Positionen hinterlegt'}`,
        ],
        pros: ['Direkter Datensatzbezug aus der aktuellen Wahlansicht.'],
        cons: ['Profil kann unvollständig sein, falls keine Primärquellen hinterlegt sind.'],
        uncertainty: 'Ohne verifizierte Quellen ist die Aussage nur als Zwischenstand zu lesen.',
        sources: candidateSources,
      });
    }

    return buildStructuredResponse({
      core: 'Für diese Frage liegt aktuell keine verifizierte, belastbare Datenbasis in Clara vor.',
      facts: [
        'Strict-Evidence-Modus aktiv: keine Antwort ohne prüfbare Datenquelle.',
        'Bitte frage konkret nach Partei, Wahlsystem oder einer Person aus der aktuellen Wahl.',
      ],
      pros: ['Reduziert Halluzinationen, da ungesicherte Aussagen blockiert werden.'],
      cons: ['Antwortumfang ist bei fehlenden Quellen bewusst eingeschränkt.'],
      uncertainty: 'Es erfolgt keine freie Generierung ohne Evidenz.',
      sources: ['Clara Strict-Evidence-Modus (intern)'],
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ClaraMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simuliere KI-Verarbeitungszeit
    setTimeout(() => {
      const response = getClaraResponse(inputMessage);
      const claraMessage: ClaraMessage = {
        id: (Date.now() + 1).toString(),
        type: 'clara',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources
      };

      setMessages(prev => [...prev, claraMessage]);
      setIsTyping(false);
      
      // Punkte vergeben für Clara-Nutzung
      onPointsEarned(5);
    }, 1500);
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
        'Erststimme oder Zweitstimme - was ist wichtiger?',
        'Was plant die GRÜNE für Klimaschutz?'
      ]
    : level === 'land'
    ? [
        'Was ist das Programm der SPD?',
        'Was ist das Programm der CDU?',
        'Was ist das Programm der GRÜNEN?',
        'Was ist das Programm der FDP?',
        'Was ist das Programm der AfD?',
        'Was ist das Programm der Linken?',
        'Wer ist Anke Rehlinger?',
        'Wie funktioniert das Wahlsystem?',
        'Was sind die Unterschiede zwischen den Kandidaten?'
      ]
    : [
        'Was ist das Programm der SPD?',
        'Was ist das Programm der CDU?',
        'Was ist das Programm der GRÜNEN?',
        'Was ist das Programm der FDP?',
        'Was ist das Programm der AfD?',
        'Was ist das Programm der Linken?',
        'Wie funktioniert die Kommunalwahl?',
        'Was macht ein Gemeinderat?',
        'Welche Themen sind in meiner Kommune wichtig?'
      ];

  return (
    <div className="rounded-xl shadow-xl border-2 flex h-full min-h-0 flex-col overflow-hidden" style={{ borderColor: '#8B5CF6', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)' }}>
      {/* Header – Neutralität + Quellen, kein Beraten */}
      <div
        className="p-3 rounded-t-xl text-white border-b border-white/20 flex-shrink-0"
        style={{
          background: LAVENDER.header,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 20px rgba(76, 29, 149, 0.3)',
        }}
      >
        <h2 className="text-base font-bold">Clara – KI-Assistent</h2>
        <p className="text-xs opacity-95 mt-0.5">Quellenbasiert • nachvollziehbar • transparent</p>
        <p className="text-[10px] mt-1 inline-flex rounded-full bg-white/20 px-2 py-0.5">
          Strict Evidence: ON
        </p>
        <p className="text-[11px] opacity-90 mt-1 leading-tight">
          <strong>Neutral – gibt keine Beratung oder Wahlempfehlung.</strong> Clara informiert nur auf Basis von Quellen. Jede Antwort verweist auf angegebene Quellen; bitte Original-Dokumente prüfen.
        </p>
        <p className="text-[10px] opacity-80 mt-0.5">KI-System gemäß EU AI Act.</p>
      </div>

      {/* Messages – scrollbar, nicht abgeschnitten */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4" style={{ background: LAVENDER.bg }}>
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
                ) : (
                  <div className="text-sm whitespace-pre-line break-words">{message.content}</div>
                )}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t text-xs break-words" style={{ borderColor: LAVENDER.border }}>
                    <span className="font-semibold" style={{ color: LAVENDER.text }}>Quellenverweis:</span>
                    {message.sources.map((source, index) => renderSource(source, index))}
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
      <div className="px-4 py-2 border-t flex-shrink-0" style={{ borderColor: LAVENDER.border, background: LAVENDER.bg }}>
        <div className="text-xs text-gray-500 mb-2">Schnelle Fragen:</div>
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {quickQuestions.slice(0, 6).map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="text-xs px-2 py-1 rounded-full transition-colors shrink-0"
              style={{ background: LAVENDER.bubble, color: LAVENDER.text }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input + Sprechen */}
      <div className="p-4 border-t flex-shrink-0" style={{ borderColor: LAVENDER.border }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Frag Clara: Was sagt die SPD zum Thema Wohnen?"
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: LAVENDER.border, background: LAVENDER.bg }}
            aria-label="Nachricht an Clara"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-3 text-white rounded-lg font-bold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={!inputMessage.trim() || isTyping ? { backgroundColor: LAVENDER.border } : { ...IRIDESCENT_BUTTON, color: LAVENDER.text }}
          >
            Senden
          </button>
          <button
            onClick={() => setShowVoice(true)}
            className="px-4 py-3 rounded-lg font-bold transition-all hover:shadow-lg"
            style={{ ...IRIDESCENT_BUTTON, color: LAVENDER.text }}
          >
            Sprechen
          </button>
        </div>
      </div>

      {/* Wichtig: Neutral, keine Beratung, nur Quellen */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="rounded-lg p-3 text-[11px] leading-snug" style={{ background: LAVENDER.bubble, color: LAVENDER.text, border: `1px solid ${LAVENDER.border}` }}>
          <strong>Neutral – keine Wahlempfehlung:</strong> Clara berät nicht und gibt keine Empfehlung ab. Sie informiert ausschließlich auf Basis der angegebenen Quellen. Bitte prüfen Sie die Original-Dokumente. KI-Agent gemäß EU AI Act.
        </div>
      </div>

      {showVoice && (
        <ClaraVoiceInterface
          isOpen={showVoice}
          onClose={() => setShowVoice(false)}
          currentCard={null}
        />
      )}
    </div>
  );
};

export default ClaraChat;