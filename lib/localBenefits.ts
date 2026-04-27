export type LocalBenefitStatus = 'available' | 'claimed' | 'disabled';

export type LocalBenefitState = {
  consentRequired: boolean;
  eligibilityReason: 'Beteiligung abgeschlossen';
  independentOfVoteChoice: true;
  status: LocalBenefitStatus;
};

export function getLocalBenefitState(params: {
  consentLocalBenefits: boolean;
  completedParticipationCount: number;
  benefitIndex: number;
}): LocalBenefitState {
  const { consentLocalBenefits, completedParticipationCount, benefitIndex } = params;
  if (!consentLocalBenefits) {
    return {
      consentRequired: true,
      eligibilityReason: 'Beteiligung abgeschlossen',
      independentOfVoteChoice: true,
      status: 'disabled',
    };
  }

  const status: LocalBenefitStatus =
    completedParticipationCount > benefitIndex
      ? 'claimed'
      : completedParticipationCount > 0
        ? 'available'
        : 'disabled';

  return {
    consentRequired: false,
    eligibilityReason: 'Beteiligung abgeschlossen',
    independentOfVoteChoice: true,
    status,
  };
}
