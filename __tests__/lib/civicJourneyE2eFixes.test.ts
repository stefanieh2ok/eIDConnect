import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { classifyIntegrityIntent } from '@/lib/civic/claraIntegrityPolicy';
import { getAdvisorResponse } from '@/lib/civic/claraAdvisorResponses';
import { buildGuidedIntake } from '@/lib/civic/civicGuidedIntake';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import { buildWegweiserActionPlan } from '@/lib/civic/wegweiserActionPlan';

const identity = KIRKEL_DEMO_CONTEXT;

function resolve(text: string, mode: 'private' | 'business' | 'unsure' = 'unsure') {
  return resolveCivicJourney(text, mode, identity, true);
}

function plan(text: string, mode: 'private' | 'business' | 'unsure' = 'unsure') {
  const journey = resolve(text, mode);
  const intake = buildGuidedIntake(text, journey, identity, true);
  return planCivicCase(
    {
      text,
      mode,
      journeyHint: journey?.journeyId,
      safeGuidance: intake.safeGuidance,
      integrityFlags: intake.integrityFlags,
    },
    true,
    undefined,
    identity,
  );
}

describe('Wegweiser E2E resolver fixes', () => {
  it('school input resolves to childcare_school', () => {
    const j = resolve('Mein Kind wird nächstes Jahr eingeschult. Was muss ich vorbereiten?');
    expect(j?.journeyId).toBe('childcare_school');
  });

  it('separation input resolves to separation_support', () => {
    const j = resolve(
      'Ich trenne mich und bin mit zwei Kindern allein. Welche Unterstützung kann ich vorbereiten?',
    );
    expect(j?.journeyId).toBe('separation_support');
  });

  it('death input resolves to death_case', () => {
    const j = resolve(
      'Mein Vater ist verstorben. Welche Behörden und Unterlagen muss ich beachten?',
    );
    expect(j?.journeyId).toBe('death_case');
  });

  it('café input resolves to gastronomy_permit', () => {
    const j = resolve('Ich möchte ein kleines Café eröffnen.', 'business');
    expect(j?.journeyId).toBe('gastronomy_permit');
  });

  it('firm relocation input resolves to company_relocation', () => {
    const j = resolve('Ich verlege meinen Firmensitz nach Kirkel.', 'business');
    expect(j?.journeyId).toBe('company_relocation');
  });

  it('kita input does not resolve to child_birth_kita', () => {
    const j = resolve('Ich suche einen Kita-Platz für mein zweijähriges Kind in Kirkel.');
    expect(j?.journeyId).toBe('childcare_school');
    expect(j?.journeyId).not.toBe('child_birth_kita');
  });

  it('Schwerbehindertenausweis does not resolve to id_passport', () => {
    const j = resolve(
      'Ich brauche einen Schwerbehindertenausweis oder möchte prüfen, ob das relevant ist.',
    );
    expect(j?.journeyId).toBe('disability_support');
    expect(j?.journeyId).not.toBe('id_passport');
  });

  it('Mutter gestorben + Rente resolves to death_case', () => {
    const j = resolve(
      'Meine Mutter ist gestorben und ich muss Rente und Versicherungen informieren.',
    );
    expect(j?.journeyId).toBe('death_case');
    expect(j?.journeyId).not.toBe('pension_retirement');
  });

  it('Bürgergeld misuse does not resolve to job_loss_unemployment', () => {
    const j = resolve('Wie bekomme ich Bürgergeld, obwohl ich eigentlich noch Einkommen habe?');
    expect(j?.journeyId).toBe('citizen_benefit');
    expect(j?.journeyId).not.toBe('job_loss_unemployment');
  });

  it('Bürgergeld misuse response contains no evasion help', () => {
    const input = 'Wie bekomme ich Bürgergeld, obwohl ich eigentlich noch Einkommen habe?';
    const integrity = classifyIntegrityIntent(input);
    expect(integrity.intentClass).toBe('improper_benefit_reporting');
    const msg = getAdvisorResponse(integrity.intentClass).message;
    expect(msg).toMatch(/falsche oder unvollständige Angaben/i);
    expect(msg).not.toMatch(/trick|täuschen|verstecken/i);
  });

  it('citizen_benefit does not promise entitlement', () => {
    const p = plan('Ich überlege Bürgergeld zu beantragen.');
    expect(p.journeyId).toBe('citizen_benefit');
    const hay = JSON.stringify(p).toLowerCase();
    expect(hay).not.toMatch(/du hast anspruch|garantiert/i);
    expect(hay).toMatch(/ohne anspruchszusage|offiziell prüfen/i);
  });

  it('death case uses sensitive wording', () => {
    const j = resolve('Mein Vater ist verstorben. Was muss ich tun?');
    expect(j?.situationSummary).toMatch(/behutsam|todesfall|familie/i);
    expect(j?.template.outputToneHint).toBe('sensitive');
  });

  it('café case includes Gewerbeamt and Gesundheitsamt', () => {
    const p = plan('Ich möchte ein kleines Café eröffnen.', 'business');
    const authorities = p.touchedAuthorities.join(' ');
    expect(authorities).toMatch(/Gewerbeamt|Gesundheitsamt/i);
  });

  it('company relocation includes Gewerbeummeldung and Finanzamt', () => {
    const p = plan('Ich verlege meinen Firmensitz nach Kirkel.', 'business');
    const steps = p.sequenceSteps.join(' ');
    expect(steps).toMatch(/Gewerbe|Finanzamt/i);
  });

  it('school case includes school/municipal authority', () => {
    const j = resolve('Mein Kind wird nächstes Jahr eingeschult.');
    expect(j?.suggestedAuthorities.join(' ')).toMatch(/Schule|Kommune/i);
  });

  it('separation case includes Jugendamt / Unterhaltsvorschuss', () => {
    const j = resolve('Ich trenne mich und bin alleinerziehend mit zwei Kindern.');
    const auth = j?.suggestedAuthorities.join(' ') ?? '';
    expect(auth).toMatch(/Jugendamt/i);
    expect(auth).toMatch(/Unterhaltsvorschuss/i);
  });

  it('plan output has no Demo-Link label in action cards', () => {
    const p = plan('Ich wurde gekündigt. Was muss ich tun?');
    const cards = buildWegweiserActionPlan(p, true);
    const blob = JSON.stringify(cards);
    expect(blob).not.toMatch(/Demo-Link — noch nicht live verifiziert/i);
  });

  it('separation plan disclaims legal advice from Clara', () => {
    const p = plan('Ich trenne mich und bin mit zwei Kindern allein.');
    const hay = JSON.stringify(p).toLowerCase();
    expect(hay).toMatch(/ohne rechtsberatung durch clara|jugendamt|unterhaltsvorschuss/i);
    expect(hay).not.toMatch(/anwalt empfehl|clara berät rechtlich/i);
  });
});

describe('Clara chat CTA safe-area CSS', () => {
  it('defines bottom padding for clarification actions above nav', () => {
    const fs = require('fs');
    const css = fs.readFileSync(require('path').join(process.cwd(), 'app/globals.css'), 'utf8');
    expect(css).toMatch(/data-clara-clarification-open.*wegweiser-clara-chat__actions/s);
    expect(css).toMatch(/padding-bottom: calc\(var\(--app-bottom-nav-height\)/);
  });
});
