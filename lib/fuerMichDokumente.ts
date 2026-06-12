/**
 * Dokumenten-Vorbereitung & Einreichungssimulation (Wegweiser, Demo).
 *
 * REINE LOKALE DEMO-LOGIK:
 * - Keine echte Dokumentenübermittlung, kein Upload an einen Server.
 * - Keine Speicherung, keine E-Mails, kein OCR, kein Auslesen von Dateiinhalten.
 * - Keine Anspruchsprüfung, keine Rechtsberatung, keine echte API-Anbindung.
 *
 * Die Felder sind generisch gehalten und bleiben mit einem späteren
 * Appointment-Resolver kompatibel (KEINE appointment_*-Felder in diesem Schritt).
 */

export type DocumentKind = 'required' | 'optional' | 'not_in_demo';

export type DocumentStatus = 'fehlt' | 'ausgewaehlt' | 'optional' | 'nicht_erforderlich';

export type RequiredDocument = {
  id: string;
  titel: string;
  hinweis: string;
  kind: DocumentKind;
};

export type DocumentGroup = {
  id: string;
  titel: string;
  documents: RequiredDocument[];
};

export type SubmissionHandoverKind =
  | 'online_service_required'
  | 'form_upload_unverified'
  | 'in_person_possible'
  | 'not_connected_demo';

export type SimulatedRoutingTarget = {
  /** Zielstelle aus der Demo-Region (entspricht der zuständigen Stelle im Katalog). */
  zielstelle: string;
  /** Übergabeart, die im Produktivbetrieb gelten würde. */
  handover: SubmissionHandoverKind;
};

export type SubmissionChannelStatus = 'demo_only';

export type DocumentPrepConfig = {
  leistung_key: string;
  required_documents: RequiredDocument[];
  optional_documents: RequiredDocument[];
  document_groups: DocumentGroup[];
  submission_simulation_enabled: boolean;
  simulated_routing_target: SimulatedRoutingTarget;
  simulated_submission_steps: string[];
  verified_submission_channel: string | null;
  submission_channel_status: SubmissionChannelStatus;
};

/** Generischer, simulierter Behördenweg (identisch für alle Leistungen). */
export const SUBMISSION_SIMULATION_STEPS: readonly string[] = [
  'Unterlagen lokal ausgewählt',
  'Demo-Vollständigkeit geprüft',
  'Zuständige Stelle aus der Demo-Region ermittelt',
  'Einreichungspaket vorbereitet',
  'Übergabe wäre erst über einen verifizierten Online-Dienst möglich',
  'Eingangsbestätigung wäre der nächste Schritt im Produktivbetrieb',
];

export const SIMULATION_BADGE_TEXT = 'Simulation – nicht übertragen';
export const SIMULATION_NOTHING_TRANSMITTED =
  'Es wurde nichts an eine Behörde, Gemeinde oder externe Stelle übertragen.';
export const SUBMISSION_BLOCKED_UNVERIFIED =
  'Die Übergabe ist in dieser Demo nicht aktiv, weil die offizielle Schnittstelle noch nicht verifiziert ist.';
export const NO_DOCUMENT_SIMULATION_TEXT =
  'Für diese Leistung ist in der Demo noch keine Unterlagen-Simulation hinterlegt.';

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  fehlt: 'fehlt',
  ausgewaehlt: 'ausgewählt',
  optional: 'optional',
  nicht_erforderlich: 'nicht erforderlich in dieser Demo',
};

export const SUBMISSION_HANDOVER_LABELS: Record<SubmissionHandoverKind, string> = {
  online_service_required: 'Offizieller Online-Dienst erforderlich',
  form_upload_unverified: 'Formular / Upload noch zu verifizieren',
  in_person_possible: 'Persönliche Vorsprache / Termin möglich',
  not_connected_demo: 'In dieser Demo nicht angebunden',
};

/** Verbotenes Wording im Simulationsoutput (Security-by-Design / Test-Guard). */
export const FORBIDDEN_SUBMISSION_WORDS: readonly string[] = [
  'eingereicht',
  'an Behörde versendet',
  'Antrag gestellt',
  'vollständig geprüft',
  'bewilligt',
  'Anspruch',
];

// ── Datei-Regeln (rein lokal) ───────────────────────────────────────────────

export const ALLOWED_FILE_EXTENSIONS: readonly string[] = ['.pdf', '.jpg', '.jpeg', '.png'];
export const ALLOWED_FILE_MIME: readonly string[] = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Nur Metadaten – bewusst KEIN Dateiinhalt (kein OCR, kein Auslesen). */
export type SelectedFileMeta = {
  name: string;
  type: string;
  size: number;
};

/** Extrahiert ausschließlich Name/Typ/Größe – liest NIE den Dateiinhalt. */
export function toFileMeta(file: { name: string; type: string; size: number }): SelectedFileMeta {
  return { name: file.name, type: file.type, size: file.size };
}

export function isAllowedFileType(meta: Pick<SelectedFileMeta, 'name' | 'type'>): boolean {
  const type = (meta.type || '').toLowerCase();
  if (type && ALLOWED_FILE_MIME.includes(type)) return true;
  const name = (meta.name || '').toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function isAllowedFileSize(size: number): boolean {
  return Number.isFinite(size) && size > 0 && size <= MAX_FILE_SIZE_BYTES;
}

export function isAllowedFile(meta: SelectedFileMeta): boolean {
  return isAllowedFileType(meta) && isAllowedFileSize(meta.size);
}

export function fileTypeShortLabel(meta: Pick<SelectedFileMeta, 'name' | 'type'>): string {
  const name = (meta.name || '').toLowerCase();
  if ((meta.type || '').toLowerCase() === 'application/pdf' || name.endsWith('.pdf')) return 'PDF';
  if (name.endsWith('.png') || (meta.type || '').toLowerCase() === 'image/png') return 'PNG';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || (meta.type || '').toLowerCase() === 'image/jpeg')
    return 'JPG';
  return meta.type || 'Datei';
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

// ── Status-Logik ────────────────────────────────────────────────────────────

/** Reiner Status je Nachweis – keine Rechtsprüfung, keine Vollständigkeitsgarantie. */
export function documentStatus(doc: RequiredDocument, hasFile: boolean): DocumentStatus {
  if (hasFile) return 'ausgewaehlt';
  if (doc.kind === 'optional') return 'optional';
  if (doc.kind === 'not_in_demo') return 'nicht_erforderlich';
  return 'fehlt';
}

/** Alle Nachweise einer Konfiguration (flach: Pflicht + optional + Gruppen). */
export function flattenDocuments(config: DocumentPrepConfig): RequiredDocument[] {
  return [
    ...config.required_documents,
    ...config.optional_documents,
    ...config.document_groups.flatMap((g) => g.documents),
  ];
}

/** Wie viele PFLICHT-Nachweise sind ausgewählt? (Steuert „Behördenweg simulieren“.) */
export function countRequiredSelected(
  config: DocumentPrepConfig,
  selectedIds: ReadonlySet<string> | Set<string>,
): number {
  return flattenDocuments(config).filter((d) => d.kind === 'required' && selectedIds.has(d.id))
    .length;
}

/**
 * Echte Übergabe ist NUR bei verifizierter offizieller Schnittstelle möglich.
 * In dieser Demo ist nichts verifiziert → immer false (reine Simulation).
 */
export function submissionActiveForSourceStatus(sourceStatus: string): boolean {
  return sourceStatus === 'verified';
}

// ── Konfiguration je Leistung (keyed nach leistung_key) ─────────────────────

function makeConfig(
  leistung_key: string,
  routing: SimulatedRoutingTarget,
  docs: {
    required_documents?: RequiredDocument[];
    optional_documents?: RequiredDocument[];
    document_groups?: DocumentGroup[];
  },
): DocumentPrepConfig {
  return {
    leistung_key,
    required_documents: docs.required_documents ?? [],
    optional_documents: docs.optional_documents ?? [],
    document_groups: docs.document_groups ?? [],
    submission_simulation_enabled: true,
    simulated_routing_target: routing,
    simulated_submission_steps: [...SUBMISSION_SIMULATION_STEPS],
    verified_submission_channel: null,
    submission_channel_status: 'demo_only',
  };
}

export const DOCUMENT_PREP_BY_KEY: Record<string, DocumentPrepConfig> = {
  geburtsurkunde: makeConfig(
    'geburtsurkunde',
    {
      zielstelle: 'Standesamt des Geburtsortes (Demo: Standesamt Gemeinde Kirkel)',
      handover: 'in_person_possible',
    },
    {
      document_groups: [
        {
          id: 'identitaet',
          titel: 'Identität der Eltern',
          documents: [
            {
              id: 'gu-eltern-1',
              titel: 'Ausweisdokument eines Elternteils',
              hinweis: 'Gültiges Ausweisdokument (Hinweis).',
              kind: 'required',
            },
            {
              id: 'gu-eltern-2',
              titel: 'Ausweisdokument des weiteren Elternteils',
              hinweis: 'Falls vorhanden (Hinweis).',
              kind: 'optional',
            },
          ],
        },
        {
          id: 'geburtsnachweis',
          titel: 'Geburtsnachweis der Klinik / Hebamme',
          documents: [
            {
              id: 'gu-klinik',
              titel: 'Geburtsanzeige der Klinik oder Hebamme',
              hinweis: 'Bescheinigung zur Geburt (Hinweis).',
              kind: 'required',
            },
          ],
        },
        {
          id: 'familienstand',
          titel: 'Familienstand / Sorge',
          documents: [
            {
              id: 'gu-ehe',
              titel: 'Eheurkunde',
              hinweis: 'Falls verheiratet (Hinweis).',
              kind: 'optional',
            },
            {
              id: 'gu-sorge',
              titel: 'Nachweis zur Sorge',
              hinweis: 'Je nach Konstellation (Hinweis).',
              kind: 'optional',
            },
          ],
        },
        {
          id: 'weitere',
          titel: 'Weitere Urkunden, je nach Konstellation',
          documents: [
            {
              id: 'gu-weitere',
              titel: 'Weitere Urkunden',
              hinweis: 'Je nach Konstellation – in dieser Demo nicht erforderlich.',
              kind: 'not_in_demo',
            },
          ],
        },
      ],
    },
  ),

  elterngeld: makeConfig(
    'elterngeld',
    { zielstelle: 'Elterngeldstelle Saarland', handover: 'online_service_required' },
    {
      required_documents: [
        {
          id: 'eg-geburtsurkunde',
          titel: 'Geburtsurkunde des Kindes',
          hinweis: 'Beurkundung der Geburt (Hinweis).',
          kind: 'required',
        },
        {
          id: 'eg-id',
          titel: 'Identitätsnachweis',
          hinweis: 'Gültiges Ausweisdokument (Hinweis).',
          kind: 'required',
        },
        {
          id: 'eg-einkommen',
          titel: 'Einkommensnachweise',
          hinweis: 'z. B. Lohnabrechnungen (Hinweis).',
          kind: 'required',
        },
      ],
      optional_documents: [
        {
          id: 'eg-mutterschaft',
          titel: 'Nachweis über Mutterschaftsgeld / Arbeitgeberzuschuss',
          hinweis: 'Falls relevant (Hinweis).',
          kind: 'optional',
        },
      ],
    },
  ),

  kindergeld: makeConfig(
    'kindergeld',
    {
      zielstelle: 'Familienkasse Saarland (Agentur für Arbeit)',
      handover: 'online_service_required',
    },
    {
      required_documents: [
        {
          id: 'kg-geburtsurkunde',
          titel: 'Geburtsurkunde des Kindes',
          hinweis: 'Beurkundung der Geburt (Hinweis).',
          kind: 'required',
        },
        {
          id: 'kg-steuerid',
          titel: 'Steuer-Identifikationsnummer',
          hinweis: 'Von Kind und Eltern (Hinweis).',
          kind: 'required',
        },
        {
          id: 'kg-id',
          titel: 'Identitätsnachweis',
          hinweis: 'Gültiges Ausweisdokument (Hinweis).',
          kind: 'required',
        },
      ],
      optional_documents: [
        {
          id: 'kg-vorrang',
          titel: 'Nachweis über vorrangige Leistungen',
          hinweis: 'Falls relevant (Hinweis).',
          kind: 'optional',
        },
      ],
    },
  ),

  bafoeg: makeConfig(
    'bafoeg',
    {
      zielstelle: 'Amt für Ausbildungsförderung / Studierendenwerk im Saarland',
      handover: 'online_service_required',
    },
    {
      required_documents: [
        {
          id: 'bf-id',
          titel: 'Identitätsnachweis',
          hinweis: 'Gültiges Ausweisdokument (Hinweis).',
          kind: 'required',
        },
        {
          id: 'bf-imma',
          titel: 'Immatrikulations- oder Ausbildungsnachweis',
          hinweis: 'Aktuelle Bescheinigung (Hinweis).',
          kind: 'required',
        },
        {
          id: 'bf-einkommen',
          titel: 'Einkommensnachweise der Eltern / eigene Nachweise',
          hinweis: 'Je nach Fall (Hinweis).',
          kind: 'required',
        },
      ],
      optional_documents: [
        {
          id: 'bf-konto',
          titel: 'Kontoangaben',
          hinweis: 'Falls relevant (Hinweis).',
          kind: 'optional',
        },
      ],
    },
  ),

  ummeldung: makeConfig(
    'ummeldung',
    { zielstelle: 'Bürgeramt Kirkel', handover: 'online_service_required' },
    {
      required_documents: [
        {
          id: 'um-id',
          titel: 'Ausweisdokument',
          hinweis: 'Gültiges Ausweisdokument (Hinweis).',
          kind: 'required',
        },
        {
          id: 'um-wgb',
          titel: 'Wohnungsgeberbestätigung',
          hinweis: 'Bestätigung der Wohnungsgeberin oder des Wohnungsgebers (Hinweis).',
          kind: 'required',
        },
      ],
    },
  ),

  fuehrerschein: makeConfig(
    'fuehrerschein',
    { zielstelle: 'Führerscheinstelle Saarpfalz-Kreis', handover: 'in_person_possible' },
    {
      required_documents: [
        {
          id: 'fs-id',
          titel: 'Ausweisdokument',
          hinweis: 'Gültiges Ausweisdokument (Hinweis).',
          kind: 'required',
        },
        {
          id: 'fs-foto',
          titel: 'Biometrisches Foto',
          hinweis: 'Aktuelles biometrisches Lichtbild (Hinweis).',
          kind: 'required',
        },
        {
          id: 'fs-sehtest',
          titel: 'Sehtestbescheinigung',
          hinweis: 'Bescheinigung über den Sehtest (Hinweis).',
          kind: 'required',
        },
        {
          id: 'fs-eh',
          titel: 'Erste-Hilfe-Nachweis',
          hinweis: 'Teilnahmebescheinigung (Hinweis).',
          kind: 'required',
        },
      ],
    },
  ),

  'begleitetes-fahren-bf17': makeConfig(
    'begleitetes-fahren-bf17',
    { zielstelle: 'Führerscheinstelle Saarpfalz-Kreis', handover: 'form_upload_unverified' },
    {
      required_documents: [
        {
          id: 'bf17-id',
          titel: 'Ausweisdokument',
          hinweis: 'Gültiges Ausweisdokument (Hinweis).',
          kind: 'required',
        },
        {
          id: 'bf17-zustimmung',
          titel: 'Zustimmung der Sorgeberechtigten',
          hinweis: 'Schriftliche Zustimmung (Hinweis).',
          kind: 'required',
        },
        {
          id: 'bf17-begleit',
          titel: 'Angaben zur Begleitperson',
          hinweis: 'Angaben zur eingetragenen Begleitperson (Hinweis).',
          kind: 'required',
        },
      ],
    },
  ),
};

/** Liefert die Dokumenten-Konfiguration zur Leistung oder null (dann: Hinweis anzeigen). */
export function resolveDocumentPrep(leistungKey: string): DocumentPrepConfig | null {
  return DOCUMENT_PREP_BY_KEY[leistungKey] ?? null;
}

export function hasDocumentPrep(leistungKey: string): boolean {
  return Boolean(DOCUMENT_PREP_BY_KEY[leistungKey]);
}
