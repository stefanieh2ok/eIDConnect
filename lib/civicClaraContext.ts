import type { CivicPrefillPacket } from '@/types/civic';

export type CivicClaraContextAction =
  | 'why-authority'
  | 'missing-docs'
  | 'prefill-summary'
  | 'show-source';

export type CivicClaraContextPayload = {
  serviceId: string;
  authorityId: string;
  authorityName: string;
  prefillPacketSummary: {
    filledCount: number;
    missingCount: number;
    documentCount: number;
    appointmentRequired: boolean;
  };
  sourceRefs: { label: string; url: string }[];
  disclaimer: string;
  action?: CivicClaraContextAction;
};

export function buildCivicClaraContext(
  packet: CivicPrefillPacket,
  action?: CivicClaraContextAction,
): CivicClaraContextPayload {
  return {
    serviceId: packet.serviceId,
    authorityId: packet.authorityId,
    authorityName: packet.authority.name,
    prefillPacketSummary: {
      filledCount: packet.filledFields.length,
      missingCount: packet.missingFields.length,
      documentCount: packet.documentsChecklist.length,
      appointmentRequired: packet.appointmentRequired,
    },
    sourceRefs: packet.sourceRefs.map((r) => ({ label: r.label, url: r.url })),
    disclaimer: packet.disclaimer,
    action,
  };
}

export function civicClaraContextChipLabel(ctx: CivicClaraContextPayload): string {
  const shortTitle = ctx.serviceId.replace(/-/g, ' ');
  return `Behördenpaket · ${shortTitle}`;
}

export function dispatchCivicClaraOpen(detail: {
  prompt: string;
  autoSend?: boolean;
  civicContext: CivicClaraContextPayload;
}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('clara:open-chat', {
      detail: {
        prompt: detail.prompt,
        autoSend: detail.autoSend ?? true,
        civicContext: detail.civicContext,
      },
    }),
  );
}
