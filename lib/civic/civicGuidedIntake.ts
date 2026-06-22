/**
 * Guided civic intake — replaces prompt engineering with structured advisor questions.
 */
import type { CivicIdentityContext } from '@/lib/civic/demoCivicContext';
import { hasMunicipalityContext } from '@/lib/civic/demoCivicContext';
import type { CivicJourneyResolution } from '@/lib/civic/civicJourneyResolver';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { getJourneyTemplateById } from '@/lib/civic/civicJourneyTemplates';
import {
  classifyIntegrityIntent,
  type IntegrityIntentClass,
} from '@/lib/civic/claraIntegrityPolicy';
import { getAdvisorResponse, buildSafeGuidanceSteps } from '@/lib/civic/claraAdvisorResponses';

export type IntakeQuestion = {
  id: string;
  label: string;
  helper?: string;
  type: 'single_choice' | 'multi_choice' | 'text' | 'date';
  options?: { value: string; label: string }[];
  optional?: boolean;
};

export type GuidedIntakeResult = {
  journeyId: CivicJourneyId | null;
  confidence: number;
  introMessage: string;
  questions: IntakeQuestion[];
  integrityFlags: string[];
  integrityClass: IntegrityIntentClass;
  safeGuidance?: string;
  safeGuidanceSteps?: string[];
  lowConfidence?: boolean;
  classifierOptions?: { value: CivicJourneyId; label: string }[];
};

const NOT_SURE = { value: 'not_sure', label: 'Weiß ich nicht' };
const SKIP = { value: 'skip', label: 'Überspringen' };

const LOW_CONFIDENCE_CLASSIFIER: { value: CivicJourneyId; label: string }[] = [
  { value: 'child_birth_kita', label: 'Familie' },
  { value: 'moving_with_children', label: 'Wohnen & Umzug' },
  { value: 'job_loss_unemployment', label: 'Arbeit & Kündigung' },
  { value: 'family_care', label: 'Pflege' },
  { value: 'id_passport', label: 'Ausweis & Dokumente' },
  { value: 'business_registration', label: 'Selbstständigkeit / Unternehmen' },
];

function confidenceToNumber(confidence: CivicJourneyResolution['confidence'] | undefined): number {
  if (confidence === 'high') return 0.9;
  if (confidence === 'medium') return 0.6;
  if (confidence === 'low') return 0.35;
  return 0;
}

function journeyIntro(journeyId: CivicJourneyId, du: boolean): string {
  if (journeyId === 'job_loss_unemployment') {
    return du
      ? 'Ich glaube, es geht um Kündigung & Arbeitslosigkeit.'
      : 'Ich glaube, es geht um Kündigung & Arbeitslosigkeit.';
  }
  const t = getJourneyTemplateById(journeyId);
  const title = t?.title ?? journeyId;
  return du
    ? `Ich glaube, es geht um „${title}".`
    : `Ich glaube, es geht um „${title}".`;
}

function jobLossQuestions(du: boolean, integrityClass: IntegrityIntentClass): IntakeQuestion[] {
  const q = (id: string, label: string, options: { value: string; label: string }[]): IntakeQuestion => ({
    id,
    label: du ? label : label.replace(/dein/g, 'Ihr').replace(/du /g, 'Sie '),
    type: 'single_choice',
    options: [...options, NOT_SURE, SKIP],
    optional: true,
  });

  const questions: IntakeQuestion[] = [
    q('employment_end', 'Wann endet oder endete dein Arbeitsverhältnis?', [
      { value: 'already_ended', label: 'Bereits beendet' },
      { value: 'within_7_days', label: 'In den nächsten 7 Tagen' },
      { value: 'within_3_months', label: 'In den nächsten 3 Monaten' },
    ]),
    q('written_notice', 'Liegt ein schriftliches Kündigungsschreiben oder Aufhebungsvertrag vor?', [
      { value: 'kuendigungsschreiben', label: 'Kündigungsschreiben' },
      { value: 'aufhebungsvertrag', label: 'Aufhebungsvertrag' },
      { value: 'nein', label: 'Nein' },
    ]),
    q('current_status', 'Bist du schon bei der Agentur für Arbeit gemeldet?', [
      { value: 'noch_nicht', label: 'Noch nicht' },
      { value: 'arbeitsuchend_gemeldet', label: 'Arbeitsuchend gemeldet' },
      { value: 'arbeitslos_gemeldet', label: 'Arbeitslos gemeldet' },
    ]),
    q('health_aspect', 'Geht es zusätzlich um Krankheit oder Arbeitsunfähigkeit?', [
      { value: 'nein', label: 'Nein' },
      { value: 'ja_ich_bin_krank', label: 'Ja, ich bin krank' },
      { value: 'noch_unklar', label: 'Noch unklar' },
    ]),
    q('first_need', 'Was brauchst du zuerst?', [
      { value: 'arbeitslos_melden', label: 'Arbeitslos melden' },
      { value: 'geldleistungen_klaeren', label: 'Geldleistungen klären' },
      { value: 'weiterbildung_jobsuche', label: 'Weiterbildung besprechen' },
      { value: 'ueberblick_bekommen', label: 'Überblick bekommen' },
    ]),
  ];

  if (
    integrityClass === 'ambiguous_health_or_benefit' ||
    integrityClass === 'possible_avoidance' ||
    integrityClass === 'request_for_improper_benefit' ||
    integrityClass === 'improper_benefit_reporting'
  ) {
    return questions.slice(0, 5);
  }

  return questions.slice(0, 5);
}

function genericJourneyQuestions(journeyId: CivicJourneyId, du: boolean): IntakeQuestion[] {
  const template = getJourneyTemplateById(journeyId);
  if (!template) return [];

  return template.missingQuestionTemplates.slice(0, 4).map((mq) => ({
    id: mq.id,
    label: du ? mq.questionDu : mq.questionSie,
    type: 'single_choice' as const,
    options: [NOT_SURE, SKIP],
    optional: true,
  }));
}

export function buildGuidedIntake(
  inputText: string,
  resolvedJourney: CivicJourneyResolution | null,
  identity: CivicIdentityContext,
  du = true,
  journeyOverride?: CivicJourneyId,
): GuidedIntakeResult {
  const integrity = classifyIntegrityIntent(inputText);
  const advisor = getAdvisorResponse(integrity.intentClass, du);
  const journeyId = journeyOverride ?? resolvedJourney?.journeyId ?? null;
  const confidence = journeyOverride ? 0.85 : confidenceToNumber(resolvedJourney?.confidence);

  if (!journeyId || confidence < 0.5) {
    return {
      journeyId: null,
      confidence,
      introMessage: du
        ? 'Ich bin noch nicht sicher, welcher Weg passt. Worum geht es am ehesten?'
        : 'Ich bin noch nicht sicher, welcher Weg passt. Worum geht es am ehesten?',
      questions: [],
      integrityFlags: integrity.flags,
      integrityClass: integrity.intentClass,
      safeGuidance: advisor.message,
      safeGuidanceSteps: buildSafeGuidanceSteps(integrity.intentClass),
      lowConfidence: true,
      classifierOptions: LOW_CONFIDENCE_CLASSIFIER,
    };
  }

  let questions: IntakeQuestion[] =
    journeyId === 'job_loss_unemployment'
      ? jobLossQuestions(du, integrity.intentClass)
      : genericJourneyQuestions(journeyId, du);

  if (hasMunicipalityContext(identity)) {
    questions = questions.filter(
      (q) => !/kommune|bundesland|wohnort|privat.*unternehmen|geschäftlich/i.test(q.label),
    );
  }

  questions = questions.slice(0, 5);

  const intro =
    integrity.intentClass !== 'normal_help'
      ? `${advisor.message}\n\n${journeyIntro(journeyId, du)}`
      : journeyIntro(journeyId, du);

  return {
    journeyId,
    confidence,
    introMessage: intro,
    questions,
    integrityFlags: integrity.flags,
    integrityClass: integrity.intentClass,
    safeGuidance: integrity.intentClass !== 'normal_help' ? advisor.message : undefined,
    safeGuidanceSteps:
      integrity.intentClass !== 'normal_help'
        ? buildSafeGuidanceSteps(integrity.intentClass)
        : undefined,
    lowConfidence: false,
  };
}

export type IntakeAnswerMap = Record<string, string>;

export function formatIntakeAnswerFacts(
  answers: IntakeAnswerMap,
  questions: IntakeQuestion[],
): string[] {
  const facts: string[] = [];
  for (const q of questions) {
    const raw = answers[q.id];
    if (!raw || raw === 'skip') continue;
    const opt = q.options?.find((o) => o.value === raw);
    const label = opt?.label ?? raw;
    if (raw === 'not_sure') {
      facts.push(`${q.label}: noch unklar`);
    } else {
      facts.push(`${q.label}: ${label}`);
    }
  }
  return facts;
}

export function intakeAnswersToContextText(answers: IntakeAnswerMap): string {
  return Object.entries(answers)
    .filter(([, v]) => v && v !== 'skip')
    .map(([k, v]) => `[Intake ${k}=${v}]`)
    .join(' ');
}
