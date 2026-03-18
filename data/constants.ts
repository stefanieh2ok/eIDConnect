import { UserPreferences, VotingData, NewsItem, CalendarEvent, LeaderboardItem, Wahl } from '@/types';
import { WAHLEN_DEUTSCHLAND } from './wahlen-deutschland';

export const PORTFOLIO_COMPANIES = [
  'FinTech Pro AG',
  'DataSync Technologies', 
  'Quantum Security',
  'CloudSync Enterprise',
  'BioGenix Labs',
  'IndustrialAI Corp',
  'GreenEnergy Solutions',
  'MedTech Innovations',
  'LogiNext Solutions',
  'RetailNext Platform',
  'PayFlow Solutions',
  'AI Vision Systems',
  'SecureNet GmbH',
  'WorkflowPro',
  'HealthCore Analytics',
  'MarketPlace Pro'
] as const;

export const THEME_NAMES: Record<keyof UserPreferences, string> = {
  umwelt: 'Umwelt & Klima',
  finanzen: 'Finanzen & Wirtschaft',
  bildung: 'Bildung & Forschung',
  digital: 'Digitalisierung',
  soziales: 'Soziales & Gesundheit',
  sicherheit: 'Sicherheit & Verteidigung'
};

export const VOTING_DATA: Record<string, VotingData> = {
  bundesweit: {
    canVote: true,
    cards: [
      {
        id: 'bw1',
        nummer: 'BT-2025-047',
        title: 'Tempolimit 130 auf Autobahnen',
        deadline: '3 Stunden',
        emoji: '🛣️',
        category: 'Verkehr & Umwelt',
        description: 'Einführung eines generellen Tempolimits von 130 km/h auf deutschen Autobahnen. Erwartete CO₂-Reduktion: 2,2 Mio Tonnen/Jahr.',
        quickFacts: ['2,2 Mio t CO₂/Jahr', '140 Verkehrstote weniger', 'Debatte seit 1973', 'EU empfiehlt 130 km/h'],
        yes: 42, no: 58, abstain: 0,
        votes: 2738947,
        points: 500,
        claraMatch: 72,
        urgent: true,
        regionalResults: [
          { land: 'Bayern', yes: 31, no: 69, trend: 'Stark dagegen' },
          { land: 'Hamburg', yes: 64, no: 36, trend: 'Deutlich dafür' },
          { land: 'NRW', yes: 38, no: 62, trend: 'Dagegen' },
          { land: 'Saarland', yes: 51, no: 49, trend: 'Knapp dafür' }
        ],
        kiAnalysis: {
          pros: [
            { text: 'CO₂-Reduktion von 2,2 Millionen Tonnen jährlich', source: 'Umweltbundesamt 2024 [1]', weight: 94 },
            { text: 'Weniger Verkehrstote durch niedrigere Geschwindigkeiten', source: 'Verkehrssicherheitsrat [2]', weight: 88 }
          ],
          cons: [
            { text: 'Einschränkung freie Fahrt', source: 'ADAC 2024 [3]', weight: 82 },
            { text: 'Längere Transportzeiten', source: 'BDI [4]', weight: 75 }
          ],
          claraEinschätzung: 'Basierend auf Ihrer Umwelt-Priorität (85%) empfehle ich DAFÜR.',
          financialImpact: 'Neutral',
          environmentalImpact: '-2,2 Mio t CO₂/Jahr',
          quellen: ['[1] Umweltbundesamt: Emissionsfaktoren Straßenverkehr, 2024', '[2] Deutscher Verkehrssicherheitsrat: Statistik Verkehrstote, 2024', '[3] ADAC: Tempolimit-Studie, 2024', '[4] BDI: Logistik-Wirtschaft, 2024']
        }
      },
      {
        id: 'bw2',
        nummer: 'BT-2025-051',
        title: 'Vermögenssteuer ab 2 Mio €',
        deadline: '2 Tage',
        emoji: '💰',
        category: 'Finanzen & Steuern',
        description: '1% Vermögenssteuer ab 2 Millionen Euro Nettovermögen. Erwartete Einnahmen: 15-20 Milliarden Euro jährlich.',
        quickFacts: ['1% ab 2 Mio. €', '15-20 Mrd. € Einnahmen', '0,5% Haushalte', 'Ab 2026'],
        yes: 67, no: 33, abstain: 0,
        votes: 4127891,
        points: 500,
        claraMatch: 78,
        regionalResults: [
          { land: 'Berlin', yes: 78, no: 22, trend: 'Sehr stark dafür' },
          { land: 'Hamburg', yes: 71, no: 29, trend: 'Deutlich dafür' },
          { land: 'Bayern', yes: 54, no: 46, trend: 'Knapp dafür' }
        ],
        kiAnalysis: {
          pros: [
            { text: 'Umverteilung Infrastruktur', source: 'DIW 2024 [1]', weight: 90 },
            { text: '15-20 Mrd. € Staatseinnahmen', source: 'BMF [2]', weight: 92 }
          ],
          cons: [
            { text: 'Kapitalflucht', source: 'ifo [3]', weight: 84 }
          ],
          claraEinschätzung: 'Ausgewogene Empfehlung basierend auf Ihrer Präferenz.',
          financialImpact: '+15-20 Mrd. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] DIW Wochenbericht: Vermögensverteilung, 2024', '[2] BMF: Steuerschätzung 2024', '[3] ifo-Institut: Steuerstudie, 2024']
        }
      },
      {
        id: 'bw_j1',
        nummer: 'BT-2025-013',
        title: 'Cannabis-Legalisierung',
        deadline: '1 Monat',
        emoji: '🌿',
        category: 'Gesellschaft & Recht',
        description: 'Legalisierung von Cannabis für Erwachsene ab 21, kontrollierte Abgabe in Fachgeschäften, Entkriminalisierung.',
        quickFacts: ['Ab 21 Jahren', 'Kontrollierte Abgabe', 'Entkriminalisierung', 'März 2025'],
        yes: 62, no: 31, abstain: 7,
        votes: 3894756,
        points: 500,
        claraMatch: 65,
        kiAnalysis: {
          pros: [
            { text: 'Entlastung Justiz', source: 'Bundesjustizministerium [1]', weight: 88 },
            { text: 'Steuereinnahmen 1-2 Mrd. €/Jahr', source: 'ifo [2]', weight: 82 }
          ],
          cons: [
            { text: 'Gesundheitsrisiken', source: 'Drogenbeauftragte [3]', weight: 78 }
          ],
          claraEinschätzung: 'Empfehlung basierend auf Ihrer Präferenz.',
          financialImpact: '+1-2 Mrd. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] BMJV: Cannabis-Gesetzentwurf, 2024', '[2] ifo: Steuerpotenzial Cannabis, 2024', '[3] Drogenbeauftragte: Gesundheitsstudie, 2024']
        }
      },
      {
        id: 'bw_f1',
        nummer: 'BT-2025-028',
        title: 'EU-Migrationspaket',
        deadline: '2 Wochen',
        emoji: '🌍',
        category: 'Migration & Integration',
        description: 'Umsetzung des EU-Migrationspakets: Asylverfahren beschleunigen, Frontex-Ausbau, Rückführungsabkommen.',
        quickFacts: ['Frontex +3000', 'Schnelle Verfahren', 'Rückführungsabkommen', '2025-2027'],
        yes: 53, no: 41, abstain: 6,
        votes: 3421896,
        points: 500,
        claraMatch: 58,
        kiAnalysis: {
          pros: [
            { text: 'Geregelte Migration', source: 'BMI [1]', weight: 85 },
            { text: 'Schnellere Verfahren', source: 'BAMF [2]', weight: 80 }
          ],
          cons: [
            { text: 'Menschenrechte kritisch', source: 'Pro Asyl [3]', weight: 82 }
          ],
          claraEinschätzung: 'Ausgewogene Empfehlung.',
          financialImpact: '+500 Mio. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] BMI: Migrationspaket, 2024', '[2] BAMF: Verfahrensstatistik, 2024', '[3] Pro Asyl: Menschenrechtsbericht, 2024']
        }
      },
      {
        id: 'bw_f2',
        nummer: 'BT-2025-032',
        title: 'Atomkraft-Ausstieg final',
        deadline: '1 Woche',
        emoji: '⚛️',
        category: 'Energie & Umwelt',
        description: 'Finaler Ausstieg aus Atomenergie, Stilllegung aller Meiler bis 2028, Fokus auf Erneuerbare.',
        quickFacts: ['Stilllegung bis 2028', 'Fokus Erneuerbare', 'Endlagersuche', '100% Stromwende'],
        yes: 71, no: 24, abstain: 5,
        votes: 4567892,
        points: 500,
        claraMatch: 89,
        kiAnalysis: {
          pros: [
            { text: 'Kein Atomrisiko', source: 'BMU [1]', weight: 95 },
            { text: 'Erneuerbare Priorität', source: 'Agora [2]', weight: 88 }
          ],
          cons: [
            { text: 'Energiekosten erhöhen sich', source: 'BDEW [3]', weight: 75 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR basierend auf Umwelt-Priorität.',
          financialImpact: '-2 Mrd. €/Jahr',
          environmentalImpact: 'Sicherer +100% EE',
          quellen: ['[1] BMU: Atomausstieg-Plan, 2024', '[2] Agora Energiewende: Stromwende, 2024', '[3] BDEW: Energiekosten-Studie, 2024']
        }
      },
      {
        id: 'bw_m1',
        nummer: 'BT-2025-041',
        title: 'Grundrente Plus',
        deadline: '5 Tage',
        emoji: '👵',
        category: 'Soziales & Rente',
        description: 'Grundrente auf 1.250€ erhöhen, automatische Anpassung an Inflation, erweitertes Wohngeld.',
        quickFacts: ['1.250€ Mindestrente', 'Automatische Anpassung', '+5 Mrd. € Budget', 'Ab 2026'],
        yes: 68, no: 27, abstain: 5,
        votes: 4893176,
        points: 500,
        claraMatch: 76,
        kiAnalysis: {
          pros: [
            { text: 'Altersarmut reduzieren', source: 'DIW [1]', weight: 92 },
            { text: '5 Mrd. € mehr für Rentner', source: 'Bundesamt [2]', weight: 89 }
          ],
          cons: [
            { text: 'Finanzierung unsicher', source: 'ifo [3]', weight: 72 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für soziale Gerechtigkeit.',
          financialImpact: '+5 Mrd. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] DIW: Altersarmut-Studie, 2024', '[2] Bundesamt: Rentenstatistik, 2024', '[3] ifo: Finanzierbarkeit, 2024']
        }
      },
      {
        id: 'bw_a1',
        nummer: 'BT-2025-053',
        title: 'Künstliche Intelligenz Regulierung',
        deadline: '3 Tage',
        emoji: '🤖',
        category: 'Digitalisierung & Technologie',
        description: 'EU-KI-Act umsetzen: Transparenz bei KI-Systemen, Verbot von Sozial-Scoring, Schutz personenbezogener Daten.',
        quickFacts: ['EU-KI-Act', 'Kein Sozial-Scoring', 'Transparenz-Pflicht', '2026'],
        yes: 74, no: 20, abstain: 6,
        votes: 3456789,
        points: 500,
        claraMatch: 71,
        kiAnalysis: {
          pros: [
            { text: 'Bürgerrechte schützen', source: 'BfDI [1]', weight: 91 },
            { text: 'EU-Standard setzen', source: 'BMF [2]', weight: 85 }
          ],
          cons: [
            { text: 'Wettbewerbsnachteil', source: 'Bitkom [3]', weight: 78 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Datenschutz.',
          financialImpact: '-300 Mio. € Compliance',
          environmentalImpact: 'Neutral',
          quellen: ['[1] BfDI: KI-Grundrechte, 2024', '[2] BMF: EU-KI-Act Umsetzung, 2024', '[3] Bitkom: KI-Innovation, 2024']
        }
      },
      {
        id: 'bw_ma1',
        nummer: 'BT-2025-059',
        title: 'Digitales Gesundheitswesen',
        deadline: '1 Woche',
        emoji: '🏥',
        category: 'Gesundheit & Digitalisierung',
        description: 'E-Rezept flächendeckend, Telemedizin ausbauen, Gesundheits-App als Standard, E-Akte für alle.',
        quickFacts: ['E-Rezept bundesweit', 'Telemedizin +50%', 'Gesundheits-App Pflicht', '2025-2026'],
        yes: 66, no: 28, abstain: 6,
        votes: 3876543,
        points: 500,
        claraMatch: 73,
        kiAnalysis: {
          pros: [
            { text: 'Effizientere Behandlung', source: 'BMG [1]', weight: 88 },
            { text: 'Kosten sparen 1 Mrd./Jahr', source: 'RWI [2]', weight: 82 }
          ],
          cons: [
            { text: 'Datenschutz-Risiko', source: 'BfDI [3]', weight: 76 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für moderne Medizin.',
          financialImpact: '-1 Mrd. €/Jahr',
          environmentalImpact: 'Weniger Papier',
          quellen: ['[1] BMG: Digitalisierungsstrategie, 2024', '[2] RWI: Gesundheitseffizienz, 2024', '[3] BfDI: Datenschutz Gesundheit, 2024']
        }
      },
      {
        id: 'bw_ma2',
        nummer: 'BT-2025-062',
        title: 'CO2-Abgabe für Industrie',
        deadline: '2 Tage',
        emoji: '🏭',
        category: 'Umwelt & Wirtschaft',
        description: 'CO2-Preis auf 65€/Tonne erhöhen, Industrie einbeziehen, Ausgleich für energieintensive Betriebe.',
        quickFacts: ['65€/t CO2', 'Industrie einbezogen', 'Klimaziel 2030', '2 Mrd. € Einnahmen'],
        yes: 58, no: 35, abstain: 7,
        votes: 4123456,
        points: 500,
        claraMatch: 82,
        kiAnalysis: {
          pros: [
            { text: 'Klimaziel 2030 erreichen', source: 'BMU [1]', weight: 93 },
            { text: 'Emissionsreduktion 2 Mt CO2', source: 'UBA [2]', weight: 89 }
          ],
          cons: [
            { text: 'Industrie belastet', source: 'BDI [3]', weight: 79 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR für Klimaschutz.',
          financialImpact: '+2 Mrd. €/Jahr',
          environmentalImpact: '-2 Mio t CO2/Jahr',
          quellen: ['[1] BMU: Klimaziel 2030, 2024', '[2] UBA: Emissionshandel, 2024', '[3] BDI: Industrie-Kosten, 2024']
        }
      },
      {
        id: 'bw_ju1',
        nummer: 'BT-2025-065',
        title: 'Arbeitszeit-4-Tage-Woche',
        deadline: '3 Wochen',
        emoji: '⏰',
        category: 'Arbeit & Gesellschaft',
        description: 'Modellversuch 4-Tage-Woche: 32h bei vollem Lohn, Produktivitätstests, Ausweitung auf alle Sektoren.',
        quickFacts: ['32h bei vollem Lohn', 'Pilot: 200 Betriebe', '2 Jahre Modellphase', 'Produktivitätstest'],
        yes: 64, no: 30, abstain: 6,
        votes: 4567234,
        points: 500,
        claraMatch: 69,
        kiAnalysis: {
          pros: [
            { text: 'Bessere Work-Life-Balance', source: 'IAO [1]', weight: 88 },
            { text: 'Gleiche Produktivität', source: 'ISW [2]', weight: 85 }
          ],
          cons: [
            { text: 'Kosten für Betriebe', source: 'IW [3]', weight: 77 }
          ],
          claraEinschätzung: 'Empfehlung für bessere Lebensqualität.',
          financialImpact: '-500 Mio. €/Jahr',
          environmentalImpact: 'Weniger Verkehr',
          quellen: ['[1] IAO: Arbeitszeitstudie, 2024', '[2] ISW: Produktivitätsforschung, 2024', '[3] IW Köln: Kostenanalyse, 2024']
        }
      },
      {
        id: 'bw_au1',
        nummer: 'BT-2025-071',
        title: 'Bildung-Digitalisierung',
        deadline: '1 Monat',
        emoji: '💻',
        category: 'Bildung & Digitalisierung',
        description: 'Alle Schulen digital ausstatten: Laptops für Schüler, Lehrer-Fortbildung, Cloud-Plattform, E-Learning-Standard.',
        quickFacts: ['Laptop für alle Schüler', 'Cloud-Plattform', '5 Mrd. € Investition', '2025-2028'],
        yes: 81, no: 14, abstain: 5,
        votes: 5234567,
        points: 500,
        claraMatch: 75,
        kiAnalysis: {
          pros: [
            { text: 'Gleiche Bildungschancen', source: 'KMK [1]', weight: 94 },
            { text: 'Zukunftsfähige Schulen', source: 'BMBF [2]', weight: 90 }
          ],
          cons: [
            { text: 'Hohe Investitionskosten', source: 'ifo [3]', weight: 72 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR für Bildung.',
          financialImpact: '5 Mrd. € Investition',
          environmentalImpact: 'Digitalisierung',
          quellen: ['[1] KMK: Digitalpakt Schule, 2024', '[2] BMBF: Bildung 4.0, 2024', '[3] ifo: Investitionskosten, 2024']
        }
      },
      {
        id: 'bw_s1',
        nummer: 'BT-2025-078',
        title: 'Sozialwohnungen-Investition',
        deadline: '2 Wochen',
        emoji: '🏘️',
        category: 'Wohnen & Soziales',
        description: '200.000 neue Sozialwohnungen bis 2030, 8 Mrd. € Investition, Mieter:innen-Schutz verstärken.',
        quickFacts: ['200.000 Wohnungen', '8 Mrd. € Budget', 'Bis 2030', 'Mieter:innen-Schutz'],
        yes: 76, no: 19, abstain: 5,
        votes: 4987654,
        points: 500,
        claraMatch: 84,
        kiAnalysis: {
          pros: [
            { text: 'Wohnungsnot lindern', source: 'BMBU [1]', weight: 93 },
            { text: 'Bezahlbares Wohnen', source: 'DIW [2]', weight: 90 }
          ],
          cons: [
            { text: 'Steigende Baukosten', source: 'ZDB [3]', weight: 78 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR für soziale Gerechtigkeit.',
          financialImpact: '8 Mrd. € Investition',
          environmentalImpact: 'Klimaneutraler Bau',
          quellen: ['[1] BMBU: Wohnungsbau-Statistik, 2024', '[2] DIW: Wohnungsmarkt, 2024', '[3] ZDB: Baukostenindex, 2024']
        }
      },
      {
        id: 'bw_s2',
        nummer: 'BT-2025-081',
        title: 'E-Auto-Förderung',
        deadline: '4 Tage',
        emoji: '🚗',
        category: 'Verkehr & Umwelt',
        description: 'E-Auto-Prämie verlängern, Ladeinfrastruktur ausbauen, 1 Mio. Ladepunkte bis 2030, Aus für Verbrenner 2035.',
        quickFacts: ['6.000€ Prämie verlängert', '1 Mio. Ladepunkte', 'Verbrenner-Aus 2035', '2,5 Mrd. €'],
        yes: 72, no: 23, abstain: 5,
        votes: 4678321,
        points: 500,
        claraMatch: 88,
        kiAnalysis: {
          pros: [
            { text: 'Klimaneutraler Verkehr', source: 'BMU [1]', weight: 94 },
            { text: 'CO2-Reduktion 10 Mt', source: 'UBA [2]', weight: 91 }
          ],
          cons: [
            { text: 'Strombedarf steigt', source: 'Agora [3]', weight: 75 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR für Klimaschutz.',
          financialImpact: '2,5 Mrd. €/Jahr',
          environmentalImpact: '-10 Mio t CO2/Jahr',
          quellen: ['[1] BMU: Verkehrswende, 2024', '[2] UBA: E-Mobilität, 2024', '[3] Agora: Strombedarf 2030, 2024']
        }
      },
      {
        id: 'bw_n1',
        nummer: 'BT-2025-087',
        title: 'Klima-Fonds EU',
        deadline: '5 Tage',
        emoji: '🌱',
        category: 'Umwelt & Finanzen',
        description: 'Klima-Fonds der EU unterstützen: 100 Mrd. € für saubere Technologien, Green Deal finanzieren.',
        quickFacts: ['100 Mrd. € EU-Fonds', 'Green Deal', 'Saubere Technologien', '2025-2030'],
        yes: 79, no: 16, abstain: 5,
        votes: 5123456,
        points: 500,
        claraMatch: 91,
        kiAnalysis: {
          pros: [
            { text: 'Klimaneutralität vorantreiben', source: 'EU-Kommission [1]', weight: 96 },
            { text: 'Innovation fördern', source: 'BMBF [2]', weight: 89 }
          ],
          cons: [
            { text: 'EU-Abhängigkeit', source: 'IW [3]', weight: 68 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR.',
          financialImpact: '+15 Mrd. € EU-Mittel',
          environmentalImpact: '-50 Mio t CO2/Jahr',
          quellen: ['[1] EU-Kommission: Green Deal, 2024', '[2] BMBF: Klima-Innovation, 2024', '[3] IW: EU-Abhängigkeit, 2024']
        }
      },
      {
        id: 'bw_d1',
        nummer: 'BT-2025-092',
        title: 'Arbeitnehmerrechte EU',
        deadline: '1 Woche',
        emoji: '👷',
        category: 'Arbeit & Europa',
        description: 'EU-Richtlinie Arbeitnehmerrechte umsetzen: Mindestlohn 60% Medianlohn, Plattform-Arbeit regulieren.',
        quickFacts: ['EU-Mindestlohn', 'Plattform-Arbeit reguliert', '60% Median', '2026'],
        yes: 82, no: 13, abstain: 5,
        votes: 4897654,
        points: 500,
        claraMatch: 74,
        kiAnalysis: {
          pros: [
            { text: 'Faire Löhne EU-weit', source: 'EU-Kommission [1]', weight: 90 },
            { text: 'Würdige Arbeit', source: 'DGB [2]', weight: 88 }
          ],
          cons: [
            { text: 'Bürokratie', source: 'BDI [3]', weight: 70 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Gerechtigkeit.',
          financialImpact: '+500 Mio. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] EU-Kommission: Arbeitnehmerrechte, 2024', '[2] DGB: Mindestlohn-Studie, 2024', '[3] BDI: Bürokratie-Kosten, 2024']
        }
      },
      {
        id: 'bw_d2',
        nummer: 'BT-2025-095',
        title: 'Klimaneutralität 2040',
        deadline: '2 Tage',
        emoji: '🌍',
        category: 'Umwelt & Klima',
        description: 'Klimaneutralität auf 2040 vorziehen (statt 2045), ambitioniertes Klimaziel mit konkreten Maßnahmen.',
        quickFacts: ['Klimaneutral 2040', 'Nachhaltige Wirtschaft', 'Energiewende', 'CO2-Null'],
        yes: 68, no: 27, abstain: 5,
        votes: 5234897,
        points: 500,
        claraMatch: 95,
        kiAnalysis: {
          pros: [
            { text: 'Klima-Vorreiter', source: 'BMU [1]', weight: 97 },
            { text: '55% Emissionsreduktion', source: 'UBA [2]', weight: 94 }
          ],
          cons: [
            { text: 'Wirtschaft belastet', source: 'BDI [3]', weight: 79 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR!',
          financialImpact: '50 Mrd. € Investition',
          environmentalImpact: '-500 Mio t CO2',
          quellen: ['[1] BMU: Klimaneutralität 2040, 2024', '[2] UBA: Emissionspfad, 2024', '[3] BDI: Wirtschaftskosten, 2024']
        }
      }
    ],
    vergangen: [
      {
        id: 'bw_v1',
        nummer: 'BT-2025-012',
        title: '365€ Deutschlandticket',
        datum: '15.09.2025',
        ergebnis: 'Angenommen',
        yes: 71, no: 26, abstain: 3,
        votes: 5847392,
        regionalResults: [
          { land: 'Berlin', yes: 84, no: 16 },
          { land: 'Bayern', yes: 63, no: 37 },
          { land: 'Saarland', yes: 76, no: 24 }
        ]
      }
    ]
  },
  saarland: {
    canVote: true,
    cards: [
      {
        id: 'sl1',
        nummer: 'SL-2025-023',
        title: 'Windpark-Erweiterung Höcherberg',
        deadline: '3 Stunden',
        emoji: '🌬️',
        category: 'Umwelt & Energie',
        description: '12 Windkraftanlagen (bisher 7), 35 MW zusätzliche Leistung, 87 GWh/Jahr.',
        quickFacts: ['35.000t CO₂/Jahr', '280 Arbeitsplätze', '50€ Bürgerdividende', '2,8 ha Wald'],
        yes: 58, no: 37, abstain: 5,
        votes: 58394,
        points: 150,
        claraMatch: 87,
        urgent: true,
        regionalResults: [
          { land: 'Landkreis Neunkirchen', yes: 62, no: 38, trend: 'Dafür' },
          { land: 'Landkreis Saarlouis', yes: 54, no: 46, trend: 'Knapp dafür' }
        ],
        kiAnalysis: {
          pros: [
            { text: 'CO₂-Einsparung 35.000t/Jahr', source: 'UBA 2024 [1]', weight: 95 },
            { text: 'Bürgerdividende Akzeptanz', source: 'Fraunhofer [2]', weight: 85 }
          ],
          cons: [
            { text: 'Lärm 340 Anwohner', source: 'TÜV [3]', weight: 72 }
          ],
          claraEinschätzung: 'Starke Empfehlung basierend auf Umwelt-Priorität.',
          financialImpact: '+50€/Jahr',
          environmentalImpact: '-35.000t CO₂/Jahr',
          quellen: ['[1] Umweltbundesamt: Windenergie-Ausbau, 2024', '[2] Fraunhofer ISE: Bürgerenergie, 2024', '[3] TÜV: Lärmgutachten, 2024']
        }
      },
      {
        id: 'sl_j1',
        nummer: 'SL-2025-012',
        title: 'Ausbau Bahnstrecke Saarbrücken-Luxemburg',
        deadline: '1 Monat',
        emoji: '🚂',
        category: 'Verkehr & Infrastruktur',
        description: 'Bahnstrecke elektrifizieren, Taktung auf 30 Min. erhöhen, Grenzübergang optimieren.',
        quickFacts: ['Elektrifizierung', '30 Min. Takt', '1,5 Mrd. €', '2026-2028'],
        yes: 71, no: 24, abstain: 5,
        votes: 89234,
        points: 150,
        claraMatch: 73,
        kiAnalysis: {
          pros: [
            { text: 'CO2-Reduktion 25.000t/Jahr', source: 'DB [1]', weight: 92 },
            { text: 'Mehr Pendler nutzen Bahn', source: 'Landesverkehr [2]', weight: 85 }
          ],
          cons: [
            { text: '1,5 Mrd. € Investition', source: 'Finanzministerium [3]', weight: 79 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für nachhaltigen Verkehr.',
          financialImpact: '1,5 Mrd. € Investition',
          environmentalImpact: '-25.000t CO₂/Jahr',
          quellen: ['[1] DB: Bahnstrecken-Ausbau, 2024', '[2] Landesverkehrsplanung: Pendler-Studie, 2024', '[3] Finanzministerium: Investitionsplan, 2024']
        }
      },
      {
        id: 'sl_f1',
        nummer: 'SL-2025-016',
        title: 'Ganztagsschulen-Finanzierung',
        deadline: '2 Wochen',
        emoji: '🏫',
        category: 'Bildung',
        description: 'Alle Grundschulen zu Ganztagsschulen ausbauen, 200 Mio. € für Infrastruktur, Personalaufstockung.',
        quickFacts: ['Alle Grundschulen', '200 Mio. €', 'Mehr Personal', '2025-2027'],
        yes: 78, no: 18, abstain: 4,
        votes: 125678,
        points: 150,
        claraMatch: 82,
        kiAnalysis: {
          pros: [
            { text: 'Bessere Bildungschancen', source: 'Bildungsministerium [1]', weight: 94 },
            { text: 'Vereinbarkeit Familie-Beruf', source: 'IW [2]', weight: 89 }
          ],
          cons: [
            { text: 'Personalkosten 50 Mio. €/Jahr', source: 'Finanzministerium [3]', weight: 75 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR.',
          financialImpact: '200 Mio. € + 50 Mio. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] Bildungsministerium: Ganztagsschul-Studie, 2024', '[2] IW: Vereinbarkeit-Index, 2024', '[3] Finanzministerium: Bildungshaushalt, 2024']
        }
      },
      {
        id: 'sl_m1',
        nummer: 'SL-2025-019',
        title: 'Naturschutzgebiet Biosphäre',
        deadline: '1 Woche',
        emoji: '🌳',
        category: 'Umwelt & Naturschutz',
        description: 'Biosphärenreservat Bliesgau erweitern, 500 ha Naturschutzfläche, UNESCO-Kriterien.',
        quickFacts: ['+500 ha', 'UNESCO-Status', 'Naherholung', 'Biodiversität'],
        yes: 81, no: 15, abstain: 4,
        votes: 98734,
        points: 150,
        claraMatch: 86,
        kiAnalysis: {
          pros: [
            { text: 'Artenvielfalt +30%', source: 'NABU [1]', weight: 93 },
            { text: 'Klimaschutz 15.000t CO₂', source: 'UBA [2]', weight: 88 }
          ],
          cons: [
            { text: 'Landwirtschaft betroffen', source: 'Bauernverband [3]', weight: 68 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR für Natur.',
          financialImpact: '5 Mio. €/Jahr',
          environmentalImpact: '+Biodiversität',
          quellen: ['[1] NABU: Artenschutz-Report, 2024', '[2] UBA: Klimaschutz Naturschutz, 2024', '[3] Bauernverband: Agrarnutzung, 2024']
        }
      },
      {
        id: 'sl_m2',
        nummer: 'SL-2025-024',
        title: 'Windenergie-Zubau',
        deadline: '3 Tage',
        emoji: '🌬️',
        category: 'Energie & Klima',
        description: 'Windkraft-Anlagen verdoppeln: 200 MW mehr Leistung, 50 neue Anlagen, Versorgung 40% EE.',
        quickFacts: ['+200 MW', '50 Anlagen', '40% EE-Anteil', '120.000t CO₂/Jahr'],
        yes: 64, no: 30, abstain: 6,
        votes: 113892,
        points: 150,
        claraMatch: 84,
        kiAnalysis: {
          pros: [
            { text: 'CO2-Reduktion 120.000t/Jahr', source: 'UBA [1]', weight: 93 },
            { text: 'Klimaziel erreichen', source: 'Klimaschutzplan [2]', weight: 91 }
          ],
          cons: [
            { text: 'Investitionen 300 Mio. €', source: 'Energiewirtschaft [3]', weight: 76 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR für Klimaschutz.',
          financialImpact: '300 Mio. € Investition',
          environmentalImpact: '-120.000t CO₂/Jahr',
          quellen: ['[1] UBA: Windenergie-Potenzial, 2024', '[2] Klimaschutzplan Saarland, 2024', '[3] Energiewirtschaft: Investitionsbedarf, 2024']
        }
      },
      {
        id: 'sl_a1',
        nummer: 'SL-2025-031',
        title: 'ÖPNV-Ticket für 29€',
        deadline: '2 Wochen',
        emoji: '🚌',
        category: 'Verkehr',
        description: 'Nachfolge des Deutschlandtickets: Saarland-Ticket für 29€ Monat, alle ÖPNV-Linien unbegrenzt.',
        quickFacts: ['29€/Monat', 'Alle Linien', 'Unbegrenzt', 'Ab April 2025'],
        yes: 83, no: 13, abstain: 4,
        votes: 156789,
        points: 150,
        claraMatch: 79,
        kiAnalysis: {
          pros: [
            { text: 'Bezahlbares ÖPNV', source: 'SaarVV [1]', weight: 95 },
            { text: 'Mehr Nutzer +40%', source: 'Verkehrsverbund [2]', weight: 88 }
          ],
          cons: [
            { text: 'Zuschuss 30 Mio. €/Jahr', source: 'Finanzministerium [3]', weight: 72 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR.',
          financialImpact: '30 Mio. €/Jahr',
          environmentalImpact: '-8.000t CO₂/Jahr',
          quellen: ['[1] SaarVV: Ticket-Entwicklung, 2024', '[2] Verkehrsverbund: Nutzerstatistik, 2024', '[3] Finanzministerium: ÖPNV-Subvention, 2024']
        }
      },
      {
        id: 'sl_ma1',
        nummer: 'SL-2025-036',
        title: 'Hochschul-Finanzierung',
        deadline: '1 Woche',
        emoji: '🎓',
        category: 'Bildung & Forschung',
        description: 'Universität Saarbrücken +50 Mio. €, neue Lehrstühle KI, Forschungsförderung, Studierendenwohnheime.',
        quickFacts: ['+50 Mio. €', 'Neue Lehrstühle KI', '500 Studierendenheimplätze', '2025-2027'],
        yes: 76, no: 19, abstain: 5,
        votes: 134567,
        points: 150,
        claraMatch: 77,
        kiAnalysis: {
          pros: [
            { text: 'Hochschulstandort stärken', source: 'Uni Saarland [1]', weight: 92 },
            { text: '3000 neue Studienplätze', source: 'Bildungsministerium [2]', weight: 87 }
          ],
          cons: [
            { text: 'Haushaltsbelastung 50 Mio. €', source: 'Finanzministerium [3]', weight: 75 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Bildung.',
          financialImpact: '50 Mio. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] Uni Saarland: Entwicklungsplan, 2024', '[2] Bildungsministerium: Studierendenzahlen, 2024', '[3] Finanzministerium: Hochschulhaushalt, 2024']
        }
      },
      {
        id: 'sl_ju1',
        nummer: 'SL-2025-041',
        title: 'Breitband-Ausbau',
        deadline: '5 Tage',
        emoji: '📡',
        category: 'Digitalisierung',
        description: 'Flächendeckendes Glasfasernetz: 95% Haushalte mit Gigabit-Speed, Investition 150 Mio. €.',
        quickFacts: ['95% Haushalte', 'Gigabit-Glasfaser', '150 Mio. €', '2025-2027'],
        yes: 88, no: 9, abstain: 3,
        votes: 178923,
        points: 150,
        claraMatch: 81,
        kiAnalysis: {
          pros: [
            { text: 'Standortvorteil Digital', source: 'IT-Cluster [1]', weight: 94 },
            { text: 'Home-Office möglich', source: 'IW [2]', weight: 89 }
          ],
          cons: [
            { text: 'Hohe Investition 150 Mio. €', source: 'Finanzministerium [3]', weight: 78 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR.',
          financialImpact: '150 Mio. € Investition',
          environmentalImpact: 'Digitalisierung',
          quellen: ['[1] IT-Cluster Saar: Digitalisierung, 2024', '[2] IW: Home-Office-Studie, 2024', '[3] Finanzministerium: Digitalbudget, 2024']
        }
      },
      {
        id: 'sl_au1',
        nummer: 'SL-2025-045',
        title: 'Wasserstoff-Strategie',
        deadline: '3 Wochen',
        emoji: '⚗️',
        category: 'Energie & Innovation',
        description: 'Wasserstoff-Produktionsanlage: 100 MW Elektrolyse, 15.000t H2/Jahr, Brennstoffzellen-Busse.',
        quickFacts: ['100 MW Elektrolyse', '15.000t H2/Jahr', 'Brennstoffzellen-Busse', '120 Mio. €'],
        yes: 72, no: 22, abstain: 6,
        votes: 156789,
        points: 150,
        claraMatch: 86,
        kiAnalysis: {
          pros: [
            { text: 'Klimaneutraler Verkehr', source: 'UBA [1]', weight: 93 },
            { text: 'Technologievorsprung', source: 'FZJ [2]', weight: 88 }
          ],
          cons: [
            { text: 'Hohe Investition 120 Mio. €', source: 'Finanzministerium [3]', weight: 76 }
          ],
          claraEinschätzung: 'Starke Empfehlung DAFÜR für Zukunftstechnologie.',
          financialImpact: '120 Mio. € Investition',
          environmentalImpact: '-45.000t CO₂/Jahr',
          quellen: ['[1] UBA: Wasserstoff-Studie, 2024', '[2] FZJ: Elektrolyse-Technologie, 2024', '[3] Finanzministerium: Investitionsplan, 2024']
        }
      },
      {
        id: 'sl_s1',
        nummer: 'SL-2025-050',
        title: 'Grenzüberschreitende Projekte',
        deadline: '2 Wochen',
        emoji: '🇪🇺',
        category: 'Europa & Zusammenarbeit',
        description: 'Transparency-Region SaarMoselLux: Gemeinsame Projekte mit Frankreich/Luxemburg, 20 Mio. € EU-Fonds.',
        quickFacts: ['EU-Interreg', '20 Mio. € Fördermittel', '3 Länder', 'Grenzregion'],
        yes: 81, no: 15, abstain: 4,
        votes: 145678,
        points: 150,
        claraMatch: 75,
        kiAnalysis: {
          pros: [
            { text: 'EU-Förderung 20 Mio. €', source: 'EU-Kommission [1]', weight: 92 },
            { text: 'Stärkung Grenzregion', source: 'EUREGIO [2]', weight: 87 }
          ],
          cons: [
            { text: 'Koordinationsaufwand', source: 'Verwaltung [3]', weight: 68 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Europa.',
          financialImpact: '+20 Mio. € EU-Mittel',
          environmentalImpact: 'Neutral',
          quellen: ['[1] EU-Kommission: Interreg-Programm, 2024', '[2] EUREGIO SaarMosel: Grenzregion, 2024', '[3] Landesverwaltung: Koordination, 2024']
        }
      },
      {
        id: 'sl_n1',
        nummer: 'SL-2025-054',
        title: 'Denkmalschutz-Förderung',
        deadline: '1 Woche',
        emoji: '🏛️',
        category: 'Kultur & Denkmalschutz',
        description: 'Historische Altstadt-Nachbesserungen: 15 Mio. € für Denkmalschutz, 400 Baudenkmäler sanieren.',
        quickFacts: ['400 Denkmäler', '15 Mio. €', 'Altstadt-Schutz', '2025-2028'],
        yes: 74, no: 21, abstain: 5,
        votes: 112345,
        points: 150,
        claraMatch: 71,
        kiAnalysis: {
          pros: [
            { text: 'Kulturelles Erbe bewahren', source: 'Landesdenkmal [1]', weight: 93 },
            { text: 'Tourismus +25%', source: 'Tourismus-Saar [2]', weight: 85 }
          ],
          cons: [
            { text: 'Kosten 15 Mio. €', source: 'Finanzministerium [3]', weight: 72 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Kultur.',
          financialImpact: '15 Mio. € Investition',
          environmentalImpact: 'Denkmalschutz',
          quellen: ['[1] Landesdenkmalpflege: Bestandserhebung, 2024', '[2] Tourismus Saarland: Besucherzahl, 2024', '[3] Finanzministerium: Kulturbudget, 2024']
        }
      },
      {
        id: 'sl_n2',
        nummer: 'SL-2025-057',
        title: 'Tourismus-Offensive',
        deadline: '3 Tage',
        emoji: '🏖️',
        category: 'Tourismus & Wirtschaft',
        description: 'Tourismus-Marketing verstärken: 8 Mio. € Budget, Wassertourismus, Radrouten-Netz ausbauen.',
        quickFacts: ['8 Mio. €', 'Wassertourismus', 'Radrouten-Netz', '+50.000 Gäste'],
        yes: 78, no: 18, abstain: 4,
        votes: 134567,
        points: 150,
        claraMatch: 73,
        kiAnalysis: {
          pros: [
            { text: '+50.000 Gäste/Jahr', source: 'Tourismus-Saar [1]', weight: 91 },
            { text: '300 neue Jobs', source: 'IHK [2]', weight: 86 }
          ],
          cons: [
            { text: 'Marketing-Budget 8 Mio. €', source: 'Finanzministerium [3]', weight: 69 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Wirtschaft.',
          financialImpact: '8 Mio. €/Jahr',
          environmentalImpact: 'Nachhaltiger Tourismus',
          quellen: ['[1] Tourismus Saarland: Besuchszahlen, 2024', '[2] IHK: Arbeitsmarkt Tourismus, 2024', '[3] Finanzministerium: Marketing-Budget, 2024']
        }
      },
      {
        id: 'sl_d1',
        nummer: 'SL-2025-059',
        title: 'Kinderbetreuung kostenlos',
        deadline: '4 Tage',
        emoji: '👶',
        category: 'Soziales & Familie',
        description: 'Kinderbetreuung für alle kostenlos: Kitas, Tagespflege, Hort kostenfrei ab 2026.',
        quickFacts: ['Alle Kitas kostenlos', '100.000 Familien', '250 Mio. €/Jahr', 'Ab 2026'],
        yes: 85, no: 12, abstain: 3,
        votes: 178923,
        points: 150,
        claraMatch: 88,
        kiAnalysis: {
          pros: [
            { text: 'Vereinbarkeit Familie-Beruf', source: 'IW [1]', weight: 95 },
            { text: 'Bildungschancen für alle', source: 'Bildungsministerium [2]', weight: 92 }
          ],
          cons: [
            { text: 'Haushaltsbelastung 250 Mio. €', source: 'Finanzministerium [3]', weight: 78 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR für Familie.',
          financialImpact: '250 Mio. €/Jahr',
          environmentalImpact: 'Neutral',
          quellen: ['[1] IW Köln: Vereinbarkeits-Studie, 2024', '[2] Bildungsministerium: Bildungsgerechtigkeit, 2024', '[3] Finanzministerium: Kinderbetreuung-Haushalt, 2024']
        }
      }
    ],
    vergangen: [
      {
        id: 'sl_v1',
        nummer: 'SL-2025-015',
        title: 'Kostenloser ÖPNV für Schüler',
        datum: '20.09.2025',
        ergebnis: 'Angenommen',
        yes: 76, no: 21, abstain: 3,
        votes: 187423
      }
    ]
  },
  kirkel: {
    canVote: true,
    cards: [
      {
        id: 'kr1',
        nummer: 'KI-2025-008',
        title: 'Mehrzweckhalle Kirkel-Neuhäusel',
        deadline: '1 Woche',
        emoji: '🏟️',
        category: 'Infrastruktur',
        description: 'Moderne Veranstaltungshalle mit 600 Plätzen für Sport, Kultur und Gemeindefeste.',
        quickFacts: ['600 Sitzplätze', 'Sport & Kultur', '4,2 Mio. € Budget', 'Fertig 2027'],
        yes: 73, no: 22, abstain: 5,
        votes: 2847,
        points: 50,
        claraMatch: 81,
        kiAnalysis: {
          pros: [
            { text: 'Zentrale Begegnungsstätte', source: 'Gemeinderat [1]', weight: 90 }
          ],
          cons: [
            { text: '4,2 Mio. € Budget', source: 'Kämmerei [2]', weight: 82 }
          ],
          claraEinschätzung: 'Stärkt Gemeinschaftsleben.',
          financialImpact: '4,2 Mio. € + 120k€/Jahr',
          environmentalImpact: 'Solardach',
          quellen: ['[1] Gemeinderat: Verbandsversammlung, 2024', '[2] Kämmerei: Haushaltsplan 2025, 2024']
        }
      },
      {
        id: 'kr_j1',
        nummer: 'KI-2025-004',
        title: 'Neue Radwege',
        deadline: '2 Wochen',
        emoji: '🚴',
        category: 'Verkehr & Umwelt',
        description: '6 km neue Radwege, Verbindung zu Nachbargemeinden, Fahrradparkplätze.',
        quickFacts: ['6 km Radwege', 'Fahrradparkplätze', '500.000 €', '2025-2026'],
        yes: 81, no: 15, abstain: 4,
        votes: 3245,
        points: 50,
        claraMatch: 84,
        kiAnalysis: {
          pros: [
            { text: 'CO2-Reduktion 800t/Jahr', source: 'Klimaschutz Kommune [1]', weight: 91 },
            { text: 'Mehr Radverkehr +40%', source: 'Verkehrsamt [2]', weight: 86 }
          ],
          cons: [
            { text: 'Kosten 500.000 €', source: 'Bauamt [3]', weight: 73 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR.',
          financialImpact: '500.000 €',
          environmentalImpact: '-800t CO₂/Jahr',
          quellen: ['[1] Klimaschutz Kommune: Verkehrs-Plan, 2024', '[2] Verkehrsamt: Radverkehrs-Erhebung, 2024', '[3] Bauamt: Investitionskosten, 2024']
        }
      },
      {
        id: 'kr_m1',
        nummer: 'KI-2025-011',
        title: 'Sportplatz Modernisierung',
        deadline: '3 Tage',
        emoji: '⚽',
        category: 'Sport & Freizeit',
        description: 'Kunstrasen auf Sportplatz, neue Flutlichtanlage LED, Umkleidekabinen sanieren.',
        quickFacts: ['Kunstrasen', 'LED-Flutlicht', '380.000 €', 'Fertig 2025'],
        yes: 76, no: 20, abstain: 4,
        votes: 2891,
        points: 50,
        claraMatch: 72,
        kiAnalysis: {
          pros: [
            { text: 'Mehr Nutzungsstunden', source: 'Sportamt [1]', weight: 88 },
            { text: 'Energie sparen 70%', source: 'Klimaschutz [2]', weight: 85 }
          ],
          cons: [
            { text: 'Investition 380.000 €', source: 'Kämmerei [3]', weight: 71 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Sport.',
          financialImpact: '380.000 €',
          environmentalImpact: '-30t CO₂/Jahr',
          quellen: ['[1] Sportamt: Nutzungsstatistik, 2024', '[2] Klimaschutz: Energieeffizienz, 2024', '[3] Kämmerei: Haushaltsplan, 2024']
        }
      },
      {
        id: 'kr_a1',
        nummer: 'KI-2025-018',
        title: 'Kindergarten-Erweiterung',
        deadline: '1 Monat',
        emoji: '🏫',
        category: 'Bildung & Betreuung',
        description: 'Neue Gruppe im Kindergarten, 25 Plätze zusätzlich, Umbau bestehender Räume.',
        quickFacts: ['+25 Plätze', 'Neue Gruppe', '420.000 €', '2025'],
        yes: 84, no: 13, abstain: 3,
        votes: 3123,
        points: 50,
        claraMatch: 89,
        kiAnalysis: {
          pros: [
            { text: 'Wartezeiten reduzieren', source: 'Kita-Verwaltung [1]', weight: 94 },
            { text: 'Vereinbarkeit Familie-Beruf', source: 'IW [2]', weight: 91 }
          ],
          cons: [
            { text: 'Investition 420.000 €', source: 'Bauamt [3]', weight: 68 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR.',
          financialImpact: '420.000 €',
          environmentalImpact: 'Neutral',
          quellen: ['[1] Kita-Verwaltung: Bedarfsplanung, 2024', '[2] IW: Vereinbarkeits-Studie, 2024', '[3] Bauamt: Umbau-Kosten, 2024']
        }
      },
      {
        id: 'kr_j1',
        nummer: 'KI-2025-025',
        title: 'Öffentliche Bücherei',
        deadline: '2 Wochen',
        emoji: '📚',
        category: 'Kultur & Bildung',
        description: 'Neue Gemeindebücherei, 300 qm, 15.000 Bücher, Leseecke, Internetplätze.',
        quickFacts: ['300 qm', '15.000 Bücher', '1,2 Mio. €', '2026'],
        yes: 79, no: 17, abstain: 4,
        votes: 2789,
        points: 50,
        claraMatch: 77,
        kiAnalysis: {
          pros: [
            { text: 'Bildung fördern', source: 'Kulturamt [1]', weight: 92 },
            { text: 'Treffpunkt Gemeinde', source: 'Gemeinderat [2]', weight: 87 }
          ],
          cons: [
            { text: 'Kosten 1,2 Mio. €', source: 'Finanzen [3]', weight: 75 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Bildung.',
          financialImpact: '1,2 Mio. € Investition',
          environmentalImpact: 'Nachhaltiges Bauen',
          quellen: ['[1] Kulturamt: Bedarfsplanung, 2024', '[2] Gemeinderat: Kulturkonzept, 2024', '[3] Finanzen: Investitionsplan, 2024']
        }
      },
      {
        id: 'kr_ju1',
        nummer: 'KI-2025-032',
        title: 'Bürgergärten',
        deadline: '5 Tage',
        emoji: '🌱',
        category: 'Umwelt & Gemeinschaft',
        description: 'Bürgergärten anlegen: 50 Parzellen à 50 qm, gemeinsame Infrastruktur, Kompostplatz.',
        quickFacts: ['50 Parzellen', '50 qm/Stück', '180.000 €', 'Miete 120€/Jahr'],
        yes: 73, no: 22, abstain: 5,
        votes: 3456,
        points: 50,
        claraMatch: 81,
        kiAnalysis: {
          pros: [
            { text: 'Gesunde Ernährung', source: 'Gesundheitsamt [1]', weight: 93 },
            { text: 'Gemeinschaft stärken', source: 'Sozialamt [2]', weight: 88 }
          ],
          cons: [
            { text: 'Investition 180.000 €', source: 'Bauamt [3]', weight: 72 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Gemeinschaft.',
          financialImpact: '180.000 €',
          environmentalImpact: '+Biodiversität',
          quellen: ['[1] Gesundheitsamt: Ernährungsstudie, 2024', '[2] Sozialamt: Gemeinschaftsprojekte, 2024', '[3] Bauamt: Investitionskosten, 2024']
        }
      },
      {
        id: 'kr_au1',
        nummer: 'KI-2025-036',
        title: 'Wochenmarkt-Erweiterung',
        deadline: '1 Woche',
        emoji: '🏪',
        category: 'Wirtschaft & Handel',
        description: 'Wochenmarkt ausweiten: 20 Stände, Marktplatz pflastern, Toiletten-Anlage, Dachüberstand.',
        quickFacts: ['20 Stände', 'Neue Infrastruktur', '450.000 €', '2025'],
        yes: 68, no: 27, abstain: 5,
        votes: 2912,
        points: 50,
        claraMatch: 69,
        kiAnalysis: {
          pros: [
            { text: 'Wirtschaft beleben', source: 'Wirtschaftsförderung [1]', weight: 89 },
            { text: 'Regionale Produkte', source: 'Verwaltung [2]', weight: 85 }
          ],
          cons: [
            { text: 'Kosten 450.000 €', source: 'Finanzen [3]', weight: 76 }
          ],
          claraEinschätzung: 'Empfehlung für Wirtschaft.',
          financialImpact: '450.000 €',
          environmentalImpact: 'Regional',
          quellen: ['[1] Wirtschaftsförderung: Markt-Studie, 2024', '[2] Verwaltung: Marktregelung, 2024', '[3] Finanzen: Investitionsplan, 2024']
        }
      },
      {
        id: 'kr_n1',
        nummer: 'KI-2025-042',
        title: 'Neue Straßenbeleuchtung LED',
        deadline: '3 Tage',
        emoji: '💡',
        category: 'Infrastruktur & Umwelt',
        description: 'Alle Straßenlaternen auf LED umstellen: 400 Stück, 80% Energie sparen.',
        quickFacts: ['400 Laternen', '80% Energiesparung', '280.000 €', '-40t CO₂/Jahr'],
        yes: 87, no: 9, abstain: 4,
        votes: 3123,
        points: 50,
        claraMatch: 86,
        kiAnalysis: {
          pros: [
            { text: 'Energie sparen 80%', source: 'Energieberater [1]', weight: 95 },
            { text: 'CO2-Reduktion 40t/Jahr', source: 'Klimaschutz [2]', weight: 92 }
          ],
          cons: [
            { text: 'Investition 280.000 €', source: 'Bauamt [3]', weight: 68 }
          ],
          claraEinschätzung: 'Sehr starke Empfehlung DAFÜR.',
          financialImpact: '-50.000 €/Jahr',
          environmentalImpact: '-40t CO₂/Jahr',
          quellen: ['[1] Energieberater: Effizienz-Studie, 2024', '[2] Klimaschutz: CO2-Bilanz, 2024', '[3] Bauamt: Investitionsplan, 2024']
        }
      },
      {
        id: 'kr_d1',
        nummer: 'KI-2025-048',
        title: 'Ortskern Sanierung',
        deadline: '4 Tage',
        emoji: '🏛️',
        category: 'Städtebau & Denkmalpflege',
        description: 'Ortskern-Sanierung: Historische Fassaden erhalten, Straßen erneuern, Plätze gestalten.',
        quickFacts: ['Historische Fassaden', 'Straßenerneuerung', '1,8 Mio. €', '2025-2027'],
        yes: 71, no: 24, abstain: 5,
        votes: 2567,
        points: 50,
        claraMatch: 74,
        kiAnalysis: {
          pros: [
            { text: 'Kulturelles Erbe bewahren', source: 'Denkmalpflege [1]', weight: 93 },
            { text: 'Ortsbild verbessern', source: 'Bauamt [2]', weight: 88 }
          ],
          cons: [
            { text: 'Hohe Investition 1,8 Mio. €', source: 'Finanzen [3]', weight: 78 }
          ],
          claraEinschätzung: 'Empfehlung DAFÜR für Kultur.',
          financialImpact: '1,8 Mio. €',
          environmentalImpact: 'Nachhaltige Sanierung',
          quellen: ['[1] Denkmalpflege: Bestandsaufnahme, 2024', '[2] Bauamt: Stadtentwicklung, 2024', '[3] Finanzen: Investitionsplan, 2024']
        }
      }
    ],
    vergangen: []
  }
};

export const LEADERBOARD_DATA: LeaderboardItem[] = [
  { rank: 1, name: 'Hamburg', participation: 87.3, medal: 'gold' },
  { rank: 2, name: 'Bayern', participation: 84.7, medal: 'silver' },
  { rank: 3, name: 'Baden-Württemberg', participation: 82.1, medal: 'bronze' },
  { rank: 4, name: 'Hessen', participation: 79.8 },
  { rank: 5, name: 'Berlin', participation: 78.2 },
  { rank: 13, name: 'Saarland (Sie)', participation: 71.4, isUser: true }
];

/**
 * WAHLEN_DATA: Alle Wahlen aus wahlen-deutschland.ts + lokale Kirkel-Demo-Daten.
 */
const KIRKEL_WAHL: Wahl = {
    id: 'kk25',
    name: 'Gemeinderatswahl Kirkel 2025',
    datum: '09.11.2025',
    wahlkreis: 'Kirkel',
    level: 'kommune',
    location: 'kirkel',
    // image: lokaler Pfad /images/politiker/… oder volle URL (z. B. von kirkel.de Grafikadresse kopieren)
    kandidaten: [
      {
        name: 'Dominik Hochlenert',
        partei: 'CDU',
        emoji: '👨‍💼',
        alter: 42,
        beruf: 'Bürgermeister',
        positionen: ['Verwaltung', 'Kultur & Tourismus', 'Bürgerservice'],
        claraInfo: 'Seit 1. Oktober 2024 Bürgermeister von Kirkel. Zuvor Sachgebietsleiter Kultur, Sport und Tourismus in der Gemeindeverwaltung.',
        image: '/images/politiker/dominik-hochlenert.jpg',
        quelle: 'Gemeinde Kirkel (kirkel.de)',
        quelleUrl: 'https://www.kirkel.de/rathaus-service/buergermeister'
      },
      {
        name: 'Frank John',
        partei: 'SPD',
        emoji: '👨‍💼',
        alter: 54,
        beruf: 'Ehem. Bürgermeister, Gemeinderat',
        positionen: ['Gemeinschaftsprojekte', 'Infrastruktur'],
        claraInfo: 'Langjähriger Bürgermeister von Kirkel, kandidierte 2024 für das Landratsamt Saarpfalz-Kreis.',
        image: '/images/politiker/frank-john.jpg',
        quelle: 'Gemeinde Kirkel (kirkel.de)',
        quelleUrl: 'https://www.kirkel.de/gemeinderat'
      },
      {
        name: 'Klaus Müller',
        partei: 'SPD',
        emoji: '👨‍💼',
        alter: 54,
        beruf: 'Gemeinderat',
        positionen: ['Gemeinschaftsprojekte', 'Infrastruktur'],
        claraInfo: 'Erfahrener Gemeinderat. Engagiert für Mehrzweckhalle, Radwege und Ortskernsanierung.',
        image: '/images/politiker/klaus-mueller.jpg',
        quelle: 'Gemeinde Kirkel (kirkel.de)',
        quelleUrl: 'https://www.kirkel.de/gemeinderat'
      },
      {
        name: 'Petra Schmidt',
        partei: 'CDU',
        emoji: '👩‍💼',
        alter: 49,
        beruf: 'Gemeinderätin',
        positionen: ['Haushaltspolitik', 'Wirtschaftsförderung'],
        claraInfo: 'Langjährige Gemeinderätin. Schwerpunkt auf Finanzen und Haushalt.',
        image: '/images/politiker/petra-schmidt.jpg',
        quelle: 'Gemeinde Kirkel (kirkel.de)',
        quelleUrl: 'https://www.kirkel.de/gemeinderat'
      },
      {
        name: 'Michael Hoffmann',
        partei: 'GRÜNE',
        emoji: '👨‍💼',
        alter: 41,
        beruf: 'Gemeinderat',
        positionen: ['Klimaschutz', 'Nachhaltigkeit'],
        claraInfo: 'Engagiert für Radwege, Bürgergärten und LED-Beleuchtung in Kirkel.',
        image: '/images/politiker/michael-hoffmann.jpg',
        quelle: 'Gemeinde Kirkel (kirkel.de)',
        quelleUrl: 'https://www.kirkel.de/gemeinderat'
      }
    ],
    parteien: [
      { 
        name: 'SPD', 
        programm: `Gemeinschaftsprojekte & Infrastruktur
Die SPD Kirkel setzt auf Gemeinschaftsprojekte und nachhaltige Infrastruktur. Wir engagieren uns für die Mehrzweckhalle, den Ausbau von Radwegen und die Ortskernsanierung.

Infrastruktur & Verkehr
Ausbau der Radwege, bessere ÖPNV-Anbindung und eine moderne, nachhaltige Verkehrsinfrastruktur für Kirkel.

Gemeinschaft & Kultur
Förderung von Gemeinschaftsprojekten, kulturellen Veranstaltungen und sozialem Zusammenhalt. Stärkung des Vereinslebens und der lokalen Gemeinschaft.

Nachhaltigkeit & Klima
Klimaschutz auf kommunaler Ebene durch nachhaltige Projekte, erneuerbare Energien und umweltfreundliche Mobilität.` 
      },
      { 
        name: 'CDU', 
        programm: `Haushaltspolitik & Wirtschaftsförderung
Die CDU Kirkel steht für verantwortungsvolle Haushaltspolitik und Wirtschaftsförderung. Fokus auf solide Finanzen und eine starke lokale Wirtschaft.

Finanzen & Haushalt
Verantwortungsvolle Haushaltspolitik, Schuldenabbau und solide Finanzplanung für die Gemeinde Kirkel.

Wirtschaft & Handel
Förderung des lokalen Handels, Unterstützung von Unternehmen und Schaffung von Arbeitsplätzen in Kirkel.

Familie & Tradition
Unterstützung für Familien, Kinderbetreuung und Bewahrung traditioneller Werte. Stärkung der Familien in der Gemeinde.` 
      },
      { 
        name: 'GRÜNE', 
        programm: `Klimaschutz & Nachhaltigkeit
Die GRÜNEN Kirkel setzen auf ambitionierten Klimaschutz und Nachhaltigkeit auf kommunaler Ebene. Radwege, Bürgergärten und LED-Beleuchtung stehen im Fokus.

Umwelt & Klima
Ausbau der Radwege, Förderung erneuerbarer Energien und nachhaltige Projekte für Kirkel. Klimaneutralität auf kommunaler Ebene.

Bürgerbeteiligung & Demokratie
Mehr Bürgerbeteiligung, Transparenz in der Gemeindepolitik und lebendige Demokratie. Stärkung der Zivilgesellschaft.

Nachhaltige Mobilität
Ausbau der Radwege, Förderung der E-Mobilität und bessere ÖPNV-Anbindung. Klimafreundliche Mobilität für alle.` 
      },
      { 
        name: 'Unabhängige Liste', 
        programm: `Transparenz & Bürgerbeteiligung
Die Unabhängige Liste Kirkel setzt auf Transparenz, Bürgerbeteiligung und parteiübergreifende Lösungen. Ohne Parteibindung arbeiten wir für die besten Lösungen für Kirkel.

Transparenz & Offenheit
Volle Transparenz in der Gemeindepolitik, offene Sitzungen und Informationsfreiheit für alle Bürger.

Bürgerbeteiligung & Dialog
Direkte Bürgerbeteiligung, regelmäßige Bürgerversammlungen und offener Dialog zwischen Gemeinde und Bürgern.

Parteiübergreifende Lösungen
Sachorientierte, parteiübergreifende Lösungen für Kirkel. Gemeinsam für das Beste der Gemeinde.` 
      },
      { 
        name: 'FDP', 
        programm: `Digitalisierung & Wirtschaftsförderung
Die FDP Kirkel steht für Digitalisierung, Wirtschaftsförderung und Bürokratieabbau. Fokus auf Innovation und eine starke lokale Wirtschaft.

Digitalisierung & Innovation
Digitale Verwaltung, moderne IT-Infrastruktur und Förderung von Innovationen in Kirkel.

Wirtschaft & Bürokratieabbau
Förderung des Mittelstands, weniger Bürokratie für Unternehmen und Schaffung von Arbeitsplätzen.

Bürgerfreundlichkeit
Bürgerfreundliche Verwaltung, digitale Dienstleistungen und schnellere Genehmigungsverfahren.` 
      }
    ]
  }

};

export const WAHLEN_DATA: Wahl[] = [...WAHLEN_DEUTSCHLAND, KIRKEL_WAHL];
export const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title: 'Windpark Höcherberg: Bürgerinitiative fordert Neuprüfung',
    source: 'SZ',
    date: '28.09.2025',
    snippet: 'Anwohner fordern Lärmgutachten.',
    url: '#',
    related: 'sl1'
  },
  {
    id: 2,
    title: 'Tempolimit: Mehrheit dafür',
    source: 'tagesschau',
    date: '28.09.2025',
    snippet: '58% befürworten 130 km/h.',
    url: '#',
    related: 'bw1'
  },
  {
    id: 3,
    title: 'Vermögenssteuer: EU unterstützt',
    source: 'FAZ',
    date: '27.09.2025',
    snippet: 'Brüssel signalisiert Zustimmung.',
    url: '#',
    related: 'bw2'
  }
];

export const CALENDAR_DAYS: Record<string, Record<number, CalendarEvent>> = {
  januar: {
    15: { type: 'bundesweit', title: 'Cannabis-Legalisierung', cardId: 'bw_j1', location: 'bundesweit' },
    22: { type: 'saarland', title: 'Ausbau Bahnstrecke Saarbrücken-Luxemburg', cardId: 'sl_j1', location: 'saarland' },
    28: { type: 'kirkel', title: 'Neue Radwege', cardId: 'kr_j1', location: 'kirkel' }
  },
  februar: {
    3: { type: 'bundesweit', title: 'EU-Migrationspaket', cardId: 'bw_f1', location: 'bundesweit' },
    12: { type: 'saarland', title: 'Ganztagsschulen-Finanzierung', cardId: 'sl_f1', location: 'saarland' },
    18: { type: 'bundesweit', title: 'Atomkraft-Ausstieg final', cardId: 'bw_f2', location: 'bundesweit' }
  },
  märz: {
    5: { type: 'saarland', title: 'Naturschutzgebiet Biosphäre', cardId: 'sl_m1', location: 'saarland' },
    14: { type: 'bundesweit', title: 'Grundrente Plus', cardId: 'bw_m1', location: 'bundesweit' },
    21: { type: 'kirkel', title: 'Sportplatz Modernisierung', cardId: 'kr_m1', location: 'kirkel' },
    28: { type: 'saarland', title: 'Windenergie-Zubau', cardId: 'sl_m2', location: 'saarland' }
  },
  april: {
    4: { type: 'bundesweit', title: 'Künstliche Intelligenz Regulierung', cardId: 'bw_a1', location: 'bundesweit' },
    11: { type: 'saarland', title: 'ÖPNV-Ticket für 29€', cardId: 'sl_a1', location: 'saarland' },
    23: { type: 'kirkel', title: 'Kindergarten-Erweiterung', cardId: 'kr_a1', location: 'kirkel' }
  },
  mai: {
    6: { type: 'bundesweit', title: 'Digitales Gesundheitswesen', cardId: 'bw_ma1', location: 'bundesweit' },
    15: { type: 'saarland', title: 'Hochschul-Finanzierung', cardId: 'sl_ma1', location: 'saarland' },
    20: { type: 'bundesweit', title: 'CO2-Abgabe für Industrie', cardId: 'bw_ma2', location: 'bundesweit' }
  },
  juni: {
    10: { type: 'saarland', title: 'Kliniken-Struktur', cardId: 'sl_j1', location: 'saarland' },
    17: { type: 'bundesweit', title: 'Europäische Integration', cardId: 'bw_j1', location: 'bundesweit' },
    24: { type: 'kirkel', title: 'Öffentliche Bücherei', cardId: 'kr_j1', location: 'kirkel' }
  },
  juli: {
    2: { type: 'bundesweit', title: 'Arbeitszeit-4-Tage-Woche', cardId: 'bw_ju1', location: 'bundesweit' },
    14: { type: 'saarland', title: 'Breitband-Ausbau', cardId: 'sl_ju1', location: 'saarland' },
    21: { type: 'kirkel', title: 'Bürgergärten', cardId: 'kr_ju1', location: 'kirkel' }
  },
  august: {
    5: { type: 'bundesweit', title: 'Bildung-Digitalisierung', cardId: 'bw_au1', location: 'bundesweit' },
    19: { type: 'saarland', title: 'Wasserstoff-Strategie', cardId: 'sl_au1', location: 'saarland' },
    26: { type: 'kirkel', title: 'Wochenmarkt-Erweiterung', cardId: 'kr_au1', location: 'kirkel' }
  },
  september: {
    3: { type: 'bundesweit', title: 'Sozialwohnungen-Investition', cardId: 'bw_s1', location: 'bundesweit' },
    16: { type: 'saarland', title: 'Grenzüberschreitende Projekte', cardId: 'sl_s1', location: 'saarland' },
    22: { type: 'bundesweit', title: 'E-Auto-Förderung', cardId: 'bw_s2', location: 'bundesweit' }
  },
  oktober: {
    1: { type: 'bundesweit', title: 'Vermögenssteuer', cardId: 'bw2', location: 'bundesweit' },
    7: { type: 'saarland', title: 'Windpark Höcherberg', cardId: 'sl1', location: 'saarland' },
    12: { type: 'saarland', title: 'Kreisklinikum Modernisierung', cardId: 'sp1', location: 'saarland' },
    15: { type: 'kirkel', title: 'Mehrzweckhalle', cardId: 'k3', location: 'kirkel' },
    18: { type: 'kirkel', title: 'LED-Straßenbeleuchtung', cardId: 'k2', location: 'kirkel' },
    20: { type: 'saarland', title: 'Solar-Pflicht Neubauten', cardId: 's2', location: 'saarland' },
    22: { type: 'bundesweit', title: 'Tempolimit 130 km/h', cardId: 'd2', location: 'deutschland' },
    25: { type: 'saarland', title: 'Kita-Gebühren abschaffen', cardId: 's3', location: 'saarland' },
    28: { type: 'bundesweit', title: 'Vermögenssteuer ab 2 Millionen Euro', cardId: 'd3', location: 'deutschland' },
    30: { type: 'bundesweit', title: 'Atomkraft-Ausstieg final', cardId: 'd4', location: 'deutschland' }
  },
  november: {
    4: { type: 'saarland', title: 'Denkmalschutz-Förderung', cardId: 'sl_n1', location: 'saarland' },
    11: { type: 'bundesweit', title: 'Klima-Fonds EU', cardId: 'bw_n1', location: 'bundesweit' },
    18: { type: 'kirkel', title: 'Neue Straßenbeleuchtung LED', cardId: 'kr_n1', location: 'kirkel' },
    25: { type: 'saarland', title: 'Tourismus-Offensive', cardId: 'sl_n2', location: 'saarland' }
  },
  dezember: {
    2: { type: 'bundesweit', title: 'Arbeitnehmerrechte EU', cardId: 'bw_d1', location: 'bundesweit' },
    9: { type: 'saarland', title: 'Kinderbetreuung kostenlos', cardId: 'sl_d1', location: 'saarland' },
    15: { type: 'saarland', title: 'Wasserversorgung digitalisieren', cardId: 'sp3', location: 'saarland' },
    16: { type: 'kirkel', title: 'Ortskern Sanierung', cardId: 'kr_d1', location: 'kirkel' },
    20: { type: 'bundesweit', title: 'Klimaneutralität 2040', cardId: 'bw_d2', location: 'bundesweit' },
    22: { type: 'saarland', title: 'Regionale Wirtschaftsförderung', cardId: 'sp4', location: 'saarland' },
    29: { type: 'saarland', title: 'Kreismuseen Jahreskarte', cardId: 'sp5', location: 'saarland' }
  }
};

// Kalendereinträge für 2026
export const CALENDAR_DAYS_2026: Record<string, Record<number, CalendarEvent>> = {
  januar: {
    5: { type: 'bundesweit', title: 'Grundrente auf 1.250€ erhöhen', cardId: 'd5', location: 'deutschland' },
    8: { type: 'saarland', title: 'Hochschulzugang erweitern', cardId: 's4', location: 'saarland' },
    12: { type: 'saarland', title: 'Kreisklinikum Modernisierung', cardId: 'sp1', location: 'saarland' },
    18: { type: 'kirkel', title: 'Radwege-Erweiterung', cardId: 'k4', location: 'kirkel' },
    25: { type: 'bundesweit', title: 'Digitalsteuer für Tech-Konzerne', cardId: 'd1', location: 'deutschland' }
  },
  februar: {
    3: { type: 'saarland', title: 'Windkraft-Ausbau beschleunigen', cardId: 's5', location: 'saarland' },
    10: { type: 'bundesweit', title: 'Tempolimit 130 km/h auf Autobahnen', cardId: 'd2', location: 'deutschland' },
    15: { type: 'saarland', title: 'Radwegenetz Kreisstraßen', cardId: 'sp2', location: 'saarland' },
    22: { type: 'kirkel', title: 'Bürgergarten-Projekt', cardId: 'k5', location: 'kirkel' },
    28: { type: 'bundesweit', title: 'Vermögenssteuer ab 2 Millionen Euro', cardId: 'd3', location: 'deutschland' }
  },
  märz: {
    5: { type: 'saarland', title: 'Solar-Pflicht Neubauten', cardId: 's2', location: 'saarland' },
    12: { type: 'bundesweit', title: 'Atomkraft-Ausstieg final', cardId: 'd4', location: 'deutschland' },
    18: { type: 'saarland', title: 'Wasserversorgung digitalisieren', cardId: 'sp3', location: 'saarland' },
    25: { type: 'kirkel', title: 'Spielplatz Kirchbergstraße', cardId: 'k1', location: 'kirkel' },
    30: { type: 'bundesweit', title: 'Grundrente auf 1.250€ erhöhen', cardId: 'd5', location: 'deutschland' }
  },
  april: {
    4: { type: 'saarland', title: 'Kita-Gebühren abschaffen', cardId: 's3', location: 'saarland' },
    10: { type: 'bundesweit', title: 'Digitalsteuer für Tech-Konzerne', cardId: 'd1', location: 'deutschland' },
    15: { type: 'saarland', title: 'Regionale Wirtschaftsförderung', cardId: 'sp4', location: 'saarland' },
    22: { type: 'kirkel', title: 'LED-Straßenbeleuchtung', cardId: 'k2', location: 'kirkel' },
    28: { type: 'bundesweit', title: 'Tempolimit 130 km/h auf Autobahnen', cardId: 'd2', location: 'deutschland' }
  },
  mai: {
    6: { type: 'saarland', title: 'Hochschulzugang erweitern', cardId: 's4', location: 'saarland' },
    12: { type: 'bundesweit', title: 'Vermögenssteuer ab 2 Millionen Euro', cardId: 'd3', location: 'deutschland' },
    18: { type: 'saarland', title: 'Kreismuseen Jahreskarte', cardId: 'sp5', location: 'saarland' },
    24: { type: 'kirkel', title: 'Mehrzweckhalle Kirkel-Neuhäusel', cardId: 'k3', location: 'kirkel' },
    30: { type: 'bundesweit', title: 'Atomkraft-Ausstieg final', cardId: 'd4', location: 'deutschland' }
  },
  juni: {
    5: { type: 'saarland', title: 'Windkraft-Ausbau beschleunigen', cardId: 's5', location: 'saarland' },
    12: { type: 'bundesweit', title: 'Grundrente auf 1.250€ erhöhen', cardId: 'd5', location: 'deutschland' },
    18: { type: 'saarland', title: 'Kreisklinikum Modernisierung', cardId: 'sp1', location: 'saarland' },
    25: { type: 'kirkel', title: 'Radwege-Erweiterung', cardId: 'k4', location: 'kirkel' }
  },
  juli: {
    3: { type: 'bundesweit', title: 'Digitalsteuer für Tech-Konzerne', cardId: 'd1', location: 'deutschland' },
    10: { type: 'saarland', title: 'Solar-Pflicht Neubauten', cardId: 's2', location: 'saarland' },
    17: { type: 'saarland', title: 'Radwegenetz Kreisstraßen', cardId: 'sp2', location: 'saarland' },
    24: { type: 'kirkel', title: 'Bürgergarten-Projekt', cardId: 'k5', location: 'kirkel' },
    31: { type: 'bundesweit', title: 'Tempolimit 130 km/h auf Autobahnen', cardId: 'd2', location: 'deutschland' }
  },
  august: {
    7: { type: 'saarland', title: 'Kita-Gebühren abschaffen', cardId: 's3', location: 'saarland' },
    14: { type: 'bundesweit', title: 'Vermögenssteuer ab 2 Millionen Euro', cardId: 'd3', location: 'deutschland' },
    21: { type: 'saarland', title: 'Wasserversorgung digitalisieren', cardId: 'sp3', location: 'saarland' },
    28: { type: 'kirkel', title: 'Spielplatz Kirchbergstraße', cardId: 'k1', location: 'kirkel' }
  },
  september: {
    4: { type: 'bundesweit', title: 'Atomkraft-Ausstieg final', cardId: 'd4', location: 'deutschland' },
    11: { type: 'saarland', title: 'Hochschulzugang erweitern', cardId: 's4', location: 'saarland' },
    18: { type: 'saarland', title: 'Regionale Wirtschaftsförderung', cardId: 'sp4', location: 'saarland' },
    25: { type: 'kirkel', title: 'LED-Straßenbeleuchtung', cardId: 'k2', location: 'kirkel' }
  },
  oktober: {
    2: { type: 'bundesweit', title: 'Grundrente auf 1.250€ erhöhen', cardId: 'd5', location: 'deutschland' },
    9: { type: 'saarland', title: 'Windkraft-Ausbau beschleunigen', cardId: 's5', location: 'saarland' },
    16: { type: 'saarland', title: 'Kreismuseen Jahreskarte', cardId: 'sp5', location: 'saarland' },
    23: { type: 'kirkel', title: 'Mehrzweckhalle Kirkel-Neuhäusel', cardId: 'k3', location: 'kirkel' },
    30: { type: 'bundesweit', title: 'Digitalsteuer für Tech-Konzerne', cardId: 'd1', location: 'deutschland' }
  },
  november: {
    6: { type: 'saarland', title: 'Solar-Pflicht Neubauten', cardId: 's2', location: 'saarland' },
    13: { type: 'bundesweit', title: 'Tempolimit 130 km/h auf Autobahnen', cardId: 'd2', location: 'deutschland' },
    20: { type: 'saarland', title: 'Kreisklinikum Modernisierung', cardId: 'sp1', location: 'saarland' },
    27: { type: 'kirkel', title: 'Radwege-Erweiterung', cardId: 'k4', location: 'kirkel' }
  },
  dezember: {
    4: { type: 'bundesweit', title: 'Vermögenssteuer ab 2 Millionen Euro', cardId: 'd3', location: 'deutschland' },
    11: { type: 'saarland', title: 'Kita-Gebühren abschaffen', cardId: 's3', location: 'saarland' },
    18: { type: 'saarland', title: 'Radwegenetz Kreisstraßen', cardId: 'sp2', location: 'saarland' },
    25: { type: 'kirkel', title: 'Bürgergarten-Projekt', cardId: 'k5', location: 'kirkel' },
    31: { type: 'bundesweit', title: 'Atomkraft-Ausstieg final', cardId: 'd4', location: 'deutschland' }
  }
};
