import { KIRKEL_AUTHORITY_BY_ID } from '@/data/civic/authorities/saarland/saarpfalz/kirkel.authorities';
import { getFormsForService } from '@/data/civic/forms/kirkel/formRegistry';
import { BUERGERAMT_SERVICES } from '@/data/civic/services/kirkel/buergeramt.services';
import { KFZ_HOMBURG_SERVICES } from '@/data/civic/services/kirkel/kfz-homburg.services';
import { JOBCENTER_HOMBURG_SERVICES } from '@/data/civic/services/kirkel/jobcenter-homburg.services';
import { ARBEITSAGENTUR_SERVICES } from '@/data/civic/services/kirkel/arbeitsagentur.services';
import type { CivicAuthority, CivicForm, CivicService } from '@/types/civic';

/** Adapter: bestehender Kirkel-Katalog (leistung_key) → neues Civic serviceId. */
export const LEISTUNG_KEY_TO_SERVICE_ID: Record<string, string> = {
  'personalausweis-eid': 'personalausweis-eid',
  'kfz-ummeldung': 'kfz-ummeldung',
  'buergergeld-orientierung': 'buergergeld-erstantrag',
  'arbeitssuche-jobcenter': 'alg1-orientierung',
};

const ALL_CIVIC_SERVICES: CivicService[] = [
  ...BUERGERAMT_SERVICES,
  ...KFZ_HOMBURG_SERVICES,
  ...JOBCENTER_HOMBURG_SERVICES,
  ...ARBEITSAGENTUR_SERVICES,
];

export const CIVIC_SERVICE_BY_ID: Record<string, CivicService> = Object.fromEntries(
  ALL_CIVIC_SERVICES.map((s) => [s.serviceId, s]),
);

export function resolveServiceIdFromLeistungKey(leistungKey: string): string | null {
  return LEISTUNG_KEY_TO_SERVICE_ID[leistungKey] ?? null;
}

export function getCivicServiceById(serviceId: string): CivicService | null {
  return CIVIC_SERVICE_BY_ID[serviceId] ?? null;
}

export function getCivicAuthorityById(authorityId: string): CivicAuthority | null {
  return KIRKEL_AUTHORITY_BY_ID[authorityId] ?? null;
}

export function resolveCivicBundle(leistungKey: string): {
  service: CivicService;
  authority: CivicAuthority;
  forms: CivicForm[];
} | null {
  const serviceId = resolveServiceIdFromLeistungKey(leistungKey);
  if (!serviceId) return null;
  const service = getCivicServiceById(serviceId);
  if (!service) return null;
  const authority = getCivicAuthorityById(service.authorityId);
  if (!authority) return null;
  const forms = getFormsForService(service.serviceId);
  return { service, authority, forms };
}

export function hasCivicBundle(leistungKey: string): boolean {
  return resolveCivicBundle(leistungKey) !== null;
}

export function resolveCivicBundleByServiceId(serviceId: string): {
  service: CivicService;
  authority: CivicAuthority;
  forms: CivicForm[];
} | null {
  const service = getCivicServiceById(serviceId);
  if (!service) return null;
  const authority = getCivicAuthorityById(service.authorityId);
  if (!authority) return null;
  const forms = getFormsForService(service.serviceId);
  return { service, authority, forms };
}
