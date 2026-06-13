import type { CivicDemoProfile } from '@/types/civic';
import {
  CIVIC_DEMO_NOTICE,
  CIVIC_DEMO_STAMMDATEN_HINT,
  CIVIC_NO_SUBMISSION,
} from '@/lib/civicCompliance';

export const MAX_MUSTERMANN: CivicDemoProfile = {
  profileId: 'max-mustermann-demo',
  isDemoData: true,
  firstName: 'Max',
  lastName: 'Mustermann',
  dateOfBirth: '2000-01-01',
  address: {
    street: 'Demo-Straße',
    houseNumber: '1',
    postalCode: '66459',
    city: 'Kirkel',
  },
  email: 'max.mustermann@example.invalid',
  phone: '+49 000 000000',
  municipality: 'Kirkel',
  county: 'Saarpfalz-Kreis',
  federalState: 'Saarland',
  employmentStatus: 'arbeitssuchend',
  vehicleOwner: true,
  demoNotice: `${CIVIC_DEMO_NOTICE}. ${CIVIC_DEMO_STAMMDATEN_HINT} ${CIVIC_NO_SUBMISSION}.`,
};

export const DEMO_CIVIC_PROFILES: CivicDemoProfile[] = [MAX_MUSTERMANN];

export const DEMO_PROFILE_BY_ID: Record<string, CivicDemoProfile> = Object.fromEntries(
  DEMO_CIVIC_PROFILES.map((p) => [p.profileId, p]),
);
