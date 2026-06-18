/**
 * Resolves official actions for a civic journey with intake-aware conditions.
 */
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { getJourneyTemplateById } from '@/lib/civic/civicJourneyTemplates';
import type { CivicIdentityContext } from '@/lib/civic/demoCivicContext';
import type { IntakeAnswerMap } from '@/lib/civic/civicGuidedIntake';
import {
  getCatalogOrientationAction,
  getOfficialActionsForJourney,
} from '@/lib/civic/officialActionCatalog';
import { linkCtaLabel, primaryLinkStatus } from '@/lib/civic/officialActionLinkLabels';
import type {
  OfficialAction,
  OfficialActionLink,
  ResolvedOfficialAction,
  ResolvedOfficialActionGroup,
  TrainingFundingState,
} from '@/lib/civic/officialActionTypes';
import type { DocumentReadinessItem } from '@/lib/govdata/serviceTypes';

export type OfficialActionResolverContext = {
  answers?: IntakeAnswerMap;
  inputText?: string;
  identityContext?: CivicIdentityContext;
};

const TRAINING_APPROVED_PHRASES = [
  'bildungsgutschein liegt vor',
  'weiterbildung wurde genehmigt',
  'agentur für arbeit hat die weiterbildung bewilligt',
];

const HOUSING_DOC_KEYWORDS = ['mietvertrag', 'wohnkosten', 'miete', 'wohnungsgeber', 'haushaltsmitglieder'];

const CONDITIONAL_ACTION_IDS = new Set([
  'vehicle_reregister',
  'wohngeld_moving',
  'buergergeld_housing',
  'bildung_teilhabe',
  'school_transport',
  'basic_security_age',
  'vat_oss_check',
  'outdoor_seating_permit',
  'building_use_gastro',
  'fire_accessibility_parking',
  'founding_grant_counselling',
  'sick_note_report',
]);

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function detectTrainingFundingState(
  text: string,
  answers?: IntakeAnswerMap,
): TrainingFundingState {
  const t = normalizeText(text);
  if (TRAINING_APPROVED_PHRASES.some((p) => t.includes(p))) {
    return 'training_approved';
  }
  if (answers?.training_status === 'training_approved') {
    return 'training_approved';
  }
  if (
    answers?.first_need === 'weiterbildung_jobsuche' ||
    /weiterbildung|bildungsgutschein|qualifizierung|umschulung/i.test(text)
  ) {
    return 'training_interest_only';
  }
  return 'training_coupon_to_clarify';
}

export function shouldIncludeHousingDocuments(
  journeyId: CivicJourneyId | undefined,
  text: string,
  answers?: IntakeAnswerMap,
): boolean {
  if (journeyId !== 'job_loss_unemployment' && journeyId !== 'unemployment_training') {
    return true;
  }
  const t = normalizeText(text);
  if (answers?.current_status === 'buergergeld') return true;
  if (/bürgergeld|wohngeld|wohnkosten|grundsicherung|miete/i.test(t)) return true;
  if (answers?.first_need === 'geldleistungen_klaeren' && /wohn|miete/i.test(t)) return true;
  return false;
}

function textMentionsVehicle(text: string): boolean {
  return /kfz|auto|fahrzeug|pkw|kennzeichen/i.test(text);
}

function textMentionsLowIncome(text: string): boolean {
  return /niedrig|einkommen|wohngeld|arm|wenig geld|finanziell/i.test(text);
}

function textMentionsChildren(text: string): boolean {
  return /kind|kinder|kita|schul/i.test(text);
}

function textMentionsIllness(text: string, answers?: IntakeAnswerMap): boolean {
  if (answers?.health_aspect && answers.health_aspect !== 'nein' && answers.health_aspect !== 'skip') {
    return true;
  }
  return /krank|arbeitsunfähig|au\b|krankschreibung/i.test(text);
}

function textMentionsCrossBorderSales(text: string): boolean {
  return /grenz|eu-|oss|ausland|export|import/i.test(text);
}

function textMentionsOutdoorOrAlcohol(text: string): boolean {
  return /außen|terrasse|alkohol|ausschank|gaststätte/i.test(text);
}

function prioritizeLinks(links: OfficialActionLink[]): OfficialActionLink[] {
  const order: OfficialActionLink['status'][] = [
    'online_service_available',
    'pdf_form_available',
    'online_info_available',
    'appointment_required',
    'counselling_required',
    'regional_lookup_required',
    'catalog_missing',
  ];
  return [...links].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}

function resolveRelevance(
  action: OfficialAction,
  journeyId: CivicJourneyId,
  ctx: OfficialActionResolverContext,
): { relevance: ResolvedOfficialAction['relevance']; reason: string } | null {
  const text = ctx.inputText ?? '';
  const answers = ctx.answers;

  if (action.actionId === 'vehicle_reregister') {
    if (!textMentionsVehicle(text)) return null;
    return { relevance: 'conditional', reason: 'Relevant, wenn ein Fahrzeug mitumzieht.' };
  }

  if (action.actionId === 'wohngeld_moving' && journeyId === 'moving_with_children') {
    if (!textMentionsLowIncome(text)) {
      return { relevance: 'optional', reason: 'Nur bei finanzieller Englage oder hohen Wohnkosten prüfen.' };
    }
    return { relevance: 'conditional', reason: 'Du hast Unterstützung oder Wohnkosten erwähnt.' };
  }

  if (action.actionId === 'buergergeld_housing') {
    if (journeyId === 'job_loss_unemployment' || journeyId === 'unemployment_training') {
      if (answers?.current_status === 'buergergeld' || /bürgergeld|grundsicherung/i.test(text)) {
        return { relevance: 'conditional', reason: 'Bürgergeld kann bei fehlendem ALG I relevant sein.' };
      }
      if (answers?.current_status === 'alg1') {
        return { relevance: 'optional', reason: 'Nur prüfen, wenn ALG I nicht ausreicht oder wegfällt.' };
      }
      return { relevance: 'optional', reason: 'Optional, wenn Einkommen für Lebenshaltung nicht reicht.' };
    }
    return { relevance: 'primary', reason: 'Kann bei Einkommenslücke relevant sein.' };
  }

  if (action.actionId === 'bildung_teilhabe') {
    if (!textMentionsChildren(text)) return null;
    return { relevance: 'conditional', reason: 'Relevant bei Kindern im Haushalt.' };
  }

  if (action.actionId === 'school_transport') {
    if (!/schülerbeförderung|schulweg|weit weg|entfernung/i.test(text)) {
      return { relevance: 'optional', reason: 'Nur bei längerem Schulweg regional prüfen.' };
    }
    return { relevance: 'conditional', reason: 'Schulweg oder Beförderung erwähnt.' };
  }

  if (action.actionId === 'basic_security_age') {
    if (!textMentionsLowIncome(text)) {
      return { relevance: 'optional', reason: 'Bei geringem Einkommen im Alter prüfen.' };
    }
    return { relevance: 'conditional', reason: 'Einkommenssituation im Ruhestand erwähnt.' };
  }

  if (action.actionId === 'vat_oss_check') {
    if (!textMentionsCrossBorderSales(text)) return null;
    return { relevance: 'conditional', reason: 'Grenzüberschreitender Handel erwähnt.' };
  }

  if (action.actionId === 'outdoor_seating_permit' || action.actionId === 'building_use_gastro') {
    if (!textMentionsOutdoorOrAlcohol(text)) {
      return { relevance: 'optional', reason: 'Nur bei Außenfläche, Ausschank oder Standortänderung.' };
    }
    return { relevance: 'conditional', reason: 'Ausschank, Außenfläche oder Standort erwähnt.' };
  }

  if (action.actionId === 'fire_accessibility_parking') {
    return { relevance: 'optional', reason: 'Je nach Gebäude und Nutzung beim Bauamt klären.' };
  }

  if (action.actionId === 'founding_grant_counselling') {
    if (!/gründungszuschuss|existenzgründ|selbstständig werden/i.test(text)) return null;
    return { relevance: 'conditional', reason: 'Gründungszuschuss nur nach Beratung — keine Zusage.' };
  }

  if (action.actionId === 'sick_note_report') {
    if (!textMentionsIllness(text, answers)) return null;
    return { relevance: 'conditional', reason: 'Gesundheit oder Arbeitsunfähigkeit spielt eine Rolle.' };
  }

  if (action.actionId === 'training_counselling') {
    const trainingState = detectTrainingFundingState(text, answers);
    if (trainingState === 'training_approved') {
      return {
        relevance: 'conditional',
        reason: 'Du hast eine bewilligte Weiterbildung genannt — nächste Schritte mit der Agentur für Arbeit abstimmen.',
      };
    }
    if (
      trainingState === 'training_interest_only' ||
      answers?.first_need === 'weiterbildung_jobsuche' ||
      /weiterbildung|bildungsgutschein|qualifizierung/i.test(text)
    ) {
      return {
        relevance: 'primary',
        reason:
          'Weiterbildungsinteresse kann Clara strukturieren. Ob eine Förderung möglich ist, klärt die Agentur für Arbeit nach Beratung und Prüfung.',
      };
    }
    return { relevance: 'optional', reason: 'Falls Weiterbildung oder Qualifizierung ein Thema ist.' };
  }

  if (CONDITIONAL_ACTION_IDS.has(action.actionId)) {
    return { relevance: 'conditional', reason: 'Abhängig von deinen Angaben — bitte prüfen.' };
  }

  const template = getJourneyTemplateById(journeyId);
  const primaryKeywords = action.triggerKeywords;
  if (primaryKeywords.length > 0) {
    const t = normalizeText(text);
    const matched = primaryKeywords.some((kw) => t.includes(kw.toLowerCase()));
    if (matched) {
      return { relevance: 'primary', reason: `Passt zu deiner Beschreibung (${action.title}).` };
    }
  }

  if (template?.orderedSteps.some((s) => s.toLowerCase().includes(action.title.toLowerCase().slice(0, 12)))) {
    return { relevance: 'primary', reason: `Gehört zum Wegweiser-Schritt „${action.title}".` };
  }

  return { relevance: 'primary', reason: `Nächster Schritt: ${action.title}.` };
}

function resolveAvailableLinks(
  action: OfficialAction,
  trainingState: TrainingFundingState,
): { links: OfficialActionLink[]; missingLinkReason?: string } {
  if (action.actionId === 'training_counselling' && trainingState !== 'training_approved') {
    const counsellingLinks = action.links.filter((l) => l.status === 'counselling_required');
    const infoLinks = action.links.filter((l) => l.url && l.kind === 'info_page');
    return {
      links: [...(counsellingLinks.length ? counsellingLinks : action.links.slice(0, 1)), ...infoLinks],
      missingLinkReason:
        'Weiterbildungsinteresse kann Clara strukturieren. Ob eine Förderung möglich ist, klärt die Agentur für Arbeit nach Beratung und Prüfung. Ein Bildungsgutschein ist keine automatische Leistung.',
    };
  }

  if (action.actionId === 'training_counselling' && trainingState === 'training_approved') {
    const withUrl = action.links.filter((l) => l.url);
    if (withUrl.length > 0) {
      return { links: prioritizeLinks(withUrl) };
    }
  }

  const withUrl = action.links.filter((l) => l.url);
  if (withUrl.length > 0) {
    return { links: prioritizeLinks(withUrl) };
  }

  const prioritized = prioritizeLinks(action.links);
  const primary = prioritized[0];
  if (primary?.status === 'regional_lookup_required') {
    return {
      links: prioritized,
      missingLinkReason: 'Zuständige Stelle hängt von Kommune oder Bundesland ab.',
    };
  }
  if (primary?.status === 'catalog_missing') {
    return {
      links: prioritized,
      missingLinkReason: 'Quelle/Formular noch nicht im Katalog hinterlegt',
    };
  }
  return { links: prioritized };
}

export function resolveOfficialActionsForJourney(
  journeyId: CivicJourneyId,
  answers?: IntakeAnswerMap,
  identityContext?: CivicIdentityContext,
  inputText = '',
): ResolvedOfficialActionGroup[] {
  const ctx: OfficialActionResolverContext = { answers, identityContext, inputText };
  const trainingState = detectTrainingFundingState(inputText, answers);
  const rawActions = getOfficialActionsForJourney(journeyId);

  const resolved: ResolvedOfficialAction[] = [];
  const seenIds = new Set<string>();

  for (const action of rawActions) {
    if (seenIds.has(action.actionId)) continue;
    const rel = resolveRelevance(action, journeyId, ctx);
    if (!rel) continue;
    seenIds.add(action.actionId);

    const { links, missingLinkReason } = resolveAvailableLinks(action, trainingState);
    const primaryLink = links[0];
    resolved.push({
      ...action,
      relevance: rel.relevance,
      reason: rel.reason,
      availableLinks: links,
      missingLinkReason,
      ctaLabel: primaryLink ? linkCtaLabel(primaryLink) : 'Quelle/Formular noch nicht im Katalog hinterlegt',
    });
  }

  if (resolved.length === 0) {
    const fallback = getCatalogOrientationAction(journeyId);
    if (fallback) {
      const { links, missingLinkReason } = resolveAvailableLinks(fallback, trainingState);
      resolved.push({
        ...fallback,
        relevance: 'primary',
        reason: 'Noch kein spezifischer Katalogeintrag — regionale Orientierung.',
        availableLinks: links,
        missingLinkReason,
        ctaLabel: linkCtaLabel(links[0]),
      });
    }
  }

  const primary = resolved.filter((a) => a.relevance === 'primary');
  const conditional = resolved.filter((a) => a.relevance === 'conditional');
  const optional = resolved.filter((a) => a.relevance === 'optional');

  const groups: ResolvedOfficialActionGroup[] = [];
  if (primary.length) groups.push({ groupTitle: 'Nächste offizielle Vorgänge', actions: primary });
  if (conditional.length) groups.push({ groupTitle: 'Je nach Situation relevant', actions: conditional });
  if (optional.length) groups.push({ groupTitle: 'Optional prüfen', actions: optional });

  return groups;
}

const DOCUMENT_WHY_BY_ACTION: Partial<Record<string, string>> = {
  register_jobseeker: 'Für die Meldung als arbeitsuchend.',
  register_unemployed: 'Für die Arbeitslosmeldung.',
  alg1_apply: 'Für den Antrag auf Arbeitslosengeld.',
  training_counselling: 'Für die Beratung zu Weiterbildung.',
  kindergeld_apply: 'Für den Kindergeldantrag.',
  elterngeld_apply: 'Für den Elterngeldantrag.',
  trade_register: 'Für die Gewerbeanmeldung.',
};

function documentWhyNeeded(action: ResolvedOfficialAction, label: string): string {
  const byAction = DOCUMENT_WHY_BY_ACTION[action.actionId];
  if (byAction) return byAction;
  const lower = label.toLowerCase();
  if (/kündigung|aufhebung/i.test(lower)) return 'Für die Arbeitslosmeldung.';
  if (/personalausweis/i.test(lower)) return 'Zur Identifikation bei der Stelle.';
  if (/arbeitsvertrag/i.test(lower)) return 'Als Nachweis des Beschäftigungsverhältnisses.';
  if (/lebenslauf/i.test(lower)) return 'Für Vermittlung oder Beratung.';
  if (/lohn|gehalt/i.test(lower)) return 'Zur Prüfung der Leistungsvoraussetzungen.';
  return `Für: ${action.title}.`;
}

export function buildDocumentsFromOfficialActions(
  groups: ResolvedOfficialActionGroup[],
  journeyId: CivicJourneyId | undefined,
  inputText: string,
  answers?: IntakeAnswerMap,
  existingDocs: DocumentReadinessItem[] = [],
): DocumentReadinessItem[] {
  const includeHousing = shouldIncludeHousingDocuments(journeyId, inputText, answers);
  const seen = new Set(existingDocs.map((d) => d.label.toLowerCase()));
  const docs = [...existingDocs];

  for (const group of groups) {
    for (const action of group.actions) {
      if (action.relevance === 'optional') continue;

      for (const label of action.requiredDocuments) {
        if (!includeHousing && HOUSING_DOC_KEYWORDS.some((k) => label.toLowerCase().includes(k))) {
          continue;
        }
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const primaryLink = action.availableLinks[0];
        docs.push({
          id: `doc-action-${action.actionId}-${docs.length}`,
          label,
          readiness: primaryLink?.regionSpecific ? 'regional' : 'likely',
          checked: false,
          whyNeeded: documentWhyNeeded(action, label),
          actionId: action.actionId,
          journeyId,
          required: 'required',
          sourceOwner: primaryLink?.sourceOwner,
        });
      }

      for (const cond of action.conditionalDocuments ?? []) {
        for (const label of cond.documents) {
          if (!includeHousing && HOUSING_DOC_KEYWORDS.some((k) => label.toLowerCase().includes(k))) {
            continue;
          }
          const key = label.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          docs.push({
            id: `doc-action-cond-${action.actionId}-${docs.length}`,
            label,
            readiness: 'possible',
            checked: false,
            whyNeeded: cond.condition,
            actionId: action.actionId,
            journeyId,
            required: 'conditional',
            sourceOwner: action.availableLinks[0]?.sourceOwner,
          });
        }
      }
    }
  }

  return docs.slice(0, 18);
}

export function primarySourceOwnerLabel(action: ResolvedOfficialAction): string {
  const link = action.availableLinks[0];
  if (!link) return 'Kommune / regional abhängig';
  const owner = link.sourceOwner;
  if (link.regionSpecific) return `Quelle: ${owner} / regional abhängig`;
  if (owner.includes('Bundesagentur')) return 'Quelle: Bundesagentur für Arbeit';
  if (owner.includes('Familienkasse') || owner.includes('Familie')) return 'Quelle: Familienkasse';
  if (owner === 'Bund.de' || owner.includes('Bundesportal')) return 'Quelle: Bundesportal';
  if (owner.includes('BMFSFJ') || owner.includes('Familienportal')) return 'Quelle: Familienportal des Bundes';
  return `Quelle: ${owner}`;
}

export { primaryLinkStatus };
