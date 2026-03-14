import React, { useState, useRef, useEffect } from 'react';
import { WAHLEN_DATA } from '@/data/constants';
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

  // Hole Parteiprogramm aus WAHLEN_DATA
  const getParteiprogramm = (parteiName: string): string | null => {
    // Finde die aktuelle Wahl
    const wahl = selectedWahl || WAHLEN_DATA.find(w => 
      (level === 'bund' && w.level === 'bund') ||
      (level === 'land' && w.level === 'land') ||
      (level === 'kommune' && w.level === 'kommune')
    );
    
    if (!wahl || !wahl.parteien) return null;
    
    // Normalisiere Parteinamen für Suche
    const parteiMap: Record<string, string[]> = {
      'spd': ['SPD', 'spd', 'sozialdemokrat'],
      'cdu': ['CDU', 'cdu', 'csu', 'christlich demokratisch'],
      'grüne': ['GRÜNE', 'grüne', 'grünen', 'bündnis 90', 'b90'],
      'fdp': ['FDP', 'fdp', 'freie demokratische'],
      'linke': ['DIE LINKE', 'linke', 'die linke'],
      'afd': ['AfD', 'afd', 'alternative für deutschland']
    };
    
    const parteiKey = Object.keys(parteiMap).find(key => 
      parteiMap[key].some(alias => parteiName.toLowerCase().includes(alias))
    );
    
    if (!parteiKey) return null;
    
    const partei = wahl.parteien.find((p: { name: string }) => 
      parteiMap[parteiKey].some(alias => 
        p.name.toLowerCase().includes(alias.toLowerCase()) ||
        p.name === alias
      )
    );
    
    return partei?.programm || null;
  };

  // KI-Antworten basierend auf Level und Frage
  const getClaraResponse = (question: string): { content: string; sources: string[] } => {
    const lowerQuestion = question.toLowerCase();
    
    // Prüfe auf Anfragen nach Parteiprogrammen
    const parteiProgrammKeywords = ['programm', 'wahlprogramm', 'parteiprogramm', 'was plant', 'positionen', 'ziele', 'was will', 'was sagt'];
    const parteiNamen = ['spd', 'cdu', 'csu', 'grüne', 'grünen', 'fdp', 'linke', 'afd'];
    
    const fragtNachProgramm = parteiProgrammKeywords.some(keyword => lowerQuestion.includes(keyword));
    const fragtNachPartei = parteiNamen.some(partei => lowerQuestion.includes(partei));
    
    if (fragtNachProgramm && fragtNachPartei) {
      const partei = parteiNamen.find(p => lowerQuestion.includes(p));
      if (partei) {
        const programm = getParteiprogramm(partei);
        if (programm) {
          const parteiName = partei.toUpperCase() === 'GRÜNE' ? 'GRÜNE' : 
                            partei.toUpperCase() === 'LINKE' ? 'DIE LINKE' : 
                            partei.toUpperCase();
          
          // Finde die aktuelle Wahl für Quellen
          const wahl = selectedWahl || WAHLEN_DATA.find(w => 
            (level === 'bund' && w.level === 'bund') ||
            (level === 'land' && w.level === 'land') ||
            (level === 'kommune' && w.level === 'kommune')
          );
          
          // Formatierte Antwort mit ARIA-Box-Style
          const formattedContent = `ARIA EXECUTIVE INTELLIGENCE\n\nKEY INSIGHT: Parteiprogramm der ${parteiName} für ${wahl?.name || 'diese Wahl'}\n\n${programm}\n\nDies ist der originale Inhalt des Wahlprogramms im KI-Style. Für detaillierte Informationen empfehle ich, das vollständige Wahlprogramm auf der offiziellen Website zu lesen.`;
          
          return {
            content: formattedContent,
            sources: [`${parteiName}-Wahlprogramm 2025`, `Offizielle Website der ${parteiName}`, wahl?.name || 'Aktuelle Wahl']
          };
        }
      }
    }
    
    // Bundestagswahl-spezifische Antworten
    if (level === 'bund') {
      // SPD-spezifische Antworten
      if (lowerQuestion.includes('spd')) {
        if (lowerQuestion.includes('wohnen') || lowerQuestion.includes('miete')) {
          return {
            content: 'Die SPD will die Mietpreisbremse verschärfen und 400.000 neue Wohnungen pro Jahr bauen. Sie plant eine Spekulationssteuer auf Immobilien und will Bauland für sozialen Wohnungsbau reservieren. Der Fokus liegt auf bezahlbarem Wohnraum für alle.',
            sources: ['SPD-Wahlprogramm 2025, S. 34-38', 'SPD-Positionspapier Wohnen 2024']
          };
        }
        if (lowerQuestion.includes('klima') || lowerQuestion.includes('umwelt')) {
          return {
            content: 'Die SPD setzt auf Klimaneutralität bis 2045, beschleunigte Energiewende und sozialverträgliche Klimapolitik. Sie plant Investitionen in erneuerbare Energien und eine CO2-Bepreisung mit sozialem Ausgleich.',
            sources: ['SPD-Wahlprogramm 2025, S. 22-28', 'SPD-Klimakonzept 2024']
          };
        }
        return {
          content: 'Die SPD ist eine sozialdemokratische Partei mit Fokus auf soziale Gerechtigkeit, Mindestlohn 15€, bezahlbares Wohnen und Klimaschutz. Sie setzt sich für eine gerechte Verteilung von Wohlstand und Chancen ein.',
          sources: ['SPD-Wahlprogramm 2025', 'SPD-Grundsatzprogramm']
        };
      }
      
      // CDU/CSU-spezifische Antworten
      if (lowerQuestion.includes('cdu') || lowerQuestion.includes('csu')) {
        if (lowerQuestion.includes('wirtschaft') || lowerQuestion.includes('steuer')) {
          return {
            content: 'Die CDU möchte die Wirtschaft durch Steuerentlastungen stärken und Bürokratie abbauen. Sie plant eine Entlastung bei der Einkommensteuer und will den Mittelstand fördern. Digitalisierung und Innovation stehen im Fokus.',
            sources: ['CDU-Wahlprogramm 2025, S. 12-15', 'CDU-Wirtschaftskonzept 2024']
          };
        }
        if (lowerQuestion.includes('klima') || lowerQuestion.includes('umwelt')) {
          return {
            content: 'Die CDU setzt auf Klimaneutralität bis 2045 mit technologieoffenem Ansatz. Sie fördert erneuerbare Energien, Wasserstoff-Technologie und setzt auf Innovation statt Verbote.',
            sources: ['CDU-Wahlprogramm 2025, S. 18-22', 'CDU-Klimastrategie 2024']
          };
        }
        return {
          content: 'Die CDU/CSU ist eine konservative Partei mit Fokus auf Wirtschaftswachstum, Familienpolitik und innere Sicherheit. Steuerentlastungen und Bürokratieabbau stehen im Vordergrund.',
          sources: ['CDU-Wahlprogramm 2025', 'CDU-Grundsatzprogramm']
        };
      }
      
      // GRÜNE-spezifische Antworten
      if (lowerQuestion.includes('grüne') || lowerQuestion.includes('grünen')) {
        if (lowerQuestion.includes('klima') || lowerQuestion.includes('energie')) {
          return {
            content: 'Die Grünen fordern Klimaneutralität bis 2035 und einen massiven Ausbau erneuerbarer Energien. Sie wollen den Kohleausstieg beschleunigen und eine CO2-Steuer einführen. Der Fokus liegt auf nachhaltiger Transformation.',
            sources: ['Grünes Wahlprogramm 2025, S. 8-12', 'Grüne Klimakonzept 2024']
          };
        }
        if (lowerQuestion.includes('sozial') || lowerQuestion.includes('gerechtigkeit')) {
          return {
            content: 'Die Grünen verbinden Klimaschutz mit sozialer Gerechtigkeit. Sie fordern mehr Investitionen in Bildung, bezahlbares Wohnen und eine gerechte Verteilung von Klimakosten.',
            sources: ['Grünes Wahlprogramm 2025, S. 32-38', 'Grüne Sozialprogramm 2024']
          };
        }
        return {
          content: 'Die Grünen sind eine ökologische Partei mit Fokus auf Klimaschutz, Nachhaltigkeit und soziale Gerechtigkeit. Klimaneutralität 2035, Energiewende und soziale Gerechtigkeit sind zentrale Ziele.',
          sources: ['Grünes Wahlprogramm 2025', 'Grünes Grundsatzprogramm']
        };
      }
      
      // FDP-spezifische Antworten
      if (lowerQuestion.includes('fdp')) {
        if (lowerQuestion.includes('wirtschaft') || lowerQuestion.includes('digital')) {
          return {
            content: 'Die FDP setzt auf Wirtschaftsfreiheit, Digitalisierung und Innovation. Sie will Bürokratie abbauen, Start-ups fördern und die digitale Infrastruktur ausbauen. Bildung und Forschung stehen im Fokus.',
            sources: ['FDP-Wahlprogramm 2025, S. 14-18', 'FDP-Digitalisierungsstrategie 2024']
          };
        }
        return {
          content: 'Die FDP ist eine liberale Partei mit Schwerpunkt auf Wirtschaftsfreiheit und Bildung. Digitalisierung, Innovation und Bürokratieabbau stehen im Fokus.',
          sources: ['FDP-Wahlprogramm 2025', 'FDP-Grundsatzprogramm']
        };
      }
      
      // DIE LINKE
      if (lowerQuestion.includes('linke')) {
        return {
          content: 'DIE LINKE ist eine linke Partei mit Fokus auf soziale Gerechtigkeit und Umverteilung. Mindestlohn, Mietpreisbremse und Friedenspolitik sind Hauptthemen.',
          sources: ['DIE LINKE Wahlprogramm 2025', 'DIE LINKE Grundsatzprogramm']
        };
      }
      
      // AfD
      if (lowerQuestion.includes('afd')) {
        return {
          content: 'Die AfD ist eine rechtspopulistische Partei mit Fokus auf Migration, nationale Souveränität und EU-Kritik. Sie setzt sich für strengere Einwanderungspolitik ein.',
          sources: ['AfD-Wahlprogramm 2025', 'AfD-Positionspapiere']
        };
      }
    }

    // Landtagswahl Saarland-spezifische Antworten
    if (level === 'land') {
      if (lowerQuestion.includes('rehlinger') || lowerQuestion.includes('spd')) {
        return {
          content: 'Anke Rehlinger ist seit 2022 Ministerpräsidentin des Saarlandes. Sie führte die SPD zur absoluten Mehrheit und setzt sich für Digitalisierung, Klimaschutz und soziale Gerechtigkeit ein. Ihre Schwerpunkte sind Bildung und Wirtschaftsförderung.',
          sources: ['Saarland-SPD Programm 2027', 'Rehlinger Biografie 2024']
        };
      }
      
      if (lowerQuestion.includes('wirth') || lowerQuestion.includes('cdu')) {
        return {
          content: 'Christian Wirth ist CDU-Landeschef im Saarland und will Rehlinger bei der nächsten Landtagswahl herausfordern. Er setzt auf Wirtschaftsförderung, Familienpolitik und Sicherheit. Seine Erfahrung als ehemaliger Innenminister prägt seine Positionen.',
          sources: ['Saarland-CDU Programm 2027', 'Wirth Positionspapiere 2024']
        };
      }
    }

    // Kommunalwahl-spezifische Antworten
    if (level === 'kommune') {
      if (lowerQuestion.includes('müller') || lowerQuestion.includes('klaus')) {
        return {
          content: 'Klaus Müller ist erfahrener Gemeinderat seit 2019 mit Fokus auf Infrastruktur und Gemeinschaftsprojekte. Er engagiert sich besonders für die Mehrzweckhalle, Radwege und Ortskernsanierung in Kirkel.',
          sources: ['Gemeinderatsprotokolle 2019-2025', 'Wahlprogramm SPD Kirkel']
        };
      }
      
      if (lowerQuestion.includes('schmidt') || lowerQuestion.includes('petra')) {
        return {
          content: 'Petra Schmidt ist langjährige Gemeinderätin seit 2015 mit Schwerpunkt auf Finanzen und Haushalt. Sie setzt auf verantwortungsvolle Haushaltspolitik und Wirtschaftsförderung.',
          sources: ['Gemeinderatsprotokolle 2015-2025', 'Wahlprogramm CDU Kirkel']
        };
      }
      
      if (lowerQuestion.includes('hoffmann') || lowerQuestion.includes('michael')) {
        return {
          content: 'Michael Hoffmann ist neuer Kandidat mit Fokus auf Klimaschutz und Nachhaltigkeit auf kommunaler Ebene. Er engagiert sich für Radwege, Bürgergärten und LED-Beleuchtung in Kirkel.',
          sources: ['Wahlprogramm GRÜNE Kirkel', 'Klimaschutzkonzept Gemeinde Kirkel']
        };
      }
      
      if (lowerQuestion.includes('weber') || lowerQuestion.includes('anna') || lowerQuestion.includes('unabhängig')) {
        return {
          content: 'Anna Weber ist unabhängige Gemeinderätin ohne Parteibindung seit 2019. Sie setzt auf parteiübergreifende Lösungen, Transparenz und direkte Bürgerbeteiligung.',
          sources: ['Wahlprogramm Unabhängige Liste Kirkel', 'Gemeinderatsprotokolle']
        };
      }
      
      if (lowerQuestion.includes('klein') || lowerQuestion.includes('thomas')) {
        return {
          content: 'Thomas Klein ist neuer Kandidat mit wirtschaftsliberalem Ansatz. Sein Fokus liegt auf Digitalisierung, Wirtschaftsförderung und Bürokratieabbau auf kommunaler Ebene.',
          sources: ['Wahlprogramm FDP Kirkel', 'Wirtschaftskonzept']
        };
      }
      
      if (lowerQuestion.includes('kommunal') || lowerQuestion.includes('gemeinde') || lowerQuestion.includes('kirkel')) {
        return {
          content: 'Die Kommunalwahl in Kirkel entscheidet über den Gemeinderat und die Verbandsgemeinde. Wichtige Themen sind: Infrastruktur (Mehrzweckhalle, Radwege), Finanzen, Klimaschutz und Bürgerbeteiligung. Du kannst einen Kandidaten wählen, der deine lokalen Prioritäten vertritt.',
          sources: ['Wahlhilfe Gemeinde Kirkel', 'Kommunalwahlrecht Saarland']
        };
      }
    }

    // Allgemeine Antworten
    if (lowerQuestion.includes('wahlsystem') || lowerQuestion.includes('wie funktioniert')) {
      return {
        content: 'Das deutsche Wahlsystem ist ein personalisiertes Verhältniswahlrecht. Du hast zwei Stimmen: Die Erststimme für den Direktkandidaten deines Wahlkreises und die Zweitstimme für die Partei. Die Zweitstimme entscheidet über die Sitzverteilung im Bundestag.',
        sources: ['Bundeswahlgesetz § 1', 'Bundeszentrale für politische Bildung']
      };
    }

    if (lowerQuestion.includes('erststimme') || lowerQuestion.includes('zweitstimme')) {
      return {
        content: 'Die Erststimme wählst du einen Direktkandidaten aus deinem Wahlkreis. Die Zweitstimme wählst du eine Partei und entscheidest damit über die Sitzverteilung im Bundestag. Beide Stimmen sind gleich wichtig!',
        sources: ['Bundeswahlgesetz § 6', 'Wahlhilfe des Bundeswahlleiters']
      };
    }

    // Fallback-Antwort
    return {
      content: 'Das ist eine interessante Frage! Ich kann dir gerne bei spezifischen Themen helfen. Du kannst mich nach Wahlprogrammen, Kandidaten-Informationen oder dem Wahlsystem fragen. Versuche es mit konkreteren Begriffen wie "SPD Wohnen" oder "CDU Wirtschaft".',
      sources: ['Clara KI-Assistent', 'eIDConnect Hilfe']
    };
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
        'Wie funktioniert das Wahlsystem?',
        'Erststimme oder Zweitstimme - was ist wichtiger?',
        'Was plant die GRÜNE für Klimaschutz?'
      ]
    : level === 'land'
    ? [
        'Was ist das Programm der SPD?',
        'Was ist das Programm der CDU?',
        'Was ist das Programm der GRÜNEN?',
        'Wer ist Anke Rehlinger?',
        'Wie funktioniert das Wahlsystem?',
        'Was sind die Unterschiede zwischen den Kandidaten?'
      ]
    : [
        'Was ist das Programm der SPD?',
        'Was ist das Programm der CDU?',
        'Was ist das Programm der GRÜNEN?',
        'Wie funktioniert die Kommunalwahl?',
        'Was macht ein Gemeinderat?',
        'Welche Themen sind in Kirkel wichtig?'
      ];

  return (
    <div className="rounded-xl shadow-xl border-2 flex flex-col overflow-hidden min-h-0 h-full max-h-[85vh]" style={{ borderColor: '#8B5CF6', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)' }}>
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
      <div className="px-4 py-2 border-t flex-shrink-0" style={{ borderColor: LAVENDER.border, background: LAVENDER.bg }}>
        <div className="text-xs text-gray-500 mb-2">Schnelle Fragen:</div>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="text-xs px-2 py-1 rounded-full transition-colors"
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