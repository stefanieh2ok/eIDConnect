import { resolveDocumentPacket } from '@/lib/documents/documentPacketResolver';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';

describe('resolveDocumentPacket', () => {
  const basePlan: CivicCasePlanResult = {
    situationSummary: 'Test summary',
    topics: ['Familie'],
    services: [],
    touchedAuthorities: ['Familienkasse'],
    missingCriticalInfo: [],
    followUpQuestions: [],
    documents: [{ id: 'd1', label: 'Ausweis', readiness: 'likely' }],
    sequenceSteps: ['Schritt 1'],
    risks: [],
    handoverLinks: [
      {
        id: 'h1',
        title: 'Kindergeld',
        label: 'Antrag über zuständige Stelle',
      },
    ],
    mode: 'private',
    isDemoData: true,
  };

  it('includes demo-labeled export and NDA cards', () => {
    const cards = resolveDocumentPacket(basePlan);
    expect(cards.some((c) => c.id === 'case-plan-export' && c.status === 'demo')).toBe(true);
    expect(cards.some((c) => c.id === 'nda-preview' && c.source === 'Demo')).toBe(true);
  });

  it('includes document checklist when documents exist', () => {
    const cards = resolveDocumentPacket(basePlan);
    const checklist = cards.find((c) => c.id === 'required-documents');
    expect(checklist).toBeDefined();
    expect(checklist?.action).toBe('scroll_documents');
  });

  it('includes official handover card when links exist', () => {
    const cards = resolveDocumentPacket(basePlan);
    const handover = cards.find((c) => c.id === 'official-links');
    expect(handover).toBeDefined();
    expect(handover?.status).toBe('demo');
    expect(handover?.action).toBe('scroll_handover');
  });

  it('marks prep notes as coming soon', () => {
    const cards = resolveDocumentPacket(basePlan);
    const notes = cards.find((c) => c.id === 'prep-notes');
    expect(notes?.status).toBe('coming_soon');
  });
});
