import React from 'react';
import { render, screen } from '@testing-library/react';
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';
import {
  buildCompactContextSummary,
  buildWegweiserActionPlan,
  filterAuthoritiesForJourney,
  groupDocumentsForPlan,
  usesActionPlanLayout,
} from '@/lib/civic/wegweiserActionPlan';

const JOB_LOSS_INPUT = 'Ich wurde gekündigt, was nun?';
const identity = KIRKEL_DEMO_CONTEXT;

function jobLossPlan(intakeAnswers?: Record<string, string>, text = JOB_LOSS_INPUT) {
  return planCivicCase(
    { text, mode: 'unsure', intakeAnswers },
    true,
    undefined,
    identity,
  );
}

describe('wegweiserActionPlan', () => {
  it('job_loss_unemployment uses action-plan layout', () => {
    const plan = jobLossPlan();
    expect(usesActionPlanLayout(plan)).toBe(true);
  });

  it('renders primary action-plan cards for job loss', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByTestId('wegweiser-action-plan-result')).toBeInTheDocument();
    expect(screen.getByText('Deine nächsten Schritte')).toBeInTheDocument();
    expect(screen.getByTestId('action-plan-card-register_jobseeker')).toBeInTheDocument();
    expect(screen.getByTestId('action-plan-card-register_unemployed')).toBeInTheDocument();
    expect(screen.getByTestId('action-plan-card-alg1_apply')).toBeInTheDocument();
  });

  it('primary cards include authority and documents preview', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    const jobseeker = screen.getByTestId('action-plan-card-register_jobseeker');
    expect(jobseeker).toHaveTextContent(/Stelle:/i);
    expect(jobseeker).toHaveTextContent(/Agentur für Arbeit/i);
    expect(jobseeker).toHaveTextContent(/Benötigt:/i);
  });

  it('Arbeitsuchend card includes online CTA link', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    const link = screen.getByTestId('official-action-link-register_jobseeker');
    expect(link).toHaveAttribute('href');
    expect(link.getAttribute('href')).toMatch(/^https:\/\//);
  });

  it('Arbeitslosengeld card uses info CTA, not fake direct submit', () => {
    const plan = jobLossPlan();
    const actionPlan = buildWegweiserActionPlan(plan);
    const alg = actionPlan.primary.find((a) => a.actionId === 'alg1_apply');
    expect(alg?.action?.availableLinks[0]?.status).not.toBe('direct_submit');
    render(<CivicCasePlan plan={plan} />);
    const algCard = screen.getByTestId('action-plan-card-alg1_apply');
    expect(algCard).toHaveTextContent(/Arbeitslosengeld/i);
    expect(algCard.textContent).not.toMatch(/Antrag direkt einreichen/i);
  });

  it('Weiterbildung card mentions counselling and approval required', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    const training = screen.getByTestId('action-plan-card-training_counselling');
    expect(training).toHaveTextContent(/Beratung|Bildungsgutschein|Weiterbildung/i);
    expect(training.textContent).toMatch(/Beratung|keine automatische Leistung|Agentur für Arbeit/i);
  });

  it('Bürgergeld appears only in optional section when conditional', () => {
    const plan = jobLossPlan({ current_status: 'buergergeld' }, 'Ich wurde gekündigt und brauche Bürgergeld.');
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByText('Optional prüfen')).toBeInTheDocument();
    const optionalSection = screen.getByLabelText(/Optional prüfen/i).closest('section');
    expect(optionalSection).toHaveTextContent(/Bürgergeld/i);
    const primarySection = screen.getByLabelText(/Deine nächsten Schritte/i).closest('section');
    expect(primarySection?.textContent).not.toMatch(/Bürgergeld/i);
  });

  it('default job loss does not show Bürgergeld in optional', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    expect(screen.queryByText('Optional prüfen')).not.toBeInTheDocument();
    expect(screen.queryByTestId('action-plan-card-buergergeld_housing')).not.toBeInTheDocument();
  });

  it('filters job-loss authorities to Agentur and Krankenkasse by default', () => {
    const plan = jobLossPlan();
    const joined = plan.touchedAuthorities.join(' ');
    expect(joined).toMatch(/Agentur für Arbeit/i);
    expect(joined).toMatch(/Krankenkasse/i);
    expect(joined).not.toMatch(/Familienkasse/i);
    expect(joined).not.toMatch(/Elterngeldstelle/i);
    expect(joined).not.toMatch(/Bürgerbüro|Einwohnermeldeamt|Meldebehörde/i);
  });

  it('does not show Wohnungsgeberbestätigung in documents by default', () => {
    const plan = jobLossPlan();
    const labels = plan.documents.map((d) => d.label).join(' ');
    expect(labels).not.toMatch(/Wohnungsgeberbestätigung/i);
    const grouped = groupDocumentsForPlan(plan);
    const allLabels = [...grouped.likely, ...grouped.optional].map((d) => d.label).join(' ');
    expect(allLabels).not.toMatch(/Wohnungsgeberbestätigung/i);
  });

  it('documents checklist is compact grouped list', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByTestId('wegweiser-doc-checklist')).toBeInTheDocument();
    expect(screen.getByText('Wahrscheinlich nötig')).toBeInTheDocument();
    expect(screen.queryByText(/Typischer Vorgang/i)).not.toBeInTheDocument();
  });

  it('known context is compact without long chip paragraph', () => {
    const plan = jobLossPlan();
    const summary = buildCompactContextSummary(plan);
    expect(summary.headline).toMatch(/erkannt/i);
    expect(summary.locationLine).toMatch(/Kirkel|Saarland|Angaben/i);
    render(<CivicCasePlan plan={plan} />);
    expect(screen.queryByText(/Bekannter Kontext/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lage erkannt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Beteiligte Stellen/i)).not.toBeInTheDocument();
  });

  it('does not render separate duplicate official actions section', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    expect(screen.queryByText(/Offizielle Vorgänge & Formulare/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Online weiter/i)).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/^action-plan-card-/).length).toBeGreaterThanOrEqual(4);
  });

  it('has no Demo-Link or PVOG live claim', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG ist live/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG live/i)).not.toBeInTheDocument();
  });

  it('governance disclaimer remains', () => {
    const plan = jobLossPlan();
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByText(CLARA_CASE_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(/Was Clara nicht entscheiden kann/i)).toBeInTheDocument();
  });

  it('family case still renders official action links', () => {
    const plan = planCivicCase(
      { text: 'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld und Kita.', mode: 'private' },
      true,
      undefined,
      identity,
    );
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByTestId('plan-official-actions')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^official-action-link-/).length).toBeGreaterThan(0);
  });

  it('employer case still renders official action links', () => {
    const plan = planCivicCase(
      { text: 'Ich möchte Mitarbeiter einstellen.', mode: 'business' },
      true,
      undefined,
      identity,
    );
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByTestId('official-action-link-employer_number')).toBeInTheDocument();
  });

  it('filterAuthoritiesForJourney adds Jobcenter when Bürgergeld selected', () => {
    const filtered = filterAuthoritiesForJourney(
      'job_loss_unemployment',
      ['Familienkasse', 'Bürgerbüro', 'Agentur für Arbeit', 'Jobcenter'],
      { current_status: 'buergergeld' },
      'Bürgergeld',
    );
    expect(filtered).toContain('Jobcenter');
    expect(filtered).not.toContain('Familienkasse');
  });
});
