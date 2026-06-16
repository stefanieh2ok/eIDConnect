import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { DEMO_LINK_LABEL } from '@/lib/govdata/externalLinkGate';

export type DocumentPacketCardStatus = 'available' | 'demo' | 'coming_soon' | 'external';
export type DocumentPacketCardSource = 'HookAI' | 'Official' | 'Demo';

export type DocumentPacketCardAction =
  | 'export_plan_text'
  | 'open_nda'
  | 'scroll_handover'
  | 'scroll_documents'
  | 'scroll_checklist';

export type DocumentPacketCard = {
  id: string;
  title: string;
  description: string;
  status: DocumentPacketCardStatus;
  actionLabel: string;
  actionUrl?: string;
  action?: DocumentPacketCardAction;
  source: DocumentPacketCardSource;
};

export type DocumentPacketResolverOptions = {
  /** Demo NDA route for preview environments */
  ndaPath?: string;
  du?: boolean;
};

/**
 * Maps a Behördenfahrplan to citizen-facing document cards.
 * Demo/mock items are explicitly labeled — never presented as official records.
 */
export function resolveDocumentPacket(
  plan: CivicCasePlanResult,
  options: DocumentPacketResolverOptions = {},
): DocumentPacketCard[] {
  const { ndaPath = '/legal/demo-nda', du = true } = options;
  const docCount = plan.documents.length;
  const handoverCount = plan.handoverLinks.length;

  const cards: DocumentPacketCard[] = [
    {
      id: 'case-plan-export',
      title: du ? 'Behördenfahrplan als PDF' : 'Behördenfahrplan als PDF',
      description: du
        ? 'Vorbereitungsübersicht zum Speichern oder Ausdrucken — noch Demo-Export, kein amtliches Dokument.'
        : 'Vorbereitungsübersicht zum Speichern oder Ausdrucken — noch Demo-Export, kein amtliches Dokument.',
      status: 'demo',
      actionLabel: du ? 'Vorbereitung herunterladen' : 'Vorbereitung herunterladen',
      action: 'export_plan_text',
      source: 'HookAI',
    },
    {
      id: 'nda-preview',
      title: 'Vertraulichkeitserklärung / NDA',
      description: du
        ? 'Muster-NDA für vertraulichen Vorschauzugang — nicht für Antragstellung.'
        : 'Muster-NDA für vertraulichen Vorschauzugang — nicht für Antragstellung.',
      status: 'demo',
      actionLabel: 'NDA ansehen',
      actionUrl: ndaPath,
      action: 'open_nda',
      source: 'Demo',
    },
  ];

  if (docCount > 0) {
    cards.push({
      id: 'required-documents',
      title: du ? 'Relevante Nachweise' : 'Relevante Nachweise',
      description: du
        ? `${docCount} mögliche Unterlagen — Orientierung, keine Vollständigkeitsprüfung.`
        : `${docCount} mögliche Unterlagen — Orientierung, keine Vollständigkeitsprüfung.`,
      status: plan.isDemoData ? 'demo' : 'available',
      actionLabel: du ? 'Checkliste öffnen' : 'Checkliste öffnen',
      action: 'scroll_documents',
      source: plan.isDemoData ? 'Demo' : 'HookAI',
    });
  }

  cards.push({
    id: 'prep-notes',
    title: du ? 'Gesprächsnotiz / Terminvorbereitung' : 'Gesprächsnotiz / Terminvorbereitung',
    description: du
      ? 'Kurznotiz aus deiner Situation — für Gespräche mit Stellen vorbereiten.'
      : 'Kurznotiz aus Ihrer Situation — für Gespräche mit Stellen vorbereiten.',
    status: 'coming_soon',
    actionLabel: 'Folgt in Kürze',
    source: 'HookAI',
  });

  if (handoverCount > 0) {
    cards.push({
      id: 'official-links',
      title: du ? 'Offizielle Links und Quellen' : 'Offizielle Links und Quellen',
      description: plan.isDemoData
        ? `${DEMO_LINK_LABEL} — externe Antragstellung nur über zuständige Stellen.`
        : du
          ? 'Externe offizielle Wege — Clara bereitet nur vor.'
          : 'Externe offizielle Wege — Clara bereitet nur vor.',
      status: plan.isDemoData ? 'demo' : 'external',
      actionLabel: du ? 'Übergabe ansehen' : 'Übergabe ansehen',
      action: 'scroll_handover',
      source: plan.isDemoData ? 'Demo' : 'Official',
    });
  }

  // TODO: merge uploaded user documents when document vault is connected.
  return cards;
}
