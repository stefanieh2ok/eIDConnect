/**
 * Bridge from legacy life-event picker → claraCasePlanner output shape.
 *
 * TODO(civic-merge): Replace kirkelServiceResolver inline results with unified
 * CivicCasePlan rendering once Kirkel catalog maps 1:1 to GovService schema.
 * Until then: both paths coexist — primary ClaraWegweiser uses planCivicCase directly;
 * this bridge aligns the secondary Lebenslagen picker to the same result type.
 */
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import type { CasePlannerInput } from '@/lib/ai/claraCasePlanner';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';
import type { LifeEventId } from '@/types/fuerMich';

const LIFE_EVENT_PLANNER_HINTS: Partial<Record<LifeEventId, string>> = {
  moving: 'Umzug, Ummeldung, neue Wohnung',
  education: 'Schule, Ausbildung, Kinder',
  job_search: 'Arbeitssuche, Jobcenter, Einkommen',
  caregiving: 'Pflege, Angehörige, Unterstützung',
  bereavement: 'Todesfall, Nachlass, Behördenwege',
  coming_of_age: 'Volljährigkeit, erste eigene Anträge',
  mobility: 'Führerschein, Fahrzeug, Mobilität',
  expecting_child: 'Familie, Kinder, Elterngeld',
  newborn: 'Familie, Kinder, Elterngeld',
  founding: 'Gewerbe, Gründung, Unternehmen',
  retirement: 'Rente, Versorgung, Behördenwege',
  daily_support: 'Alltag, Unterstützung, Sozialleistungen',
};

export function lifeEventToPlannerInput(
  lifeEventId: LifeEventId,
  profile?: Pick<CasePlannerInput, 'plz' | 'bundesland' | 'wohnort'>,
): CasePlannerInput {
  const event = FUER_MICH_LIFE_EVENTS.find((e) => e.id === lifeEventId);
  const hint = LIFE_EVENT_PLANNER_HINTS[lifeEventId] ?? '';
  const label = event?.labelDu ?? lifeEventId;
  return {
    text: `Lebenslage: ${label}. ${hint}. Region Kirkel/Saarland.`,
    mode: 'private',
    plz: profile?.plz,
    bundesland: profile?.bundesland,
    wohnort: profile?.wohnort,
  };
}

/** Same output shape as ClaraWegweiser — for future unified rendering. */
export function planCivicCaseFromLifeEvent(
  lifeEventId: LifeEventId,
  profile?: Pick<CasePlannerInput, 'plz' | 'bundesland' | 'wohnort'>,
  du = true,
): CivicCasePlanResult {
  return planCivicCase(lifeEventToPlannerInput(lifeEventId, profile), du);
}
