/**
 * Deterministic civic journey templates — structured Behördenwege for Kirkel demo.
 */

export type CivicJourneyId =
  | 'child_birth_kita'
  | 'moving_with_children'
  | 'housing_benefits'
  | 'care_family'
  | 'passport_id'
  | 'separation_support'
  | 'retirement_pension'
  | 'business_registration'
  | 'business_change_closure'
  | 'employer_first_hire'
  | 'craft_business_start'
  | 'licensed_trade'
  | 'startup_funding';

export type CivicJourneyTemplate = {
  id: CivicJourneyId;
  title: string;
  domain: 'private' | 'business';
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

const KIRKEL_STEP_SUFFIX = 'Zuständigkeit für Kirkel, Saarland prüfen';

export const CIVIC_JOURNEY_TEMPLATES: CivicJourneyTemplate[] = [
  {
    id: 'child_birth_kita',
    title: 'Geburt & Kita',
    domain: 'private',
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
      'Nach der Geburt: Geburtsurkunde beim Standesamt Kirkel beantragen',
      'Kindergeld bei der Familienkasse beantragen',
      'Elterngeld vorbereiten und bei der zuständigen Elterngeldstelle einreichen',
      'Kita-Platz / Kinderbetreuung in Kirkel frühzeitig prüfen und anmelden',
      'Unterlagen sammeln (Geburtsurkunde, Einkommensnachweise, Versicherungsnachweise)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: [
      'Standesamt Kirkel',
      'Familienkasse',
      'Elterngeldstelle',
      'Krankenkasse',
      'Kita / Kinderbetreuung (Kommune Kirkel)',
    ],
    relevantServiceKeywords: ['elterngeld', 'kindergeld', 'kita', 'krankenversicherung', 'geburt'],
    catalogServiceIds: ['vc-elterngeld', 'vc-kindergeld', 'vc-kita'],
    uncataloguedStepLabels: ['Geburtsurkunde / Standesamt Kirkel'],
    missingQuestionTemplates: [
      {
        id: 'born-or-expected',
        questionDu: 'Ist das Kind bereits geboren?',
        questionSie: 'Ist das Kind bereits geboren?',
        skipIfTextMatches: /geboren|schwanger|erwarte|erwartet/i,
      },
      {
        id: 'kita-timing',
        questionDu: 'Ab wann wird Betreuung benötigt?',
        questionSie: 'Ab wann wird Betreuung benötigt?',
        skipIfTextMatches: /ab \d|kita|betreuung|kinderbetreuung/i,
      },
      {
        id: 'first-child',
        questionDu: 'Geht es um das erste Kind?',
        questionSie: 'Geht es um das erste Kind?',
        skipIfTextMatches: /erstes kind|zweites|drittes|geschwister/i,
      },
      {
        id: 'insurance-type',
        questionDu: 'Liegt bereits eine Krankenkasse fest?',
        questionSie: 'Liegt bereits eine Krankenkasse fest?',
        skipIfTextMatches: /krankenkasse|krankenversichert|gesetzlich|privat versichert/i,
      },
    ],
    situationSummaryDu:
      'Du erwartest ein Kind und möchtest wissen, welche Anträge, Unterlagen und nächsten Schritte in Kirkel wichtig sind.',
    situationSummarySie:
      'Sie erwarten ein Kind und möchten wissen, welche Anträge, Unterlagen und nächsten Schritte in Kirkel wichtig sind.',
  },
  {
    id: 'moving_with_children',
    title: 'Umzug',
    domain: 'private',
    triggerPhrases: [
      'ziehe um',
      'ziehe mit',
      'mit kindern',
      'kindern um',
      'umzug',
      'ummeld',
      'wohnsitz anmelden',
      'nach kirkel',
      'innerhalb kirkel',
      'aus kirkel',
      'neue wohnung',
      'schulwechsel',
      'miete',
    ],
    defaultMode: 'private',
    quickStartText:
      'Ich ziehe um und brauche Orientierung zu Ummeldung, Schule, Wohngeld und weiteren Schritten in Kirkel.',
    topicLabels: ['Wohnen', 'Familie', 'Meldeamt'],
    orderedSteps: [
      'Umzugsrichtung klären: nach Kirkel, innerhalb Kirkel oder aus Kirkel weg',
      'Wohnsitz beim Bürgeramt Kirkel anmelden / ummelden',
      'Schule oder Betreuung prüfen, falls Kinder betroffen sind',
      'Wohngeld prüfen, falls Miete und Einkommen belastend sind',
      'Kindergeld-Adresse und Familiendaten aktualisieren',
      'Fahrzeug ummelden, falls ein Fahrzeug betroffen ist',
      'Unterlagen sammeln (Ausweis, Wohnungsgeberbestätigung, Mietvertrag)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: [
      'Meldebehörde / Bürgeramt Kirkel',
      'Schule / Schulamt',
      'Wohngeldstelle',
      'Familienkasse',
      'Zulassungsstelle (Fahrzeug)',
    ],
    relevantServiceKeywords: ['ummeld', 'umzug', 'wohngeld', 'kindergeld', 'schule'],
    catalogServiceIds: ['vc-ummeldung', 'vc-wohngeld', 'vc-kindergeld'],
    uncataloguedStepLabels: ['Schulwechsel / Schulamt'],
    missingQuestionTemplates: [
      {
        id: 'move-direction',
        questionDu: 'Ziehst du nach Kirkel, innerhalb Kirkel oder aus Kirkel weg?',
        questionSie: 'Ziehen Sie nach Kirkel, innerhalb Kirkel oder aus Kirkel weg?',
        skipIfTextMatches: /nach kirkel|innerhalb|aus kirkel|weg nach/i,
      },
      {
        id: 'children-affected',
        questionDu: 'Sind Kinder betroffen?',
        questionSie: 'Sind Kinder betroffen?',
        skipIfTextMatches: /kind|kinder|schule|kita/i,
      },
      {
        id: 'vehicle',
        questionDu: 'Gibt es ein Fahrzeug, das umzumelden ist?',
        questionSie: 'Gibt es ein Fahrzeug, das umzumelden ist?',
        skipIfTextMatches: /fahrzeug|auto|kfz|zulassung/i,
      },
    ],
    situationSummaryDu:
      'Du planst einen Umzug und brauchst einen Überblick über Ummeldung, Betreuung und mögliche Unterstützung in Kirkel.',
    situationSummarySie:
      'Sie planen einen Umzug und brauchen einen Überblick über Ummeldung, Betreuung und mögliche Unterstützung in Kirkel.',
  },
  {
    id: 'housing_benefits',
    title: 'Wohngeld & Unterstützung',
    domain: 'private',
    triggerPhrases: ['wohngeld', 'miete', 'unterstützung', 'einkommen niedrig', 'wohnkosten', 'sozialhilfe'],
    defaultMode: 'private',
    quickStartText:
      'Meine Wohnkosten sind hoch und ich möchte prüfen, ob Wohngeld oder andere Unterstützung in Frage kommt.',
    topicLabels: ['Wohnen', 'Soziales'],
    orderedSteps: [
      'Wohnsituation und Mietvertrag prüfen',
      'Einkommen und Haushaltsmitglieder zusammenstellen',
      'Wohngeld-Antrag bei der zuständigen Stelle vorbereiten',
      'Weitere Sozialleistungen prüfen, falls relevant',
      'Unterlagen sammeln (Mietvertrag, Einkommensnachweise, Kontoauszüge)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Wohngeldstelle', 'Sozialamt Kirkel', 'Jobcenter (falls relevant)'],
    relevantServiceKeywords: ['wohngeld', 'miete', 'wohnen'],
    catalogServiceIds: ['vc-wohngeld'],
    uncataloguedStepLabels: [],
    missingQuestionTemplates: [
      {
        id: 'household-size',
        questionDu: 'Wie viele Personen leben im Haushalt?',
        questionSie: 'Wie viele Personen leben im Haushalt?',
        skipIfTextMatches: /haushalt|personen|allein|familie/i,
      },
    ],
    situationSummaryDu:
      'Du möchtest prüfen, ob Wohngeld oder andere Unterstützung für deine Wohnsituation in Kirkel relevant sein kann.',
    situationSummarySie:
      'Sie möchten prüfen, ob Wohngeld oder andere Unterstützung für Ihre Wohnsituation in Kirkel relevant sein kann.',
  },
  {
    id: 'care_family',
    title: 'Pflegefall',
    domain: 'private',
    triggerPhrases: ['pflegefall', 'pflegebedürftig', 'pflegegrad', 'angehörige', 'pflegekasse', 'pflege'],
    defaultMode: 'private',
    quickStartText:
      'In meiner Familie gibt es einen Pflegefall. Welche Leistungen und Stellen sind in Kirkel relevant?',
    topicLabels: ['Pflege', 'Gesundheit', 'Familie'],
    orderedSteps: [
      'Pflegebedarf und Unterstützungsbedarf einordnen',
      'Pflegegrad-Antrag bei der Pflegekasse vorbereiten',
      'Beratungsangebote und Pflegestützpunkte nutzen',
      'Leistungen der Pflegekasse und ggf. Sozialhilfe prüfen',
      'Entlastungsleistungen und Angehörigenunterstützung klären',
      'Unterlagen sammeln (Atteste, Versichertennachweis)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Pflegekasse', 'Medizinischer Dienst (MD)', 'Pflegestützpunkt', 'Sozialamt Kirkel'],
    relevantServiceKeywords: ['pflege', 'pflegegrad', 'pflegekasse'],
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
      'Du begleitest einen Pflegefall und suchst Orientierung zu Leistungen und zuständigen Stellen in Kirkel.',
    situationSummarySie:
      'Sie begleiten einen Pflegefall und suchen Orientierung zu Leistungen und zuständigen Stellen in Kirkel.',
  },
  {
    id: 'passport_id',
    title: 'Reisepass & Ausweis',
    domain: 'private',
    triggerPhrases: ['reisepass', 'personalausweis', 'ausweis', 'pass', 'identität', 'bürgeramt'],
    defaultMode: 'private',
    quickStartText:
      'Ich brauche einen neuen Reisepass oder Personalausweis und möchte wissen, welche Unterlagen ich beim Bürgeramt mitbringen muss.',
    topicLabels: ['Ausweis', 'Meldeamt'],
    orderedSteps: [
      'Termin beim Bürgeramt Kirkel prüfen oder vereinbaren',
      'Biometrisches Passfoto und Unterlagen vorbereiten',
      'Antrag beim Bürgeramt stellen',
      'Bearbeitungszeit und Abholung einplanen',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Bürgeramt Kirkel'],
    relevantServiceKeywords: ['reisepass', 'personalausweis', 'ausweis'],
    catalogServiceIds: ['vc-ummeldung'],
    uncataloguedStepLabels: ['Reisepass / Personalausweis — Bürgeramt Kirkel'],
    missingQuestionTemplates: [
      {
        id: 'doc-type',
        questionDu: 'Brauchst du einen Reisepass, Personalausweis oder beides?',
        questionSie: 'Benötigen Sie einen Reisepass, Personalausweis oder beides?',
        skipIfTextMatches: /reisepass|personalausweis/i,
      },
    ],
    situationSummaryDu:
      'Du möchtest einen Reisepass oder Personalausweis beantragen und brauchst eine klare Checkliste für Kirkel.',
    situationSummarySie:
      'Sie möchten einen Reisepass oder Personalausweis beantragen und brauchen eine klare Checkliste für Kirkel.',
  },
  {
    id: 'separation_support',
    title: 'Trennung & Unterhalt',
    domain: 'private',
    triggerPhrases: ['trennung', 'scheidung', 'unterhalt', 'sorgerecht', 'getrennt'],
    defaultMode: 'private',
    quickStartText:
      'Es gibt eine Trennung in der Familie. Welche behördlichen und rechtlichen Schritte sollte ich vorbereiten?',
    topicLabels: ['Familie', 'Soziales'],
    orderedSteps: [
      'Eigene Situation und betroffene Kinder klären',
      'Unterhalts- und Sorgerechtsfragen mit Beratungsstellen besprechen',
      'Adress- und Meldedaten prüfen',
      'Unterlagen sammeln (Einkommen, Verträge, Schreiben)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Jugendamt', 'Beratungsstelle', 'Familiengericht (Orientierung)'],
    relevantServiceKeywords: ['unterhalt', 'familie', 'sorgerecht'],
    catalogServiceIds: [],
    uncataloguedStepLabels: ['Familienberatung / Jugendamt'],
    missingQuestionTemplates: [
      {
        id: 'children-involved',
        questionDu: 'Sind Kinder betroffen?',
        questionSie: 'Sind Kinder betroffen?',
        skipIfTextMatches: /kind|kinder|sorgerecht/i,
      },
    ],
    situationSummaryDu:
      'Du befindest dich in einer Trennungssituation und suchst Orientierung zu Unterhalt, Sorge und Anlaufstellen.',
    situationSummarySie:
      'Sie befinden sich in einer Trennungssituation und suchen Orientierung zu Unterhalt, Sorge und Anlaufstellen.',
  },
  {
    id: 'retirement_pension',
    title: 'Rente & Ruhestand',
    domain: 'private',
    triggerPhrases: ['rente', 'ruhestand', 'pension', 'rentenantrag', 'rentenversicherung'],
    defaultMode: 'private',
    quickStartText:
      'Ich gehe in den Ruhestand und möchte wissen, welche Schritte bei Rente und Versicherungen anstehen.',
    topicLabels: ['Rente', 'Soziales'],
    orderedSteps: [
      'Renteninformation und Anspruchszeiten prüfen',
      'Rentenantrag bei der Deutschen Rentenversicherung vorbereiten',
      'Kranken- und Pflegeversicherung im Ruhestand klären',
      'Unterlagen sammeln (Versicherungsverlauf, Ausweise, Bescheide)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Deutsche Rentenversicherung', 'Krankenkasse'],
    relevantServiceKeywords: ['rente', 'ruhestand', 'rentenversicherung'],
    catalogServiceIds: [],
    uncataloguedStepLabels: ['Rentenberatung / Deutsche Rentenversicherung'],
    missingQuestionTemplates: [
      {
        id: 'retirement-date',
        questionDu: 'Wann ist der geplante Rentenbeginn?',
        questionSie: 'Wann ist der geplante Rentenbeginn?',
        skipIfTextMatches: /ab \d|nächstes jahr|monat/i,
      },
    ],
    situationSummaryDu:
      'Du planst den Ruhestand und brauchst einen Überblick über Rentenantrag und begleitende Schritte.',
    situationSummarySie:
      'Sie planen den Ruhestand und brauchen einen Überblick über Rentenantrag und begleitende Schritte.',
  },
  {
    id: 'business_registration',
    title: 'Gewerbe anmelden',
    domain: 'business',
    triggerPhrases: [
      'gewerbe anmelden',
      'unternehmen gründen',
      'selbstständig',
      'gewerbe',
      'gründen',
      'existenzgründ',
    ],
    defaultMode: 'business',
    quickStartText:
      'Ich möchte ein Gewerbe in Kirkel anmelden und brauche einen Überblick über Gewerbeamt, Finanzamt und IHK.',
    topicLabels: ['Gründung', 'Gewerbe', 'Steuern'],
    orderedSteps: [
      'Tätigkeit und Rechtsform klären',
      'Gewerbe beim Gewerbeamt Kirkel anmelden',
      'Steuerliche Erfassung beim Finanzamt vorbereiten',
      'IHK / HWK prüfen, falls kammerpflichtig',
      'Berufsgenossenschaft zur Unfallversicherung anmelden',
      'Unterlagen sammeln (Ausweis, ggf. Handwerkskarte)',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Gewerbeamt Kirkel', 'Finanzamt', 'IHK / Handwerkskammer', 'Berufsgenossenschaft'],
    relevantServiceKeywords: ['gewerbe', 'gründ', 'finanzamt', 'ihk', 'selbstständig'],
    catalogServiceIds: ['vc-gewerbe', 'vc-gruendung', 'vc-finanzamt', 'vc-kammer', 'vc-bg'],
    uncataloguedStepLabels: [],
    missingQuestionTemplates: [
      {
        id: 'activity',
        questionDu: 'Welche Tätigkeit soll angemeldet werden?',
        questionSie: 'Welche Tätigkeit soll angemeldet werden?',
        skipIfTextMatches: /tätigkeit|handwerk|handel|dienstleistung|beratung/i,
      },
      {
        id: 'legal-form',
        questionDu: 'Einzelunternehmen oder Gesellschaft?',
        questionSie: 'Einzelunternehmen oder Gesellschaft?',
        skipIfTextMatches: /einzelunternehmen|gmbh|ug|gesellschaft/i,
      },
      {
        id: 'license-parts',
        questionDu: 'Gibt es erlaubnispflichtige Anteile?',
        questionSie: 'Gibt es erlaubnispflichtige Anteile?',
        skipIfTextMatches: /erlaubnis|gaststätte|handwerk|kammer/i,
      },
      {
        id: 'employees',
        questionDu: 'Wird Personal eingestellt?',
        questionSie: 'Wird Personal eingestellt?',
        skipIfTextMatches: /mitarbeiter|personal|einstell/i,
      },
    ],
    situationSummaryDu:
      'Du möchtest ein Gewerbe in Kirkel anmelden und brauchst eine strukturierte Reihenfolge der wichtigsten Stellen.',
    situationSummarySie:
      'Sie möchten ein Gewerbe in Kirkel anmelden und brauchen eine strukturierte Reihenfolge der wichtigsten Stellen.',
  },
  {
    id: 'business_change_closure',
    title: 'Gewerbe ummelden / abmelden',
    domain: 'business',
    triggerPhrases: ['gewerbe ummelden', 'gewerbe abmelden', 'betrieb schließen', 'gewerbe ändern'],
    defaultMode: 'business',
    quickStartText:
      'Ich muss mein Gewerbe ummelden oder abmelden und möchte wissen, welche Stellen ich informieren muss.',
    topicLabels: ['Gewerbe', 'Steuern'],
    orderedSteps: [
      'Art der Änderung klären (Ummeldung, Abmeldung, Standortwechsel)',
      'Gewerbeamt Kirkel informieren',
      'Finanzamt und Sozialversicherung prüfen',
      'IHK / HWK und Berufsgenossenschaft informieren',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Gewerbeamt Kirkel', 'Finanzamt', 'IHK / HWK', 'Berufsgenossenschaft'],
    relevantServiceKeywords: ['gewerbe', 'ummeld', 'abmeld'],
    catalogServiceIds: ['vc-gewerbe', 'vc-finanzamt'],
    uncataloguedStepLabels: [],
    missingQuestionTemplates: [
      {
        id: 'change-type',
        questionDu: 'Geht es um Ummeldung, Abmeldung oder Tätigkeitsänderung?',
        questionSie: 'Geht es um Ummeldung, Abmeldung oder Tätigkeitsänderung?',
        skipIfTextMatches: /ummeld|abmeld|schließen|ändern/i,
      },
    ],
    situationSummaryDu:
      'Du musst ein Gewerbe ummelden oder abmelden und brauchst eine Übersicht der zuständigen Stellen in Kirkel.',
    situationSummarySie:
      'Sie müssen ein Gewerbe ummelden oder abmelden und brauchen eine Übersicht der zuständigen Stellen in Kirkel.',
  },
  {
    id: 'employer_first_hire',
    title: 'Arbeitgeber werden',
    domain: 'business',
    triggerPhrases: [
      'arbeitgeber',
      'mitarbeiter einstellen',
      'mitarbeitende',
      'erste mitarbeiter',
      'personal einstellen',
      'lohnabrechnung',
    ],
    defaultMode: 'business',
    quickStartText:
      'Ich stelle zum ersten Mal Mitarbeitende ein und brauche einen Überblick über Meldungen, Sozialversicherung und Pflichten.',
    topicLabels: ['Arbeit', 'Unternehmen'],
    orderedSteps: [
      'Betriebsnummer und Arbeitgeberrolle klären',
      'Sozialversicherungsmeldungen vorbereiten',
      'Lohnabrechnung und Steuerpflichten prüfen',
      'Berufsgenossenschaft und Unfallversicherung anmelden',
      'Arbeitsverträge und Unterlagen vorbereiten',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Finanzamt', 'Krankenkasse / SV-Meldungen', 'Berufsgenossenschaft', 'IHK'],
    relevantServiceKeywords: ['arbeitgeber', 'personal', 'sozialversicherung', 'lohn'],
    catalogServiceIds: ['vc-personal', 'vc-bg', 'vc-finanzamt'],
    uncataloguedStepLabels: [],
    missingQuestionTemplates: [
      {
        id: 'hire-count',
        questionDu: 'Wie viele Mitarbeitende sollen eingestellt werden?',
        questionSie: 'Wie viele Mitarbeitende sollen eingestellt werden?',
        skipIfTextMatches: /mitarbeiter|personal|\d+/i,
      },
      {
        id: 'employment-type',
        questionDu: 'Vollzeit, Teilzeit oder Minijob?',
        questionSie: 'Vollzeit, Teilzeit oder Minijob?',
        skipIfTextMatches: /vollzeit|teilzeit|minijob|werkstudent/i,
      },
    ],
    situationSummaryDu:
      'Du wirst zum ersten Mal Arbeitgeber und brauchst eine strukturierte Übersicht der Meldungen und Pflichten.',
    situationSummarySie:
      'Sie werden zum ersten Mal Arbeitgeber und brauchen eine strukturierte Übersicht der Meldungen und Pflichten.',
  },
  {
    id: 'craft_business_start',
    title: 'Handwerksbetrieb starten',
    domain: 'business',
    triggerPhrases: ['handwerk', 'handwerkskammer', 'handwerksbetrieb', 'meister'],
    defaultMode: 'business',
    quickStartText:
      'Ich möchte einen Handwerksbetrieb starten und brauche Orientierung zu Handwerkskammer, Gewerbe und Erlaubnissen.',
    topicLabels: ['Handwerk', 'Gründung'],
    orderedSteps: [
      'Handwerksrolle und Meisterpflicht prüfen',
      'Gewerbe beim Gewerbeamt Kirkel anmelden',
      'Handwerkskammer kontaktieren',
      'Finanzamt und Berufsgenossenschaft vorbereiten',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Handwerkskammer', 'Gewerbeamt Kirkel', 'Finanzamt', 'Berufsgenossenschaft'],
    relevantServiceKeywords: ['handwerk', 'handwerkskammer', 'gewerbe'],
    catalogServiceIds: ['vc-gewerbe', 'vc-kammer', 'vc-finanzamt'],
    uncataloguedStepLabels: [],
    missingQuestionTemplates: [
      {
        id: 'craft-trade',
        questionDu: 'Welches Handwerk soll ausgeübt werden?',
        questionSie: 'Welches Handwerk soll ausgeübt werden?',
        skipIfTextMatches: /handwerk|elektriker|maler|schreiner/i,
      },
    ],
    situationSummaryDu:
      'Du planst einen Handwerksbetrieb in Kirkel und brauchst eine Übersicht zu Kammer, Gewerbe und Erlaubnissen.',
    situationSummarySie:
      'Sie planen einen Handwerksbetrieb in Kirkel und brauchen eine Übersicht zu Kammer, Gewerbe und Erlaubnissen.',
  },
  {
    id: 'licensed_trade',
    title: 'Gaststätte / erlaubnispflichtiges Gewerbe',
    domain: 'business',
    triggerPhrases: ['gaststätte', 'gastronomie', 'erlaubnis', 'schankerlaubnis', 'gastgewerbe'],
    defaultMode: 'business',
    quickStartText:
      'Ich möchte eine Gaststätte oder ein erlaubnispflichtiges Gewerbe starten und brauche Orientierung zu Genehmigungen.',
    topicLabels: ['Gewerbe', 'Erlaubnis'],
    orderedSteps: [
      'Erlaubnispflicht und Tätigkeit klären',
      'Gewerbe- und gaststättenrechtliche Anforderungen prüfen',
      'Gewerbeamt und zuständige Behörden in Kirkel kontaktieren',
      'Finanzamt, IHK und Berufsgenossenschaft vorbereiten',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['Gewerbeamt Kirkel', 'Ordnungsamt', 'Finanzamt', 'IHK'],
    relevantServiceKeywords: ['gaststätte', 'erlaubnis', 'gewerbe'],
    catalogServiceIds: ['vc-gewerbe', 'vc-finanzamt', 'vc-kammer'],
    uncataloguedStepLabels: ['Gaststättenerlaubnis / Ordnungsamt'],
    missingQuestionTemplates: [
      {
        id: 'license-scope',
        questionDu: 'Welche erlaubnispflichtigen Anteile hat die Tätigkeit?',
        questionSie: 'Welche erlaubnispflichtigen Anteile hat die Tätigkeit?',
        skipIfTextMatches: /gaststätte|schank|alkohol|erlaubnis/i,
      },
    ],
    situationSummaryDu:
      'Du planst ein erlaubnispflichtiges Gewerbe in Kirkel und brauchst eine Übersicht zu Genehmigungen und Stellen.',
    situationSummarySie:
      'Sie planen ein erlaubnispflichtiges Gewerbe in Kirkel und brauchen eine Übersicht zu Genehmigungen und Stellen.',
  },
  {
    id: 'startup_funding',
    title: 'Fördermittel & Gründungsstart',
    domain: 'business',
    triggerPhrases: ['förderung', 'fördermittel', 'gründungszuschuss', 'existenzgründung', 'kapital'],
    defaultMode: 'business',
    quickStartText:
      'Ich starte ein Unternehmen und möchte Fördermittel und Gründungsangebote in der Region prüfen.',
    topicLabels: ['Gründung', 'Förderung'],
    orderedSteps: [
      'Geschäftsmodell und Finanzbedarf skizzieren',
      'Regionale Förderprogramme und IHK-Angebote prüfen',
      'Gewerbeanmeldung und Finanzamt vorbereiten',
      'Unterlagen für Förderanträge sammeln',
      KIRKEL_STEP_SUFFIX,
    ],
    suggestedAuthorities: ['IHK', 'Gewerbeamt Kirkel', 'Förderstelle / Wirtschaftsförderung'],
    relevantServiceKeywords: ['förderung', 'gründung', 'existenzgründ'],
    catalogServiceIds: ['vc-foerderung', 'vc-gruendung', 'vc-gewerbe'],
    uncataloguedStepLabels: ['Regionale Wirtschaftsförderung Saarland'],
    missingQuestionTemplates: [
      {
        id: 'funding-goal',
        questionDu: 'Suchst du Startkapital, Beratung oder beides?',
        questionSie: 'Suchen Sie Startkapital, Beratung oder beides?',
        skipIfTextMatches: /kapital|beratung|förderung/i,
      },
    ],
    situationSummaryDu:
      'Du startest ein Unternehmen und möchtest Fördermittel und Gründungswege für Kirkel und die Region prüfen.',
    situationSummarySie:
      'Sie starten ein Unternehmen und möchten Fördermittel und Gründungswege für Kirkel und die Region prüfen.',
  },
];

export function getJourneyTemplateById(id: CivicJourneyId): CivicJourneyTemplate | undefined {
  return CIVIC_JOURNEY_TEMPLATES.find((t) => t.id === id);
}

export function getJourneyDomainLabel(id: CivicJourneyId, du = true): string | null {
  const t = getJourneyTemplateById(id);
  if (!t) return null;
  if (t.domain === 'business') return du ? 'Unternehmen' : 'Unternehmen';
  return du ? 'Privat' : 'Privat';
}
