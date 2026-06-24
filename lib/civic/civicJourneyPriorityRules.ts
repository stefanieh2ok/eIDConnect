/**
 * Priority routing for Wegweiser journey detection — resolves ambiguous phrases
 * before generic trigger-phrase scoring.
 */
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

const DEATH_TERMS =
  /verstorben|gestorben|todesfall|sterbefall|beerdigung|sterbeurkunde|nachlass|hinterblieben|trauerfall/i;
const RENTE_APPLICATION = /rente beantragen|rentenantrag|ruhestand planen|in rente gehen/i;
const KITA_TERMS =
  /kita|kinderbetreuung|krippe|tagesmutter|betreuungsplatz|kindergarten|hort platz|kita-platz|kita platz/i;
const BIRTH_TERMS =
  /bekomme ein kind|geburt|schwanger|elterngeld|kindergeld|baby|mutterschaft|neugeboren/i;
const SCHOOL_TERMS =
  /einschulung|schulanmeldung|schulpflicht|schulanfang|schule vorbereiten|in die schule|grundschule|schulplatz|eingeschult/i;
const DISABILITY_TERMS =
  /schwerbehindert|schwerbehinderung|behinderungsausweis|gd behindert|versorgungsamt|nachteilsausgleich/i;
const SEPARATION_TERMS =
  /trenne|getrennt|alleinerziehend|allein mit kind|getrennt mit kind|unterhaltsvorschuss|kindesunterhalt|sorgerecht|umgang.*kind|scheidung.*kind/i;
const CAFE_TERMS =
  /café|cafe eröffnen|restaurant eröffnen|gastronomie|imbiss|foodtruck|gaststätte|lebensmittel.*hygiene|speisen.*verkauf/i;
const COMPANY_MOVE_TERMS =
  /firmensitz|firmensitz verleg|firma umziehen|unternehmenssitz|betriebsstätte verleg|sitz nach kirkel|firma nach kirkel|firmensitz nach|unternehmen nach kirkel/i;
const PRIVATE_MOVE_TERMS = /mit kindern|familie|wohnsitz|umzug mit|ziehe mit/i;
const BUERGERGELD_TERMS = /bürgergeld|grundsicherung|jobcenter.*leistung|hartz iv|hartziv/i;
const JOB_LOSS_TERMS = /gekündigt|kündigung|arbeitslos melden|arbeitsuchend|job verloren|aufhebungsvertrag/i;
const BENEFIT_MISUSE_TERMS =
  /obwohl ich|obwohl.*einkommen|trotzdem noch einkommen|einkommen verstecken|falsche angaben|nicht angeben|nicht dazu sagen|heimlich.*einkommen/i;

export function resolvePriorityJourney(text: string): CivicJourneyId | null {
  const t = norm(text);

  if (DISABILITY_TERMS.test(t)) {
    return 'disability_support';
  }

  if (DEATH_TERMS.test(t) || (/mutter|vater|angehörig/.test(t) && /gestorben|verstorben/.test(t))) {
    return 'death_case';
  }

  if (SCHOOL_TERMS.test(t) && !BIRTH_TERMS.test(t)) {
    return 'childcare_school';
  }

  if (KITA_TERMS.test(t) && !BIRTH_TERMS.test(t) && !SCHOOL_TERMS.test(t)) {
    return 'childcare_school';
  }

  if (SEPARATION_TERMS.test(t)) {
    return 'separation_support';
  }

  if (CAFE_TERMS.test(t)) {
    return 'gastronomy_permit';
  }

  if (COMPANY_MOVE_TERMS.test(t) && !PRIVATE_MOVE_TERMS.test(t)) {
    return 'company_relocation';
  }

  if (BUERGERGELD_TERMS.test(t) && !JOB_LOSS_TERMS.test(t)) {
    return 'citizen_benefit';
  }

  if (BUERGERGELD_TERMS.test(t) && BENEFIT_MISUSE_TERMS.test(t)) {
    return 'citizen_benefit';
  }

  if (RENTE_APPLICATION.test(t) && DEATH_TERMS.test(t)) {
    return 'death_case';
  }

  return null;
}

export function journeyScoreAdjustment(journeyId: CivicJourneyId, text: string): number {
  const t = norm(text);
  let delta = 0;

  if (journeyId === 'child_birth_kita') {
    if (KITA_TERMS.test(t) && !BIRTH_TERMS.test(t)) delta -= 12;
    if (BIRTH_TERMS.test(t)) delta += 3;
  }

  if (journeyId === 'childcare_school') {
    if (KITA_TERMS.test(t) && !BIRTH_TERMS.test(t)) delta += 8;
    if (SCHOOL_TERMS.test(t)) delta += 8;
  }

  if (journeyId === 'id_passport') {
    if (DISABILITY_TERMS.test(t)) delta -= 15;
    if (/personalausweis|reisepass/.test(t) && !DISABILITY_TERMS.test(t)) delta += 2;
  }

  if (journeyId === 'disability_support' && DISABILITY_TERMS.test(t)) {
    delta += 10;
  }

  if (journeyId === 'pension_retirement') {
    if (DEATH_TERMS.test(t)) delta -= 15;
    if (/mutter|vater/.test(t) && /gestorben|verstorben/.test(t)) delta -= 20;
  }

  if (journeyId === 'death_case' && DEATH_TERMS.test(t)) {
    delta += 12;
  }

  if (journeyId === 'job_loss_unemployment') {
    if (BUERGERGELD_TERMS.test(t) && !JOB_LOSS_TERMS.test(t)) delta -= 12;
    if (BENEFIT_MISUSE_TERMS.test(t) && BUERGERGELD_TERMS.test(t)) delta -= 15;
  }

  if (journeyId === 'citizen_benefit' && BUERGERGELD_TERMS.test(t)) {
    delta += 10;
  }

  if (journeyId === 'moving_with_children' && COMPANY_MOVE_TERMS.test(t)) {
    delta -= 10;
  }

  if (journeyId === 'company_relocation' && COMPANY_MOVE_TERMS.test(t)) {
    delta += 10;
  }

  if (journeyId === 'gastronomy_permit' && CAFE_TERMS.test(t)) {
    delta += 8;
  }

  if (journeyId === 'separation_support' && SEPARATION_TERMS.test(t)) {
    delta += 8;
  }

  if (journeyId === 'job_loss_unemployment' && JOB_LOSS_TERMS.test(t)) {
    delta += 10;
  }

  if (journeyId === 'citizen_benefit' && JOB_LOSS_TERMS.test(t)) {
    delta -= 12;
  }

  return delta;
}

export function isBenefitMisreportingInput(text: string): boolean {
  const t = norm(text);
  return BUERGERGELD_TERMS.test(t) && BENEFIT_MISUSE_TERMS.test(t);
}
