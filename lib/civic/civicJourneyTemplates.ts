/**
 * Deterministic civic journey templates — structured Behördenwege, not freeform AI.
 */

export type CivicJourneyId =
  | 'child_birth_kita'
  | 'moving_with_children'
  | 'care_family'
  | 'business_registration';

export type CivicJourneyTemplate = {
  id: CivicJourneyId;
  title: string;
  triggerPhrases: string[];
  defaultMode: 'private' | 'business' | 'unsure';
  quickStartText: string;
  topicLabels: string[];
  orderedSteps: string[];
  suggestedAuthorities: string[];
  relevantServiceKeywords: string[];
  catalogServiceIds: string[];
  uncataloguedStepLabels: string[];
  missingQuestionTemplates: {
    id: string;
    questionDu: string;
    questionSie: string;
    skipIfTextMatches?: RegExp;
  }[];
  situationSummaryDu: string;
  situationSummarySie: string;
};

export const CIVIC_JOURNEY_TEMPLATES: CivicJourneyTemplate[] = [
  {
    id: 'child_birth_kita',
    title: 'Geburt & Familie',
    triggerPhrases: [
      'bekomme ein kind',
      'geburt',
      'schwanger',
      'kita',
      'kindergeld',
      'elterngeld',
      'krankenversicherung',
      'elternzeit',
      'baby',
      'neugeboren',
    ],
    defaultMode: 'private',
    quickStartText:
      'Ich bekomme ein Kind. An was muss ich alles denken? Welche Formulare und Behördengänge sind nötig?',
    topicLabels: ['Familie', 'Gesundheit', 'Kinderbetreuung'],
    orderedSteps: [
      'Vor der Geburt: Krankenversicherung, Mutterschaftsgeld und Elternzeit mit Arbeitgeber und Krankenkasse klären',
      'Nach der Geburt: Geburtsurkunde beim Standesamt beantragen',
      'Kindergeld bei der Familienkasse beantragen',
      'Elterngeld vorbereiten und Antrag bei der zuständigen Elterngeldstelle einreichen',
      'Kita-Platz / Kinderbetreuung in Kirkel frühzeitig prüfen und anmelden',
      'Unterlagen sammeln (Geburtsurkunde, Einkommensnachweise, Versicherungsnachweise)',
      'Lokale Zuständigkeit für Kirkel, Saarland im Blick behalten',
    ],
    suggestedAuthorities: [
      'Standesamt',
      'Familienkasse',
      'Elterngeldstelle',
      'Krankenkasse',
      'Kita / Kinderbetreuung (Kommune Kirkel)',
      'Arbeitgeber (Mutterschaftsgeld / Elternzeit)',
    ],
    relevantServiceKeywords: [
      'elterngeld',
      'kindergeld',
      'kita',
      'kinderbetreuung',
      'krankenversicherung',
      'geburt',
      'standesamt',
    ],
    catalogServiceIds: ['vc-elterngeld', 'vc-kindergeld', 'vc-kita'],
    uncataloguedStepLabels: ['Geburtsurkunde / Standesamt Kirkel'],
    missingQuestionTemplates: [
      {
        id: 'born-or-expected',
        questionDu: 'Ist das Kind bereits geboren oder erwartest du es?',
        questionSie: 'Ist das Kind bereits geboren oder erwarten Sie es?',
        skipIfTextMatches: /geboren|schwanger|erwarte|erwartet/i,
      },
      {
        id: 'kita-timing',
        questionDu: 'Ab wann brauchst du einen Kita-Platz?',
        questionSie: 'Ab wann benötigen Sie einen Kita-Platz?',
        skipIfTextMatches: /kita|betreuung|kinderbetreuung/i,
      },
      {
        id: 'insurance-type',
        questionDu: 'Bist du gesetzlich oder privat krankenversichert?',
        questionSie: 'Sind Sie gesetzlich oder privat krankenversichert?',
        skipIfTextMatches: /krankenversicher|gesetzlich versichert|privat versichert/i,
      },
    ],
    situationSummaryDu:
      'Du erwartest ein Kind und möchtest wissen, welche Anträge, Unterlagen und nächsten Schritte wichtig sind.',
    situationSummarySie:
      'Sie erwarten ein Kind und möchten wissen, welche Anträge, Unterlagen und nächsten Schritte wichtig sind.',
  },
  {
    id: 'moving_with_children',
    title: 'Umzug mit Kindern',
    triggerPhrases: [
      'ziehe um',
      'umzug mit kindern',
      'umzug',
      'neue stadt',
      'schule wechseln',
      'wohnsitz anmelden',
      'ummeld',
      'miete',
      'wohngeld',
    ],
    defaultMode: 'private',
    quickStartText:
      'Ich ziehe mit Kindern um und brauche Orientierung zu Ummeldung, Schule, Wohngeld und weiteren Schritten.',
    topicLabels: ['Wohnen', 'Familie', 'Schule'],
    orderedSteps: [
      'Wohnsitz in Kirkel anmelden / Ummeldung beim Bürgeramt vorbereiten',
      'Schule / Schulwechsel für die Kinder klären',
      'Wohngeld prüfen, falls Miete und Einkommen belastend sind',
      'Kindergeld-Adresse und Familiendaten bei der Familienkasse aktualisieren',
      'Kita- oder Betreuungsplatz prüfen, falls relevant',
      'Unterlagen sammeln (Ausweis, Wohnungsgeberbestätigung, Mietvertrag)',
      'Lokale Zuständigkeit für Kirkel, Saarland prüfen',
    ],
    suggestedAuthorities: [
      'Meldebehörde / Bürgeramt Kirkel',
      'Schule / Schulamt',
      'Wohngeldstelle',
      'Familienkasse',
      'Jugendamt / Kinderbetreuung',
    ],
    relevantServiceKeywords: ['ummeld', 'umzug', 'wohngeld', 'kindergeld', 'schule', 'miete'],
    catalogServiceIds: ['vc-ummeldung', 'vc-wohngeld', 'vc-kindergeld', 'vc-kita'],
    uncataloguedStepLabels: ['Schulwechsel / Schulamt'],
    missingQuestionTemplates: [
      {
        id: 'move-date',
        questionDu: 'Wann ist der Umzug geplant?',
        questionSie: 'Wann ist der Umzug geplant?',
        skipIfTextMatches: /ab \d|nächste woche|monat|datum/i,
      },
      {
        id: 'school-change',
        questionDu: 'Wechseln deine Kinder die Schule?',
        questionSie: 'Wechseln Ihre Kinder die Schule?',
        skipIfTextMatches: /schule|schulwechsel/i,
      },
      {
        id: 'rent-support',
        questionDu: 'Spielt Wohngeld oder Mietunterstützung eine Rolle?',
        questionSie: 'Spielt Wohngeld oder Mietunterstützung eine Rolle?',
        skipIfTextMatches: /wohngeld|miete|einkommen/i,
      },
    ],
    situationSummaryDu:
      'Du planst einen Umzug mit Kindern und brauchst einen Überblick über Ummeldung, Schule und mögliche Unterstützung.',
    situationSummarySie:
      'Sie planen einen Umzug mit Kindern und brauchen einen Überblick über Ummeldung, Schule und mögliche Unterstützung.',
  },
  {
    id: 'care_family',
    title: 'Pflegefall in der Familie',
    triggerPhrases: [
      'pflegefall',
      'pflegebedürftig',
      'pflegegrad',
      'angehörige',
      'pflegeleistungen',
      'pflegekasse',
      'pflege',
    ],
    defaultMode: 'private',
    quickStartText:
      'In meiner Familie gibt es einen Pflegefall. Welche Leistungen und Stellen sind relevant?',
    topicLabels: ['Pflege', 'Gesundheit', 'Familie'],
    orderedSteps: [
      'Pflegebedarf und Unterstützungsbedarf einordnen',
      'Pflegegrad-Antrag bei der Pflegekasse vorbereiten',
      'Beratungsangebote und Pflegestützpunkte nutzen',
      'Leistungen der Pflegekasse und ggf. Sozialhilfe prüfen',
      'Entlastungsleistungen und Angehörigenunterstützung klären',
      'Unterlagen sammeln (Atteste, Versichertennachweis, Anträge)',
      'Lokale Anlaufstellen für Kirkel, Saarland recherchieren',
    ],
    suggestedAuthorities: [
      'Pflegekasse',
      'Medizinischer Dienst (MD)',
      'Pflegestützpunkt',
      'Sozialamt (falls relevant)',
    ],
    relevantServiceKeywords: ['pflege', 'pflegegrad', 'pflegekasse', 'angehörige'],
    catalogServiceIds: ['vc-pflege'],
    uncataloguedStepLabels: ['Pflegestützpunkt / Beratung vor Ort'],
    missingQuestionTemplates: [
      {
        id: 'care-setting',
        questionDu: 'Wird zu Hause oder in einer Einrichtung gepflegt?',
        questionSie: 'Wird zu Hause oder in einer Einrichtung gepflegt?',
        skipIfTextMatches: /zu hause|heim|einrichtung|ambulant/i,
      },
      {
        id: 'care-grade',
        questionDu: 'Liegt bereits ein Pflegegrad vor?',
        questionSie: 'Liegt bereits ein Pflegegrad vor?',
        skipIfTextMatches: /pflegegrad|begutachtung|mdk/i,
      },
    ],
    situationSummaryDu:
      'Du begleitest einen Pflegefall in der Familie und suchst Orientierung zu Leistungen und zuständigen Stellen.',
    situationSummarySie:
      'Sie begleiten einen Pflegefall in der Familie und suchen Orientierung zu Leistungen und zuständigen Stellen.',
  },
  {
    id: 'business_registration',
    title: 'Gewerbe & Selbstständigkeit',
    triggerPhrases: [
      'gewerbe anmelden',
      'unternehmen gründen',
      'selbstständig',
      'finanzamt',
      'ihk',
      'berufsgenossenschaft',
      'gewerbe',
      'gründen',
      'existenzgründ',
    ],
    defaultMode: 'business',
    quickStartText:
      'Ich möchte ein Gewerbe anmelden und bin unsicher, welche Stellen ich informieren muss — Gewerbeamt, Finanzamt, IHK.',
    topicLabels: ['Gründung', 'Gewerbe', 'Steuern'],
    orderedSteps: [
      'Gewerbe beim zuständigen Gewerbeamt in Kirkel anmelden',
      'Steuerliche Erfassung beim Finanzamt vorbereiten',
      'IHK / HWK prüfen, falls kammerpflichtig',
      'Berufsgenossenschaft zur Unfallversicherung anmelden',
      'Versicherungen und Sozialversicherung bei Selbstständigkeit klären',
      'Unterlagen sammeln (Ausweis, Gewerbeanmeldung, ggf. Handwerkskarte)',
      'Lokale Zuständigkeit für Kirkel, Saarland bestätigen',
    ],
    suggestedAuthorities: [
      'Gewerbeamt Kirkel',
      'Finanzamt',
      'IHK / Handwerkskammer',
      'Berufsgenossenschaft',
    ],
    relevantServiceKeywords: ['gewerbe', 'gründ', 'finanzamt', 'ihk', 'berufsgenossenschaft', 'selbstständig'],
    catalogServiceIds: ['vc-gewerbe', 'vc-gruendung', 'vc-finanzamt', 'vc-kammer', 'vc-bg'],
    uncataloguedStepLabels: [],
    missingQuestionTemplates: [
      {
        id: 'business-type',
        questionDu: 'Handwerk, Handel oder freier Beruf?',
        questionSie: 'Handwerk, Handel oder freier Beruf?',
        skipIfTextMatches: /handwerk|handel|freiberuf|dienstleistung/i,
      },
      {
        id: 'employees',
        questionDu: 'Planst du Mitarbeitende einzustellen?',
        questionSie: 'Planen Sie Mitarbeitende einzustellen?',
        skipIfTextMatches: /mitarbeiter|personal|einstell/i,
      },
    ],
    situationSummaryDu:
      'Du möchtest ein Gewerbe anmelden oder dich selbstständig machen und brauchst einen Überblick über die wichtigsten Stellen.',
    situationSummarySie:
      'Sie möchten ein Gewerbe anmelden oder sich selbstständig machen und brauchen einen Überblick über die wichtigsten Stellen.',
  },
];

export function getJourneyTemplateById(id: CivicJourneyId): CivicJourneyTemplate | undefined {
  return CIVIC_JOURNEY_TEMPLATES.find((t) => t.id === id);
}
