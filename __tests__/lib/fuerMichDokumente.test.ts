import { ALL_KIRKEL_SERVICES } from '@/lib/kirkelServiceResolver';
import {
  DOCUMENT_PREP_BY_KEY,
  FORBIDDEN_SUBMISSION_WORDS,
  SIMULATION_BADGE_TEXT,
  SIMULATION_NOTHING_TRANSMITTED,
  SUBMISSION_BLOCKED_UNVERIFIED,
  SUBMISSION_HANDOVER_LABELS,
  SUBMISSION_SIMULATION_STEPS,
  countRequiredSelected,
  documentStatus,
  flattenDocuments,
  hasDocumentPrep,
  isAllowedFile,
  resolveDocumentPrep,
  submissionActiveForSourceStatus,
  toFileMeta,
  type DocumentPrepConfig,
} from '@/lib/fuerMichDokumente';

const PRIORITY_KEYS = [
  'geburtsurkunde',
  'elterngeld',
  'kindergeld',
  'bafoeg',
  'ummeldung',
  'fuehrerschein',
  'begleitetes-fahren-bf17',
];

describe('Dokument-Konfiguration', () => {
  it('ist für alle Prioritäts-Leistungen hinterlegt', () => {
    for (const key of PRIORITY_KEYS) {
      expect(hasDocumentPrep(key)).toBe(true);
    }
  });

  it('liefert für unbekannte Leistung null (dann: Hinweis statt Simulation)', () => {
    expect(resolveDocumentPrep('gibt-es-nicht')).toBeNull();
    expect(hasDocumentPrep('gibt-es-nicht')).toBe(false);
  });

  it('Geburtsurkunde enthält Dokumentengruppen', () => {
    const config = resolveDocumentPrep('geburtsurkunde');
    expect(config?.document_groups.length).toBeGreaterThan(0);
  });

  it('Elterngeld enthält required_documents', () => {
    const config = resolveDocumentPrep('elterngeld');
    expect(config?.required_documents.length).toBeGreaterThan(0);
  });

  it('nutzt sichere Demo-Defaults (keine echten Kanäle)', () => {
    for (const key of PRIORITY_KEYS) {
      const config = resolveDocumentPrep(key) as DocumentPrepConfig;
      expect(config.submission_simulation_enabled).toBe(true);
      expect(config.verified_submission_channel).toBeNull();
      expect(config.submission_channel_status).toBe('demo_only');
      expect(config.simulated_submission_steps.length).toBe(SUBMISSION_SIMULATION_STEPS.length);
    }
  });

  it('legt in diesem Schritt KEINE appointment_*-Felder an (Appointment Resolver separat)', () => {
    for (const key of PRIORITY_KEYS) {
      const config = resolveDocumentPrep(key) as unknown as Record<string, unknown>;
      const appointmentKeys = Object.keys(config).filter((k) => k.startsWith('appointment'));
      expect(appointmentKeys).toEqual([]);
    }
  });
});

describe('Nachweis-Status', () => {
  it('setzt bei ausgewählter Datei den Status auf „ausgewählt“', () => {
    const doc = { id: 'x', titel: 'Test', hinweis: '', kind: 'required' as const };
    expect(documentStatus(doc, true)).toBe('ausgewaehlt');
    expect(documentStatus(doc, false)).toBe('fehlt');
  });

  it('hält optionale und nicht erforderliche Nachweise korrekt', () => {
    expect(documentStatus({ id: 'a', titel: 'A', hinweis: '', kind: 'optional' }, false)).toBe('optional');
    expect(documentStatus({ id: 'b', titel: 'B', hinweis: '', kind: 'not_in_demo' }, false)).toBe(
      'nicht_erforderlich',
    );
  });

  it('zählt ausgewählte Pflichtnachweise für die Simulationsfreigabe', () => {
    const config = resolveDocumentPrep('elterngeld') as DocumentPrepConfig;
    const firstRequired = config.required_documents[0];
    expect(countRequiredSelected(config, new Set())).toBe(0);
    expect(countRequiredSelected(config, new Set([firstRequired.id]))).toBe(1);
  });
});

describe('Datei-Regeln (rein lokal)', () => {
  it('erlaubt PDF/JPG/PNG bis 10 MB', () => {
    expect(isAllowedFile({ name: 'a.pdf', type: 'application/pdf', size: 1000 })).toBe(true);
    expect(isAllowedFile({ name: 'b.jpg', type: 'image/jpeg', size: 1000 })).toBe(true);
    expect(isAllowedFile({ name: 'c.png', type: 'image/png', size: 1000 })).toBe(true);
  });

  it('lehnt zu große Dateien und unerlaubte Typen ab', () => {
    expect(isAllowedFile({ name: 'big.pdf', type: 'application/pdf', size: 11 * 1024 * 1024 })).toBe(false);
    expect(isAllowedFile({ name: 'virus.exe', type: 'application/octet-stream', size: 1000 })).toBe(false);
    expect(isAllowedFile({ name: 'doc.docx', type: '', size: 1000 })).toBe(false);
  });

  it('toFileMeta liest NUR Name/Typ/Größe – keine Dateiinhalte', () => {
    const meta = toFileMeta({ name: 'foto.png', type: 'image/png', size: 2048 });
    expect(Object.keys(meta).sort()).toEqual(['name', 'size', 'type']);
    expect(meta).toEqual({ name: 'foto.png', type: 'image/png', size: 2048 });
  });

  it('das Modul stellt keine Upload-/Versandfunktion bereit', () => {
    // Security-by-Design: keine fetch/upload/submit/send-Exporte im Modul.
    const exported = Object.keys(require('@/lib/fuerMichDokumente'));
    for (const name of exported) {
      expect(name.toLowerCase()).not.toContain('upload');
      expect(name.toLowerCase()).not.toContain('fetch');
      expect(name.toLowerCase()).not.toMatch(/(^|[^a-z])send([^a-z]|$)/);
    }
  });
});

describe('Einreichungssimulation', () => {
  it('ist keine echte Übertragung – nichts ist verifiziert/aktiv in der Demo', () => {
    expect(submissionActiveForSourceStatus('demo')).toBe(false);
    expect(submissionActiveForSourceStatus('needs_verification')).toBe(false);
    expect(submissionActiveForSourceStatus('unavailable')).toBe(false);
    expect(submissionActiveForSourceStatus('verified')).toBe(true);
  });

  it('blockiert echte Übergabe für alle Prioritäts-Leistungen (source_status != verified)', () => {
    for (const key of PRIORITY_KEYS) {
      const service = ALL_KIRKEL_SERVICES.find((s) => s.leistung_key === key);
      expect(service).toBeDefined();
      expect(service!.source_status).not.toBe('verified');
      expect(submissionActiveForSourceStatus(service!.source_status)).toBe(false);
    }
  });

  it('enthält den Pflichttext „nicht übertragen“ und ein Simulations-Badge', () => {
    expect(SIMULATION_NOTHING_TRANSMITTED).toContain('nichts');
    expect(SIMULATION_NOTHING_TRANSMITTED.toLowerCase()).toContain('übertragen');
    expect(SIMULATION_BADGE_TEXT).toContain('nicht übertragen');
    expect(SUBMISSION_BLOCKED_UNVERIFIED).toContain('nicht aktiv');
  });

  it('enthält kein verbotenes Wording im Simulationsoutput', () => {
    const haystack = [
      ...SUBMISSION_SIMULATION_STEPS,
      SIMULATION_BADGE_TEXT,
      SIMULATION_NOTHING_TRANSMITTED,
      SUBMISSION_BLOCKED_UNVERIFIED,
      ...Object.values(SUBMISSION_HANDOVER_LABELS),
      ...Object.values(DOCUMENT_PREP_BY_KEY).flatMap((c) => [
        c.simulated_routing_target.zielstelle,
        ...c.simulated_submission_steps,
        ...flattenDocuments(c).flatMap((d) => [d.titel, d.hinweis]),
      ]),
    ].join(' \n ');

    for (const word of FORBIDDEN_SUBMISSION_WORDS) {
      expect(haystack).not.toContain(word);
    }
  });
});
