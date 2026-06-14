import { MAX_MUSTERMANN } from '@/data/civic/profiles/demoProfiles';
import { CIVIC_DEMO_NOTICE, CIVIC_DEMO_STAMMDATEN_HINT } from '@/lib/civicCompliance';
import type { CivicDemoProfile } from '@/types/civic';
import type { FuerMichProfileState } from '@/types/fuerMich';

const EMPTY_PROFILE: CivicDemoProfile = {
  profileId: 'session-empty',
  isDemoData: true,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  address: {
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
  },
  email: '',
  phone: '',
  municipality: '',
  county: '',
  federalState: '',
  employmentStatus: '',
  vehicleOwner: false,
  demoNotice: `${CIVIC_DEMO_NOTICE}. ${CIVIC_DEMO_STAMMDATEN_HINT}`,
};

/** Profil für Prefill: Demo-Stammdaten oder leeres Session-Profil. */
export function resolveCivicProfileForPacket(
  useDemoStammdaten: boolean,
  buergerProfil?: FuerMichProfileState,
): CivicDemoProfile {
  if (useDemoStammdaten) return MAX_MUSTERMANN;

  const plz = buergerProfil?.plz?.trim() ?? '';
  const city = buergerProfil?.wohnort?.trim() ?? '';
  if (!plz && !city) return EMPTY_PROFILE;

  return {
    ...EMPTY_PROFILE,
    address: {
      ...EMPTY_PROFILE.address,
      postalCode: plz,
      city,
    },
    municipality: city,
    demoNotice: `${CIVIC_DEMO_NOTICE}. ${CIVIC_DEMO_STAMMDATEN_HINT} Aktiviere Demo-Stammdaten für Vorausfüllung.`,
  };
}

export function isDemoSession(state: {
  loginAuthMethod: 'eid' | 'address' | null;
  canVote: boolean;
}): boolean {
  return state.loginAuthMethod === 'address' || !state.canVote;
}
