/**
 * Builds unified Wegweiser action-plan cards from planner output + official actions.
 */
import type { CivicCasePlanResult, DocumentReadinessItem } from '@/lib/govdata/serviceTypes';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import type { ResolvedOfficialAction } from '@/lib/civic/officialActionTypes';
import { primarySourceOwnerLabel, shouldIncludeHousingDocuments } from '@/lib/civic/officialActionResolver';
import { SOURCE_NOTICE_TEMPLATE_ONLY, SOURCE_NOTICE_VERIFIED_CATALOG } from '@/lib/govdata/sourceStatus';

export type WegweiserActionPlanItem = {
  stepNumber: number;
  actionId: string;
  title: string;
  timing: string;
  authority: string;
  documents: string[];
  relevance: 'primary' | 'conditional' | 'optional';
  action: ResolvedOfficialAction | null;
  hint?: string;
  mutedCta?: string;
};

export type WegweiserActionPlanView = {
  primary: WegweiserActionPlanItem[];
  optional: WegweiserActionPlanItem[];
};

export type CompactContextSummary = {
  headline: string;
  locationLine: string;
  intakeLine?: string;
};

export type GroupedDocuments = {
  likely: DocumentReadinessItem[];
  optional: DocumentReadinessItem[];
};

const JOB_LOSS_PRIMARY_ORDER = [
  'register_jobseeker',
  'register_unemployed',
  'alg1_apply',
  'health_insurance_transition',
  'training_counselling',
] as const;

const JOB_LOSS_TIMING: Record<string, string> = {
  register_jobseeker:
    'Sobald du von der Kündigung weißt. Bei kurzfristiger Kündigung möglichst innerhalb von 3 Tagen.',
  register_unemployed: 'Spätestens am ersten Tag der Arbeitslosigkeit.',
  alg1_apply: 'Nach bzw. mit der Arbeitslosmeldung vorbereiten.',
  health_insurance_transition:
    'Nur wenn eine Lücke, Krankheit oder Unsicherheit besteht.',
  training_counselling:
    'Optional, wenn Qualifizierung für dich relevant ist.',
  buergergeld_housing:
    'Kann relevant sein, wenn ALG I nicht reicht oder kein Anspruch besteht.',
};

const HOUSING_DOC_KEYWORDS = ['mietvertrag', 'wohnkosten', 'miete', 'wohnungsgeber', 'haushaltsmitglieder'];

function actionMapFromPlan(plan: CivicCasePlanResult): Map<string, ResolvedOfficialAction> {
  const map = new Map<string, ResolvedOfficialAction>();
  for (const group of plan.officialActionGroups ?? []) {
    for (const action of group.actions) {
      map.set(action.actionId, action);
    }
  }
  return map;
}

function syntheticHealthInsuranceCard(du: boolean): WegweiserActionPlanItem {
  return {
    stepNumber: 4,
    actionId: 'health_insurance_transition',
    title: du ? 'Krankenversicherung / Übergang prüfen' : 'Krankenversicherung / Übergang prüfen',
    timing: JOB_LOSS_TIMING.health_insurance_transition,
    authority: 'Krankenkasse',
    documents: ['Versicherungsnummer', 'Kündigung / Ende Arbeitsverhältnis', 'ggf. AU-Bescheinigung'],
    relevance: 'primary',
    action: null,
    mutedCta: du
      ? 'Bei Unsicherheit Krankenkasse kontaktieren'
      : 'Bei Unsicherheit Krankenkasse kontaktieren',
  };
}

function toPlanItem(
  stepNumber: number,
  action: ResolvedOfficialAction,
  timingOverride?: string,
): WegweiserActionPlanItem {
  const authority = action.responsibleBodies[0] ?? primarySourceOwnerLabel(action).replace(/^Quelle: /, '');
  return {
    stepNumber,
    actionId: action.actionId,
    title: action.title,
    timing: timingOverride ?? action.reason,
    authority,
    documents: action.requiredDocuments.slice(0, 5),
    relevance: action.relevance,
    action,
    hint: action.safetyNotes?.[0],
    mutedCta: action.missingLinkReason,
  };
}

function buildJobLossPlan(
  plan: CivicCasePlanResult,
  actions: Map<string, ResolvedOfficialAction>,
  du: boolean,
): WegweiserActionPlanView {
  const primary: WegweiserActionPlanItem[] = [];
  const optional: WegweiserActionPlanItem[] = [];
  let step = 1;

  for (const id of JOB_LOSS_PRIMARY_ORDER) {
    if (id === 'health_insurance_transition') {
      primary.push({ ...syntheticHealthInsuranceCard(du), stepNumber: step++ });
      continue;
    }
    const action = actions.get(id);
    if (!action) continue;
    if (id === 'training_counselling') {
      primary.push(
        toPlanItem(step++, action, JOB_LOSS_TIMING.training_counselling),
      );
      continue;
    }
    if (action.relevance === 'optional') continue;
    primary.push(
      toPlanItem(step++, action, JOB_LOSS_TIMING[id] ?? action.reason),
    );
  }

  const buergergeld = actions.get('buergergeld_housing');
  if (buergergeld) {
    const factsJoined = (plan.intakeAnswerFacts ?? []).join(' ');
    const showBuergergeld =
      buergergeld.relevance === 'conditional' ||
      (buergergeld.relevance === 'optional' &&
        (/Bürgergeld/i.test(factsJoined) ||
          /Arbeitslosengeld I/i.test(factsJoined) ||
          /Einkommen|Grundsicherung|Wohnkosten/i.test(factsJoined)));
    if (showBuergergeld) {
      optional.push(
        toPlanItem(optional.length + 1, buergergeld, JOB_LOSS_TIMING.buergergeld_housing),
      );
    }
  }

  const sick = actions.get('sick_note_report');
  if (sick && sick.relevance === 'conditional') {
    optional.push(toPlanItem(optional.length + 1, sick));
  }

  return { primary, optional };
}

function buildGenericPlan(plan: CivicCasePlanResult): WegweiserActionPlanView {
  const primary: WegweiserActionPlanItem[] = [];
  const optional: WegweiserActionPlanItem[] = [];
  let step = 1;

  for (const group of plan.officialActionGroups ?? []) {
    for (const action of group.actions) {
      const item = toPlanItem(step, action);
      if (action.relevance === 'optional') {
        optional.push({ ...item, stepNumber: optional.length + 1 });
      } else {
        primary.push({ ...item, stepNumber: step++ });
      }
    }
  }

  return { primary, optional };
}

export function buildWegweiserActionPlan(
  plan: CivicCasePlanResult,
  du = true,
): WegweiserActionPlanView {
  const actions = actionMapFromPlan(plan);
  if (plan.journeyId === 'job_loss_unemployment') {
    return buildJobLossPlan(plan, actions, du);
  }
  if (actions.size === 0) {
    return { primary: [], optional: [] };
  }
  return buildGenericPlan(plan);
}

function formatIntakeLine(plan: CivicCasePlanResult): string | undefined {
  const facts = plan.intakeAnswerFacts ?? [];
  if (facts.length > 0) {
    const short = facts
      .slice(0, 3)
      .map((f) => f.replace(/^[^:]+:\s*/, '').trim())
      .filter(Boolean);
    if (short.length) return short.join(' · ');
  }
  return undefined;
}

export function buildCompactContextSummary(
  plan: CivicCasePlanResult,
  du = true,
): CompactContextSummary {
  const headline = plan.journeyTitle
    ? `${plan.journeyTitle} erkannt`
    : du
      ? 'Situation erkannt'
      : 'Situation erkannt';

  const locationParts: string[] = [];
  for (const fact of plan.knownContextFacts ?? []) {
    if (/Kirkel/i.test(fact)) locationParts.push('Kirkel');
    if (/Saarland/i.test(fact)) locationParts.push('Saarland');
  }
  const uniqueLocation = Array.from(new Set(locationParts));
  const intakeCount = (plan.intakeAnswerFacts ?? []).length;
  const locationLine =
    uniqueLocation.length > 0
      ? `${uniqueLocation.join(' · ')}${intakeCount > 0 ? ` · ${intakeCount} Angaben ergänzt` : ''}`
      : intakeCount > 0
        ? `${intakeCount} Angaben ergänzt`
        : du
          ? 'Demo-Kontext Kirkel'
          : 'Demo-Kontext Kirkel';

  return {
    headline,
    locationLine,
    intakeLine: formatIntakeLine(plan),
  };
}

export function groupDocumentsForPlan(
  plan: CivicCasePlanResult,
  inputText = '',
): GroupedDocuments {
  const includeHousing = shouldIncludeHousingDocuments(
    plan.journeyId as CivicJourneyId | undefined,
    inputText,
    undefined,
  );

  const likely: DocumentReadinessItem[] = [];
  const optional: DocumentReadinessItem[] = [];

  for (const doc of plan.documents) {
    if (
      !includeHousing &&
      HOUSING_DOC_KEYWORDS.some((k) => doc.label.toLowerCase().includes(k))
    ) {
      continue;
    }
    if (doc.required === 'conditional' || doc.readiness === 'possible') {
      optional.push(doc);
    } else {
      likely.push(doc);
    }
  }

  return { likely, optional };
}

export function filterJobLossAuthorities(
  authorities: string[],
  intakeAnswers?: Record<string, string>,
  inputText = '',
): string[] {
  const result = ['Agentur für Arbeit', 'Krankenkasse'];
  if (
    intakeAnswers?.current_status === 'buergergeld' ||
    /bürgergeld|jobcenter/i.test(inputText)
  ) {
    result.push('Jobcenter');
  }
  if (/arbeitgeber|personal/i.test(inputText)) {
    result.push('Arbeitgeber / Personalabteilung');
  }
  return result;
}

export function filterAuthoritiesForJourney(
  journeyId: CivicJourneyId | undefined,
  authorities: string[],
  intakeAnswers?: Record<string, string>,
  inputText = '',
): string[] {
  if (journeyId === 'job_loss_unemployment') {
    return filterJobLossAuthorities(authorities, intakeAnswers, inputText);
  }
  return authorities;
}

export function compactSourceNotice(plan: CivicCasePlanResult): string | null {
  if (!plan.sourceNotice) return null;
  if (plan.sourceNotice === SOURCE_NOTICE_VERIFIED_CATALOG) {
    return 'Offizielle Einstiege aus kuratiertem Quellenkatalog.';
  }
  if (plan.sourceNotice === SOURCE_NOTICE_TEMPLATE_ONLY) {
    return 'Fahrplan basiert auf vorbereitetem Wegweiser-Template. Offizielle Quelle ist nicht für jeden Schritt hinterlegt.';
  }
  if (/Demonstrationslogik|Demo/i.test(plan.sourceNotice)) {
    return 'Fahrplan basiert auf vorbereitetem Wegweiser-Template. Offizielle Quelle ist nicht für jeden Schritt hinterlegt.';
  }
  return plan.sourceNotice.length > 120
    ? 'Offizielle Einstiege aus kuratiertem Quellenkatalog.'
    : plan.sourceNotice;
}

export function usesActionPlanLayout(plan: CivicCasePlanResult): boolean {
  return Boolean(plan.journeyId && (plan.officialActionGroups?.length ?? 0) > 0);
}

export type { CivicJourneyId };
