import { getLocalBenefitState } from '@/lib/localBenefits';

describe('getLocalBenefitState', () => {
  it('bleibt ohne Einwilligung deaktiviert', () => {
    const state = getLocalBenefitState({
      consentLocalBenefits: false,
      completedParticipationCount: 3,
      benefitIndex: 0,
    });
    expect(state.consentRequired).toBe(true);
    expect(state.status).toBe('disabled');
    expect(state.independentOfVoteChoice).toBe(true);
  });

  it('wird mit Einwilligung und abgeschlossener Beteiligung verfuegbar', () => {
    const state = getLocalBenefitState({
      consentLocalBenefits: true,
      completedParticipationCount: 1,
      benefitIndex: 3,
    });
    expect(state.consentRequired).toBe(false);
    expect(state.status).toBe('available');
    expect(state.eligibilityReason).toBe('Beteiligung abgeschlossen');
  });

  it('ist eingeloeset/abgeschlossen sobald genug Beteiligungen vorliegen', () => {
    const state = getLocalBenefitState({
      consentLocalBenefits: true,
      completedParticipationCount: 2,
      benefitIndex: 1,
    });
    expect(state.status).toBe('claimed');
  });
});
