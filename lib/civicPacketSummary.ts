import { buildPrefillPacket } from '@/lib/civicPrefillEngine';
import { resolveCivicProfileForPacket } from '@/lib/civicProfileResolver';
import { resolveCivicBundle, resolveServiceIdFromLeistungKey } from '@/lib/civicRegistryIndex';
import type { CivicPrefillPacket } from '@/types/civic';

export type CivicPacketSummary = {
  serviceId: string;
  authorityName: string;
  location: string;
  documentCount: number;
  filledCount: number;
  missingCount: number;
  sourceVerified: boolean;
  isDemo: boolean;
  appointmentRequired: boolean;
};

export function buildPacketFromLeistungKey(
  leistungKey: string,
  useDemoStammdaten = true,
): CivicPrefillPacket | null {
  const bundle = resolveCivicBundle(leistungKey);
  if (!bundle) return null;
  const profile = resolveCivicProfileForPacket(useDemoStammdaten);
  return buildPrefillPacket(profile, bundle.service, bundle.authority, bundle.forms);
}

export function buildPacketSummary(
  leistungKey: string,
  useDemoStammdaten = true,
): CivicPacketSummary | null {
  const packet = buildPacketFromLeistungKey(leistungKey, useDemoStammdaten);
  if (!packet) return null;

  const { authority } = packet;
  const location = `${authority.address.postalCode} ${authority.address.city}`;

  return {
    serviceId: packet.serviceId,
    authorityName: authority.name,
    location,
    documentCount: packet.documentsChecklist.length,
    filledCount: packet.filledFields.length,
    missingCount: packet.missingFields.length,
    sourceVerified: packet.sourceRefs.some(
      (r) => r.confidenceLevel === 'verified' || r.confidenceLevel === 'demo',
    ),
    isDemo: true,
    appointmentRequired: packet.appointmentRequired,
  };
}

export function hasMappedCivicService(leistungKey: string): boolean {
  return resolveServiceIdFromLeistungKey(leistungKey) !== null;
}
