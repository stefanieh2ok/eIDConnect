/**
 * Maps raw PVOG/Bundesportal records into GovService.
 * Used when live feeds become available.
 */
import type { GovService, GovServiceSourceSystem } from '@/lib/govdata/serviceTypes';

export type RawPvogRecord = {
  id?: string;
  leika?: string;
  name?: string;
  description?: string;
  category?: string;
  url?: string;
  formUrl?: string;
  authority?: string;
};

export function normalizePvogRecord(raw: RawPvogRecord, source: GovServiceSourceSystem = 'PVOG'): GovService {
  return {
    serviceId: raw.id ?? `pvog-${raw.leika ?? 'unknown'}`,
    leikaKey: raw.leika,
    title: raw.name ?? 'Verwaltungsleistung',
    shortDescription: raw.description ?? '',
    category: raw.category ?? 'Allgemein',
    situationType: 'both',
    responsibleAuthority: raw.authority,
    officialSourceUrl: raw.url,
    formUrl: raw.formUrl,
    sourceSystem: source,
    confidence: 'medium',
  };
}
