/**
 * App-Konstanten: Wahlen, Abstimmungen, Themen, Rangliste, News
 */
import { WAHLEN_DEUTSCHLAND } from './wahlen-deutschland';
import type { VotingCard, VotingData, LeaderboardItem, NewsItem } from '@/types';

export const WAHLEN_DATA = WAHLEN_DEUTSCHLAND;

export const THEME_NAMES: Record<string, string> = {
  umwelt: 'Umwelt & Energie',
  finanzen: 'Finanzen & Wirtschaft',
  bildung: 'Bildung',
  digital: 'Digitalisierung',
  soziales: 'Soziales',
  sicherheit: 'Sicherheit',
};

/** Einheitliche Demo-Punkte pro Abstimmungskarte (Anzeige + HANDLE_VOTE). Früher pro Karte unterschiedlich – das wirkte inkonsistent. */
export const DEMO_POINTS_PER_ABSTIMMUNG = 250;

/** Demo-Punkte pro abgegebener Stimme bei Wahlen (RECORD_ELECTION_VOTE). */
export const DEMO_POINTS_PER_WAHL = 200;

/** Demo-Punkte pro erfolgreich gesendeter Meldung (RECORD_MELDUNG_SUBMITTED). */
export const DEMO_POINTS_PER_MELDUNG = 75;

// ─── Helper ──────────────────────────────────────────────────────────────────

function card(
  id: string,
  title: string,
  desc: string,
  deadline: string,
  yes: number,
  no: number,
  votes: number,
  /** @deprecated Wird ignoriert; Punkte sind einheitlich DEMO_POINTS_PER_ABSTIMMUNG */
  _legacyPoints: number,
  urgent: boolean,
  claraPro: string,
  claraCon: string,
  theme: string,
  emoji = '🗳️'
): VotingCard {
  /** Anteil „Enthaltung/Unentschieden“ in Prozent; Balken muss mit yes+no zusammen 100 ergeben. */
  const abstain = Math.max(0, 100 - yes - no);
  return {
    id,
    title,
    deadline,
    emoji,
    category: theme,
    description: desc,
    quickFacts: [
      `${yes}% Dafür`,
      `${no}% Dagegen`,
      `${votes.toLocaleString('de-DE')} Stimmen`,
    ],
    yes,
    no,
    abstain,
    votes,
    points: DEMO_POINTS_PER_ABSTIMMUNG,
    claraMatch: Math.round(60 + Math.random() * 30),
    urgent,
    kiAnalysis: {
      pros: [{ text: claraPro, source: 'Clara', weight: 1 }],
      cons: [{ text: claraCon, source: 'Clara', weight: 1 }],
      claraEinschätzung: 'Abwägung zwischen Nutzen und Aufwand.',
      financialImpact: 'Moderate Haushaltsauswirkungen.',
      environmentalImpact: 'Je nach Thema relevant.',
    },
  };
}

// ─── Bundesebene ─────────────────────────────────────────────────────────────

const bundCards: VotingCard[] = [
  card(
    'bund-1',
    'Bundesweite Klima-Investitionen 2026',
    'Beschluss über 40 Mrd. € zusätzliche Mittel für erneuerbare Energien, Gebäudesanierung und klimafreundliche Mobilität bis 2030.',
    '31.03.2026', 68, 22, 1_240_000, 500, true,
    'Klimaschutz, Arbeitsplätze, Unabhängigkeit von fossilen Energien.',
    'Haushaltsbelastung, Verteilungsfragen, langer Umsetzungshorizont.',
    'Umwelt & Klima', '🌱'
  ),
  card(
    'bund-2',
    'Digitalisierung der Verwaltung – OZG 2.0',
    'Bundesprogramm zur vollständigen Digitalisierung aller Verwaltungsleistungen bis Ende 2026 inklusive E-Government-Identität.',
    '15.05.2026', 74, 18, 980_000, 400, false,
    'Effizienz, Bürgernähe, 24/7-Erreichbarkeit, weniger Amtswege.',
    'Datenschutz, Umsetzungsrisiken, digitale Kluft bei älteren Bürgerinnen.',
    'Digitalisierung', '💻'
  ),
  card(
    'bund-3',
    'Mindestlohn 15 € / Stunde',
    'Erhöhung des gesetzlichen Mindestlohns von derzeit 12,41 € auf 15,00 € zum 1. Oktober 2026.',
    '01.07.2026', 71, 21, 1_580_000, 350, true,
    'Kaufkraft, Armutsbekämpfung, faire Entlohnung.',
    'Belastung kleiner Betriebe, mögliche Beschäftigungseffekte.',
    'Soziales', '💼'
  ),
  card(
    'bund-4',
    'Wehrpflicht-Reform: Freiwilligendienst+',
    'Einführung eines neuen Freiwilligendienstmodells mit gezielten Anreizen statt verpflichtender Musterung.',
    '30.06.2026', 55, 35, 875_000, 300, false,
    'Verteidigungsfähigkeit, Gemeinschaftssinn, attraktive Rahmenbedingungen.',
    'Kosten, Reichweite, Vereinbarkeit mit Beruf und Ausbildung.',
    'Sicherheit', '🛡️'
  ),
  card(
    'bund-5',
    'Hochwasser- und Starkregenvorsorge Flüsse 2027',
    'Bündelmaßnahmen für Deiche, Rückhaltebecken und kommunale Alarmketten; Mittelbereitstellung und Prioritätenliste.',
    '10.09.2026', 62, 28, 920_000, 300, true,
    'Mehr Resilienz, bessere Frühwarnung, Schutz von Infrastruktur und Wohngebieten.',
    'Hoher Finanzbedarf, langfristige Planung, Abstimmung mit Ländern und Kommunen.',
    'Umwelt & Klima', '🌊'
  ),
  card(
    'bund-6',
    'E-Government: Nutzerstudie & Serviceverbesserung',
    'Bürgerbefragung und Pilotierung vereinfachter Online-Verfahren für häufige Anträge.',
    '28.10.2026', 70, 20, 1_050_000, 300, false,
    'Bessere Usability, messbare Verbesserung, Bürgerbeteiligung an der Gestaltung.',
    'Umsetzungszeit, Datenschutz, belastbare IT-Architektur.',
    'Digitalisierung', '💻'
  ),
  card(
    'bund-7',
    'Bürgerdialog kommunaler Haushalt (Bund Demo)',
    'Online-Anhörung zu Schwerpunkten Bildung, Klima und Sicherheit vor dem Haushaltsentwurf.',
    '12.12.2026', 58, 32, 890_000, 300, false,
    'Transparenz, frühzeitige Einbindung, sachliche Priorisierung.',
    'Komplexität des Themas, begrenzte Kapazität für individuelle Rückmeldungen.',
    'Finanzen & Steuern', '📊'
  ),
];

// ─── Landesebene Saarland ─────────────────────────────────────────────────────

const landCards: VotingCard[] = [
  card(
    'land-1',
    'Landesweite Bildungsreform Saarland',
    'Zusätzliche 320 Lehrerstellen, Ausbau der Ganztagsgrundschulen, Digitalpakt Schule II für alle saarländischen Schulen.',
    '20.04.2026', 71, 21, 420_000, 250, false,
    'Chancengleichheit, Qualitätssteigerung, Entlastung der Eltern.',
    'Kosten (ca. 80 Mio. €/Jahr), Herausforderungen bei der Lehrergewinnung.',
    'Bildung', '🏫'
  ),
  card(
    'land-2',
    'Saarlandpakt Mobilität 2030',
    'Ausbau des ÖPNV, Einführung eines 29-€-Tickets für Saarland sowie Investitionen in Rad- und Fußwege.',
    '15.06.2026', 65, 26, 310_000, 200, false,
    'Weniger Staus, CO₂-Reduktion, attraktives Leben ohne Auto.',
    'Finanzierungslücke, Umsetzungsdauer, ländliche Gebiete schwer erreichbar.',
    'Umwelt & Klima', '🚌'
  ),
  card(
    'land-3',
    'Strukturwandel Saar – Stahlindustrie & Energie',
    'Beschluss über ein Transformationspaket für die Stahlindustrie an der Saar (Direktreduktion, Wasserstoff).',
    '30.05.2026', 69, 23, 195_000, 280, true,
    'Arbeitsplatzsicherung, Innovation, klimaneutrale Produktion.',
    'Hohe Investitionen, Abhängigkeit von EU-Fördermitteln, Zeitdruck.',
    'Finanzen & Steuern', '🏭'
  ),
  card(
    'land-4',
    'Landesprogramm kommunale Wärmeplanung',
    'Frist für Stellungnahmen der Kommunen zum Förderprogramm Wärmenetze und Gebäudesanierung.',
    '22.08.2026', 66, 24, 205_000, 280, false,
    'Klarer Fahrplan für Kommunen, Fördermittel, Klimaschutz vor Ort.',
    'Verwaltungsaufwand, Datengrundlagen, Priorisierung zwischen Kommunen.',
    'Umwelt & Klima', '♨️'
  ),
  card(
    'land-5',
    'Landesgesundheitspakt – Psychiatrie & Notfallversorgung',
    'Beschluss über zusätzliche Plätze und Vernetzung Rettungsdienst / Kliniken.',
    '20.11.2026', 63, 27, 188_000, 280, true,
    'Kürzere Wartezeiten, bessere Versorgung, belastbare Finanzierung.',
    'Personalgewinnung, Raumkonzept, langfristige Trägerverantwortung.',
    'Soziales', '🏥'
  ),
];

// ─── Kreisebene Saarpfalz-Kreis ───────────────────────────────────────────────

const kreisCards: VotingCard[] = [
  card(
    'kreis-1',
    'Radwegenetz Saarpfalz-Kreis ausbauen',
    'Lückenschlüsse im Radwegenetz zwischen allen Städten und Gemeinden des Saarpfalz-Kreises (24 km neue Trassen).',
    '15.04.2026', 76, 17, 48_500, 200, false,
    'Sicherheit, Klimaschutz, attraktive Nahmobilität für alle Altersgruppen.',
    'Kosten (ca. 5 Mio. €), Flächenbedarf, Abstimmung mit Kommunen.',
    'Umwelt & Klima', '🚲'
  ),
  card(
    'kreis-2',
    'Digitale Kreisverwaltung – alle Dienste online',
    'Vollständige Digitalisierung aller Dienstleistungen des Saarpfalz-Kreises bis Ende 2026 inkl. Online-Terminbuchung.',
    '30.06.2026', 72, 20, 37_200, 180, false,
    'Weniger Wartezeiten, bürgerfreundlich, ortsunabhängig.',
    'IT-Sicherheit, Schulungsbedarf, nicht alle Bürger digital affin.',
    'Digitalisierung', '🖥️'
  ),
  card(
    'kreis-3',
    'Jugendförderplan Saarpfalz 2026–2030',
    'Ausbau der Jugendtreffs, Jugendberufshilfe und Schuldenberatung für junge Menschen im Kreisgebiet.',
    '25.05.2026', 81, 12, 29_800, 160, false,
    'Chancen für Jugendliche, Prävention, soziale Integration.',
    'Finanzierung über Kreisumlage, Personalgewinnung.',
    'Soziales', '👦'
  ),
  card(
    'kreis-4',
    'Kreisarchiv – Digitalisierung Bürgerbeteiligung',
    'Priorisierung von Aktenbeständen für Online-Recherche und Bürgeranfragen.',
    '08.09.2026', 73, 19, 31_200, 180, false,
    'Transparenz, schnellere Auskunft, Schutz historischer Bestände.',
    'Kosten Digitalisierung, Datenschutz, Priorisierung der Bestände.',
    'Digitalisierung', '📂'
  ),
  card(
    'kreis-5',
    'Regionalbus-Linien Saarpfalz 2027',
    'Taktverdichtung und neue Haltestellen; Abstimmung über Finanzierungsanteil Kreis/Kommunen.',
    '25.11.2026', 67, 23, 28_400, 180, false,
    'Bessere Erreichbarkeit, weniger Umsteigen, attraktiver ÖPNV.',
    'Haushaltsbelastung, Bauzeit, Akzeptanz im ländlichen Raum.',
    'Umwelt & Klima', '🚌'
  ),
];

// ─── Kommunalebene Kirkel ─────────────────────────────────────────────────────

const kirkelCards: VotingCard[] = [
  card(
    'kirkel-1',
    'Digitale Ausstattung von Schulen · Sanierung Kirkel-Halle',
    'Vollsanierung der Gemeindehalle Kirkel: Energetische Ertüchtigung (Wärmepumpe, Dämmung), barrierefreier Umbau und neue Bühne. Gesamtkosten: ca. 2,1 Mio. €.',
    '30.03.2026', 74, 18, 4_820, 150, true,
    'Wichtigster Versammlungsort für Vereine und Bürger, energetische Einsparung von ca. 35 %.',
    'Gesamtkosten ca. 2,1 Mio. €; Finanzierung inkl. Darlehensanteil ist im Haushaltsbeschluss zu konkretisieren; Nutzungseinschränkung ca. 8 Monate.',
    'Bildung', '🏛️'
  ),
  card(
    'kirkel-2',
    'Radweg Kirkel – Limbach (Lückenschluss)',
    'Neubau eines geschützten Radwegs entlang der L 105 zwischen Kirkel-Neuhäusel und Limbach (2,4 km). Verbindet drei Ortsteile sicher miteinander.',
    '15.04.2026', 80, 12, 6_140, 120, false,
    'Sicherheit für Radfahrer und Schulkinder, Nahmobilität, Klimaschutz.',
    'Flächenumwidmung nötig, Kosten ca. 380.000 €, Bauzeit ca. 6 Monate.',
    'Umwelt & Klima', '🚲'
  ),
  card(
    'kirkel-3',
    'Bürgerbeteiligung Solarprojekt Kirkel',
    'Photovoltaikanlage (180 kWp) auf dem Dach der Grundschule Limbach. Deckung von ca. 60 % des Schulstrombedarfs, Einspeisung überschüssiger Energie.',
    '01.05.2026', 88, 8, 5_230, 100, false,
    'Klimaschutz, langfristige Kosteneinsparung, Vorbildfunktion für Schüler.',
    'Förderantrag noch nicht bewilligt, Wartungskosten, Dachlast prüfen.',
    'Umwelt & Klima', '☀️'
  ),
  card(
    'kirkel-4',
    'Beteiligung Familien- und Jugendangebote – Spielplatz Bürgerpark',
    'Erneuerung und Erweiterung des Spielplatzes im Bürgerpark: Kletterturm, Wasserspielanlage, Sitzbereich für Eltern, barrierefreier Zugang.',
    '20.05.2026', 91, 6, 7_350, 80, false,
    'Attraktivität für Familien, Treffpunkt im Ort, inklusiv gestaltbar.',
    'Kosten ca. 220.000 €, Pflege- und Unterhaltungsaufwand dauerhaft.',
    'Soziales', '🛝'
  ),
  card(
    'kirkel-5',
    'Beteiligung zum digitalen Bürgerportal Saarland',
    'Online-Portal für Meldewesen, Termin buchen, Kita-Anmeldung, Mängelmelder und Anfragen an die Gemeindeverwaltung.',
    '30.06.2026', 77, 15, 5_890, 90, false,
    'Weniger Amtswege, 24/7-Erreichbarkeit, modern und bürgerfreundlich.',
    'IT-Kosten, Schulungsbedarf der Mitarbeitenden, Datenschutz sicherstellen.',
    'Digitalisierung', '📱'
  ),
  card(
    'kirkel-6',
    'Leerstandsmanagement Ortskern Kirkel',
    'Programm zur Aktivierung leerstehender Gebäude im Ortskern Kirkel: Beratungsangebot, Eigentümer-Ansprache, Förderprogramm für Umbau zu Wohnen/Gewerbe.',
    '15.07.2026', 68, 24, 4_120, 110, false,
    'Belebung des Ortskerns, Wohnraum, Steuereinnahmen, Heimatpflege.',
    'Eigentümer nicht immer kooperativ, Fördervolumen begrenzt, langwierig.',
    'Finanzen & Steuern', '🏘️'
  ),
  card(
    'kirkel-7',
    'Klimaschutzkonzept Gemeinde Kirkel – Maßnahmenpaket II',
    'Bürgerbeteiligung zu Maßnahmen Mobilität, Energie und Grünflächen bis 2030.',
    '28.08.2026', 75, 17, 4_350, 110, true,
    'Klare Ziele, Fördermittel, messbare CO₂-Reduktion.',
    'Umsetzungskosten, Priorisierung zwischen Ortsteilen.',
    'Umwelt & Klima', '🌿'
  ),
  card(
    'kirkel-8',
    'Ortskernbeleuchtung LED-Umrüstung',
    'Energieeffiziente Straßen- und Platzbeleuchtung mit dimmbaren Leuchten und Dunkelphase.',
    '19.09.2026', 70, 21, 4_010, 110, false,
    'Stromersparnis, weniger Lichtverschmutzung, mehr Sicherheit.',
    'Anschaffungskosten, Wartungskonzept, Optik im Denkmalbereich.',
    'Digitalisierung', '💡'
  ),
  card(
    'kirkel-9',
    'Friedhof Limbach – Erweiterung Ruhewald',
    'Flächenerweiterung und naturnahe Bestattungsformen; Umwelt- und Denkmalauflagen.',
    '14.10.2026', 62, 28, 3_680, 110, false,
    'Mehr Kapazität, respektvoller Umgang, naturnahe Gestaltung.',
    'Flächenbedarf, Nachbarschaft, langfristige Pflegekosten.',
    'Soziales', '🌳'
  ),
  card(
    'kirkel-10',
    'Seniorentreff Kirkel-Neuhäusel – barrierefreier Anbau',
    'Gemeinschaftsraum, Küche und barrierefreie Sanitäranlagen für Treff- und Beratungsangebote.',
    '06.11.2026', 79, 14, 3_920, 110, false,
    'Teilhabe, soziale Kontakte, entlastete Angehörige.',
    'Baukosten, Betreuungspersonal, dauerhafter Betrieb.',
    'Soziales', '👴'
  ),
  card(
    'kirkel-11',
    'Kita-Beiträge 2027 – Elternbeteiligung',
    'Anpassung der Elternbeiträge nach Kostendeckungsprinzip; Anhörung vor Gemeinderatsbeschluss.',
    '27.11.2026', 58, 30, 3_540, 110, false,
    'Planbare Finanzen, Qualität der Betreuung, Transparenz.',
    'Belastung Haushalte, Ausnahmeregelungen, Verwaltungsaufwand.',
    'Finanzen & Steuern', '🧸'
  ),
  card(
    'kirkel-12',
    'Dialog Katastrophenschutz und Warnsysteme (Demo Kirkel)',
    'Bürgerdialog zu Warnketten, Katastrophenschutz und Kommunikation bei Ereignissen; keine operative Entscheidung.',
    '10.12.2026', 82, 11, 4_200, 110, false,
    'Transparenz zu Abläufen, bessere Orientierung, Feedback zu Kommunikationswegen.',
    'Kein Ersatz für Notrufe; Fokus auf strukturierte Hinweise und Nachvollziehbarkeit.',
    'Sicherheit', '🛡️'
  ),
];

// ─── Kommunale Orte (Frankfurt/Bremen/Berlin/etc.) ─────────────────────────
const frankfurtCards: VotingCard[] = [
  card(
    'frankfurt-1',
    'Kommunaler Wohnungsbau-Boost 2026',
    'Beschleunigung von Neubauverfahren und Sanierungsstandards für bezahlbaren Wohnraum.',
    '10.04.2026',
    70,
    20,
    1_100_000,
    320,
    false,
    'Mehr Wohnungen und schnellere Genehmigungen.',
    'Tempo vs. Qualität/soziale Auswirkungen müssen sauber umgesetzt werden.',
    'Soziales',
    '🏘️'
  ),
  card(
    'frankfurt-2',
    'Klimaneutrale Verkehrswende 2026',
    'Ausbau von Radwegen, ÖPNV-Takt und sicheren Schulwegen zur Reduktion von CO2.',
    '28.05.2026',
    66,
    24,
    860_000,
    280,
    true,
    'Nachhaltige Mobilität und geringere Emissionen.',
    'Investitionsbedarf und Umstellungsphase für Verkehrsteilnehmende.',
    'Umwelt & Klima',
    '🚲'
  ),
  card(
    'frankfurt-3',
    'Digitale Verwaltung für alle 2026',
    'Bürgerdienste mit klaren Online-Prozessen (Anträge, Termine, Status) inkl. Barrierefreiheit.',
    '15.06.2026',
    60,
    30,
    650_000,
    200,
    false,
    'Weniger Aufwand für Bürger:innen und schnellere Auskunft.',
    'Datenschutz, Usability und Betreuung der digitalen Angebote sind entscheidend.',
    'Digitalisierung',
    '💻'
  ),
  card(
    'frankfurt-4',
    'Frankfurt – Mobilitätsbudget Schulen 2027',
    'Priorisierung von Schulwegen, ÖPNV-Zuschüssen und Verkehrsprojekten im Stadtgebiet.',
    '12.10.2026',
    64,
    22,
    920_000,
    280,
    false,
    'Sicherere Schulwege und planbare Investitionen.',
    'Haushaltsmittel müssen mit anderen Bildungsprojekten abgewogen werden.',
    'Bildung',
    '🎒'
  ),
];

const mannheimCards: VotingCard[] = [
  card(
    'mannheim-1',
    'Quartierssanierung 2026 – energetisch & sozial',
    'Förderung von Gebäudesanierungen mit sozialem Ausgleich und Modernisierung der Infrastruktur.',
    '12.04.2026',
    72,
    18,
    520_000,
    300,
    false,
    'Energieeinsparungen, bessere Wohnqualität.',
    'Sanierungsdruck und mögliche Mietsteigerungen müssen abgefedert werden.',
    'Umwelt & Klima',
    '🏡'
  ),
  card(
    'mannheim-2',
    'Energieeffizienz-Offensive 2026',
    'Ausbau von Wärmeversorgung, Gebäudetechnik und Beratungsangeboten für Bürger:innen.',
    '22.05.2026',
    65,
    25,
    480_000,
    250,
    true,
    'Stabilere Energiekosten und CO2-Reduktion.',
    'Umstellungskosten und Förderlogistik erfordern gute Steuerung.',
    'Finanzen & Steuern',
    '⚡'
  ),
  card(
    'mannheim-3',
    'Mannheim – Klimaanpassung Innenstadt 2027',
    'Hitzeschutz, Beschattung und Regenwassernutzung in der Quadratestadt.',
    '25.09.2026',
    71,
    19,
    495_000,
    260,
    true,
    'Bessere Aufenthaltsqualität bei Hitzeextremen.',
    'Umsetzung in Denkmalbereichen und Kostensteuerung.',
    'Umwelt & Klima',
    '🌡️'
  ),
];

const heidelbergCards: VotingCard[] = [
  card(
    'heidelberg-1',
    'Neckarufer & Altstadt – Aufenthaltsqualität 2026',
    'Geh- und Aufenthaltsbereiche am Neckar, barrierearme Wege und Aufwertung der Fußgängerzonen in der Kernstadt.',
    '14.04.2026',
    71,
    20,
    420_000,
    280,
    true,
    'Mehr Lebensqualität für Einwohner und Gäste, sichere Schulwege.',
    'Bauphasen und Haushaltsmittel müssen priorisiert werden.',
    'Soziales',
    '🏛️'
  ),
  card(
    'heidelberg-2',
    'Wissenschaftsstandort & Klimapakt Kommune 2026',
    'Sanierung kommunaler Gebäude, Ausbau des ÖPNV und Kooperation mit Uni sowie Universitätsklinikum.',
    '22.05.2026',
    68,
    22,
    380_000,
    250,
    false,
    'Klimaschutz und starke Forschungsregion sichtbar machen.',
    'Abwägung zwischen Einzelprojekten und Gesamtfinanzierung.',
    'Umwelt & Klima',
    '🔬'
  ),
  card(
    'heidelberg-3',
    'Heidelberg – Nachtruhe & Veranstaltungen',
    'Genehmigungsregeln für Open-Air-Veranstaltungen und Lärmschutzmaßnahmen.',
    '03.11.2026',
    59,
    31,
    395_000,
    250,
    false,
    'Ausgewogene Regeln für Kultur und Anwohner.',
    'Abgrenzung zu gewerblichen Events und Kontrollaufwand.',
    'Sicherheit',
    '🎵'
  ),
];

const weinheimCards: VotingCard[] = [
  card(
    'weinheim-1',
    'Radwege & sichere Schulwege 2026',
    'Lückenschlüsse im Radwegenetz und sichere Querungen für Schul- und Pendelrouten.',
    '05.05.2026',
    78,
    12,
    310_000,
    210,
    true,
    'Mehr Sicherheit für Kinder und weniger Verkehrsemissionen.',
    'Baumaßnahmen brauchen Zeit und müssen gut geplant werden.',
    'Sicherheit',
    '🚦'
  ),
  card(
    'weinheim-2',
    'Bildungspaket Digitalisierung 2026',
    'Digitale Lernmittel, Weiterbildung der Lehrkräfte und sichere Schul-IT.',
    '18.06.2026',
    68,
    20,
    280_000,
    190,
    false,
    'Bessere Lernchancen und moderne Unterrichtswege.',
    'Technik muss wartbar sein; gleiche Zugänge sind wichtig.',
    'Bildung',
    '📚'
  ),
  card(
    'weinheim-3',
    'Weinheim – Gewerbegebiet Süd 2027',
    'Erschließung, Verkehrsanbindung und Umweltauflagen für neue Gewerbeflächen.',
    '18.08.2026',
    62,
    27,
    298_000,
    210,
    false,
    'Arbeitsplätze vor Ort, steuerliche Mehreinnahmen.',
    'Verkehrsbelastung und Artenschutz an der Peripherie.',
    'Finanzen & Steuern',
    '🏭'
  ),
];

const viernheimCards: VotingCard[] = [
  card(
    'vierenheim-1',
    'Sozialer Wohnungsbau & Mieten-Schutz 2026',
    'Instrumente gegen Verdrängung: Neubau mit Bindungen und Maßnahmen zur Stabilisierung.',
    '16.04.2026',
    69,
    21,
    240_000,
    260,
    false,
    'Mehr bezahlbarer Wohnraum und fairere Mieten.',
    'Koordination mit Wohnungsmarktakteuren und Umsetzungskapazität.',
    'Soziales',
    '🛡️'
  ),
  card(
    'vierenheim-2',
    'Gesundheits- & Präventionsprogramm 2026',
    'Kombination aus Vorsorgeangeboten, Beratungsstruktur und niederschwelligen Maßnahmen.',
    '09.06.2026',
    73,
    17,
    220_000,
    220,
    false,
    'Bessere Versorgung und frühere Prävention.',
    'Erfolg hängt von nachhaltigen Strukturen und Fachpersonal ab.',
    'Sicherheit',
    '🧠'
  ),
  card(
    'vierenheim-3',
    'Viernheim – Kita-Plätze und Sprachkitas',
    'Ausbau der Betreuungskapazitäten und Förderung mehrsprachiger Erzieher:innen-Teams.',
    '30.10.2026',
    76,
    16,
    235_000,
    220,
    true,
    'Kürzere Wartelisten, Chancen für Kinder mit Migrationshintergrund.',
    'Personalgewinnung und Raum für neue Gruppen.',
    'Bildung',
    '👶'
  ),
];

const neustadtCards: VotingCard[] = [
  card(
    'neustadt-1',
    'Stärkung Weinbau & nachhaltiger Tourismus 2026',
    'Mehr Unterstützung für nachhaltige Landwirtschaft und Besucherlenkung mit Öko-Standards.',
    '20.04.2026',
    61,
    29,
    190_000,
    240,
    false,
    'Wertschöpfung für Region und klimafitte Angebote.',
    'Bedarf an Akzeptanz, Planungssicherheit und verlässlichen Rahmenbedingungen.',
    'Umwelt & Klima',
    '🍇'
  ),
  card(
    'neustadt-2',
    'Klimafeste Stadtinfrastruktur 2026',
    'Hitzeschutz, Entsiegelung und Anpassung an Starkregen – inklusive Maßnahmenpaket für Quartiere.',
    '30.05.2026',
    74,
    16,
    210_000,
    310,
    true,
    'Bessere Resilienz gegen Extremwetter.',
    'Investitionen sind hoch; Priorisierung und Bauzeiten müssen passen.',
    'Umwelt & Klima',
    '🌧️'
  ),
  card(
    'neustadt-3',
    'Neustadt – Weinlagen-Schutz & Tourismus',
    'Auflagen für Events in sensiblen Weinlagen und Nachhaltigkeitslabel Gastronomie.',
    '22.09.2026',
    65,
    25,
    198_000,
    240,
    false,
    'Schutz der Kulturlandschaft und Qualitätstourismus.',
    'Abstimmung mit Winzerinnen und Veranstaltern.',
    'Umwelt & Klima',
    '🍷'
  ),
];

const bremenCards: VotingCard[] = [
  card(
    'bremen-1',
    'Hafen- und Werftmodernisierung digital 2026',
    'Digitale Prozesse, bessere Logistik und Qualifizierung für moderne Arbeitsabläufe.',
    '11.05.2026',
    62,
    26,
    260_000,
    210,
    false,
    'Wettbewerbsfähigkeit und bessere Abläufe.',
    'Übergangsphase und Qualifizierungsbedarf müssen aktiv begleitet werden.',
    'Digitalisierung',
    '⚙️'
  ),
  card(
    'bremen-2',
    'Klimaresilienter Wohnungsbau 2026',
    'Sanierung mit Hitzeschutz und nachhaltiger Gebäudeausrichtung in belasteten Quartieren.',
    '01.06.2026',
    70,
    19,
    230_000,
    280,
    true,
    'Wohlbefinden und niedrigere Energiekosten.',
    'Umsetzung erfordert Planung und verlässliche Finanzierung.',
    'Soziales',
    '🏙️'
  ),
  card(
    'bremen-3',
    'Bremen – Wasserstoff-Hafenlogistik (Pilot)',
    'Investition in H2-Bunkerung und Sicherheitskonzept für Umschlagterminals.',
    '07.12.2026',
    61,
    28,
    245_000,
    220,
    false,
    'Technologieführerschaft und Klimaschutz im Hafen.',
    'Risiko neuer Technologien und hohe Anfangsinvestitionen.',
    'Umwelt & Klima',
    '⛽'
  ),
];

const berlinCards: VotingCard[] = [
  card(
    'berlin-1',
    'Bezahlbares Wohnen 2026 – Neubauoffensive',
    'Mehr Neubau und schnellere Umsetzung mit sozialen Bindungen.',
    '13.04.2026',
    67,
    23,
    920_000,
    350,
    true,
    'Mehr Wohnraum und schnellerer Ausbau.',
    'Risiken: Kapazitäten, Grundstücksverfügbarkeit, sozialer Ausgleich.',
    'Soziales',
    '🏗️'
  ),
  card(
    'berlin-2',
    'Berliner Energiepakt 2026',
    'Beschleunigung von PV-Ausbau, Wärmepumpenberatung und Quartierslösungen.',
    '25.05.2026',
    71,
    19,
    860_000,
    320,
    false,
    'CO2 runter und Energiekosten stabilisieren.',
    'Netzintegration und Investitionssteuerung sind kritisch.',
    'Umwelt & Klima',
    '☀️'
  ),
];

// ─── Bayern & München ────────────────────────────────────────────────────
const bayernCards: VotingCard[] = [
  card(
    'bayern-1',
    'Landesweite Bildungs- & Digital-Offensive 2026',
    'Modernisierung der Schul-IT, Weiterbildung und verlässliche digitale Infrastruktur.',
    '20.04.2026',
    66,
    25,
    540_000,
    280,
    false,
    'Bessere Lernumgebung und gleichere Chancen.',
    'Muss gut gewartet und didaktisch sinnvoll umgesetzt werden.',
    'Bildung',
    '🏫'
  ),
  card(
    'bayern-2',
    'Bayerischer Klimaplan 2026 – Wind & PV',
    'Ausbau erneuerbarer Energien und beschleunigte Genehmigungsprozesse.',
    '29.05.2026',
    72,
    18,
    610_000,
    330,
    true,
    'Mehr erneuerbare Energien und stabile Versorgung.',
    'Akzeptanz, Netzausbau und Standortplanung sind entscheidend.',
    'Umwelt & Klima',
    '🌬️'
  ),
  card(
    'bayern-3',
    'Bayern – Landesprogramm Feuerwehr-Digitalfunk',
    'Ausstattung und Schulung der Hilfsorganisationen; Finanzierungsanteil Land/Kommunen.',
    '16.09.2026',
    74,
    18,
    580_000,
    330,
    true,
    'Zuverlässige Alarmierung und Einsatzführung.',
    'Gerätebeschaffung und laufende Betriebskosten.',
    'Sicherheit',
    '📡'
  ),
];

const muenchenCards: VotingCard[] = [
  card(
    'muenchen-1',
    'ÖPNV-Takt & Mobilitätskomfort 2026',
    'Besserer Takt, barrierearme Haltestellen und sichere Verbindungen im Stadtumfeld.',
    '10.04.2026',
    74,
    16,
    420_000,
    300,
    true,
    'Mehr Fahrten, weniger Wartezeit, bessere Erreichbarkeit.',
    'Betriebskosten und Ausbauplanung müssen realistisch berücksichtigt werden.',
    'Umwelt & Klima',
    '🚌'
  ),
  card(
    'muenchen-2',
    'Digitalisierung im Landratsamt 2026',
    'Digitale Services (Anträge, Termine, Status) mit Fokus auf einfache Bürgerwege.',
    '26.06.2026',
    63,
    28,
    300_000,
    220,
    false,
    'Weniger Wege und schnellere Bearbeitung.',
    'Datenschutz und Usability sind entscheidend für Vertrauen.',
    'Digitalisierung',
    '📲'
  ),
  card(
    'muenchen-3',
    'München – Winterdienst & Gehwegsicherheit',
    'Priorisierung von Räumungsrouten und Streugutmischungen mit Umweltauflagen.',
    '28.11.2026',
    68,
    21,
    315_000,
    230,
    false,
    'Weniger Glatteis, klarere Zuständigkeiten.',
    'Salzreduktion vs. Sicherheit, Nachteinsätze.',
    'Sicherheit',
    '❄️'
  ),
];

// ─── Vergangene Abstimmungen Kirkel ───────────────────────────────────────────

const kirkelVergangen = [
  {
    id: 'kirkel-v1',
    nummer: 'B-2025/03',
    title: 'Bebauungsplan „Wohngebiet Am Schloss" – 45 Wohneinheiten',
    datum: '15.11.2025',
    ergebnis: 'Angenommen' as const,
    yes: 63,
    no: 29,
    abstain: 8,
    votes: 4_280,
  },
  {
    id: 'kirkel-v2',
    nummer: 'B-2025/01',
    title: 'Tempo-30-Zone Hauptstraße Kirkel-Neuhäusel',
    datum: '20.06.2025',
    ergebnis: 'Angenommen' as const,
    yes: 84,
    no: 12,
    abstain: 4,
    votes: 5_410,
  },
  {
    id: 'kirkel-v3',
    nummer: 'B-2024/05',
    title: 'Erweiterung Kita Regenbogen – 2 Gruppen',
    datum: '18.10.2024',
    ergebnis: 'Angenommen' as const,
    yes: 91,
    no: 7,
    abstain: 2,
    votes: 4_970,
  },
];

// ─── Vergangene Abstimmungen (Minimal-Set für „Ergebnisse“) ────────────
const frankfurtVergangen = [
  {
    id: 'frankfurt-v1',
    nummer: 'F-2025/04',
    title: 'Wohnquartiere klimafit – 2025 Vorschlag',
    datum: '12.09.2025',
    ergebnis: 'Angenommen' as const,
    yes: 58,
    no: 32,
    abstain: 10,
    votes: 180_000,
  },
];

const mannheimVergangen = [
  {
    id: 'mannheim-v1',
    nummer: 'MA-2025/02',
    title: 'Radpendler-Netz 2025 – Erweiterung',
    datum: '22.07.2025',
    ergebnis: 'Angenommen' as const,
    yes: 61,
    no: 30,
    abstain: 9,
    votes: 96_000,
  },
];

const heidelbergVergangen = [
  {
    id: 'heidelberg-v1',
    nummer: 'HD-2025/01',
    title: 'ÖPNV-Takt Innenstadt – 2025',
    datum: '12.03.2025',
    ergebnis: 'Angenommen' as const,
    yes: 58,
    no: 31,
    abstain: 11,
    votes: 125_000,
  },
];

const weinheimVergangen = [
  {
    id: 'weinheim-v1',
    nummer: 'WH-2025/01',
    title: 'Schulwege sicherer machen – 2025',
    datum: '03.06.2025',
    ergebnis: 'Angenommen' as const,
    yes: 64,
    no: 27,
    abstain: 9,
    votes: 72_000,
  },
];

const viernheimVergangen = [
  {
    id: 'vierenheim-v1',
    nummer: 'VI-2025/03',
    title: 'Sozialer Wohnungsbau – 2025',
    datum: '18.05.2025',
    ergebnis: 'Abgelehnt' as const,
    yes: 39,
    no: 48,
    abstain: 13,
    votes: 55_000,
  },
];

const neustadtVergangen = [
  {
    id: 'neustadt-v1',
    nummer: 'NS-2025/02',
    title: 'Klimaanpassung Neustadt – 2025',
    datum: '30.08.2025',
    ergebnis: 'Angenommen' as const,
    yes: 57,
    no: 33,
    abstain: 10,
    votes: 41_000,
  },
];

const bremenVergangen = [
  {
    id: 'bremen-v1',
    nummer: 'HB-2025/01',
    title: 'Digitale Hafenlogistik – 2025',
    datum: '14.07.2025',
    ergebnis: 'Angenommen' as const,
    yes: 60,
    no: 29,
    abstain: 11,
    votes: 88_000,
  },
];

const berlinVergangen = [
  {
    id: 'berlin-v1',
    nummer: 'BE-2025/06',
    title: 'Energieberatung im Kiez – 2025',
    datum: '09.11.2025',
    ergebnis: 'Angenommen' as const,
    yes: 62,
    no: 28,
    abstain: 10,
    votes: 210_000,
  },
];

const bayernVergangen = [
  {
    id: 'bayern-v1',
    nummer: 'BY-2024/10',
    title: 'Digitale Schulmittel – 2024',
    datum: '05.10.2024',
    ergebnis: 'Angenommen' as const,
    yes: 55,
    no: 36,
    abstain: 9,
    votes: 430_000,
  },
];

const muenchenVergangen = [
  {
    id: 'muenchen-v1',
    nummer: 'M-2024/03',
    title: 'ÖPNV-Upgrade – 2024',
    datum: '21.09.2024',
    ergebnis: 'Angenommen' as const,
    yes: 52,
    no: 40,
    abstain: 8,
    votes: 180_000,
  },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

export const VOTING_DATA: Record<string, VotingData> = {
  deutschland: { canVote: true, cards: bundCards },
  bundesweit:  { canVote: true, cards: bundCards },
  saarland:    { canVote: true, cards: landCards },
  saarpfalz:   { canVote: true, cards: kreisCards },
  kirkel:      { canVote: true, cards: kirkelCards, vergangen: kirkelVergangen },
  // Städte (Kommune)
  frankfurt: { canVote: true, cards: frankfurtCards, vergangen: frankfurtVergangen },
  mannheim: { canVote: true, cards: mannheimCards, vergangen: mannheimVergangen },
  heidelberg: { canVote: true, cards: heidelbergCards, vergangen: heidelbergVergangen },
  weinheim: { canVote: true, cards: weinheimCards, vergangen: weinheimVergangen },
  viernheim: { canVote: true, cards: viernheimCards, vergangen: viernheimVergangen },
  neustadt: { canVote: true, cards: neustadtCards, vergangen: neustadtVergangen },
  bremen: { canVote: true, cards: bremenCards, vergangen: bremenVergangen },
  berlin: { canVote: true, cards: berlinCards, vergangen: berlinVergangen },
  // Bayern / München
  bayern: { canVote: true, cards: bayernCards, vergangen: bayernVergangen },
  muenchen: { canVote: true, cards: muenchenCards, vergangen: muenchenVergangen },
};

export const LEADERBOARD_DATA: LeaderboardItem[] = [
  { rank: 1, name: 'Baden-Württemberg', participation: 94, medal: 'gold' },
  { rank: 2, name: 'Bayern',            participation: 91, medal: 'silver' },
  { rank: 3, name: 'Hessen',            participation: 88, medal: 'bronze' },
  { rank: 4, name: 'Nordrhein-Westfalen', participation: 85 },
  { rank: 5, name: 'Saarland',          participation: 82 },
  { rank: 6, name: 'Sie (Demo)',         participation: 78, isUser: true },
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title: 'Bürgerbeteiligung in Kommunen nimmt zu',
    source: 'Tagesschau',
    date: '24.01.2026',
    snippet: 'Die digitale Beteiligung an kommunalen Entscheidungen steigt bundesweit.',
    url: 'https://example.com/news/1',
    related: 'Abstimmungen',
  },
  {
    id: 2,
    title: 'Neue eID-Funktionen ab 2026',
    source: 'Bundesregierung',
    date: '20.01.2026',
    snippet: 'Erweiterte Nutzung des Personalausweises für Online-Dienste.',
    url: 'https://example.com/news/2',
    related: 'eID',
  },
  {
    id: 3,
    title: 'Kommunalwahlen 2026 im Saarpfalz-Kreis',
    source: 'Kommunalverband Saar',
    date: '15.01.2026',
    snippet: 'Überblick über anstehende Wahlen in den Kreisen und Gemeinden des Saarlandes.',
    url: 'https://example.com/news/3',
    related: 'Wahlen',
  },
  {
    id: 4,
    title: 'Kirkel: Bürgermeister stellt Haushaltsplan 2026 vor',
    source: 'Saarbrücker Zeitung',
    date: '10.01.2026',
    snippet: 'Der Haushalt 2026 der Gemeinde Kirkel sieht Investitionen in Infrastruktur und Digitalisierung vor.',
    url: 'https://example.com/news/4',
    related: 'Kommune',
  },
];

/** Nach Bestätigung im Live-Bereich oder in den Prämien-Einstellungen: keine erneute Abstimmungs-Hürde. */
export const PRAEMIEN_LIVE_VOTE_GATE_KEY = 'eidconnect_praemien_live_vote_gate_v1';

export function markPraemienLiveVoteGateDone(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRAEMIEN_LIVE_VOTE_GATE_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** true = vor der ersten Abstimmung noch der Hinweis zum freiwilligen Prämienprogramm anzeigen. */
export function needsPraemienLiveVoteGate(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PRAEMIEN_LIVE_VOTE_GATE_KEY) !== '1';
  } catch {
    return true;
  }
}
