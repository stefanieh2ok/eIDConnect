'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle, X, ListChecks, ChevronRight } from 'lucide-react';
import {
  SIMULATION_BADGE_TEXT,
  SIMULATION_NOTHING_TRANSMITTED,
  SUBMISSION_BLOCKED_UNVERIFIED,
  SUBMISSION_HANDOVER_LABELS,
  ALLOWED_FILE_EXTENSIONS,
  countRequiredSelected,
  documentStatus,
  fileTypeShortLabel,
  formatFileSize,
  isAllowedFile,
  resolveDocumentPrep,
  submissionActiveForSourceStatus,
  toFileMeta,
  type DocumentStatus,
  type RequiredDocument,
  type SelectedFileMeta,
} from '@/lib/fuerMichDokumente';
import {
  documentStatusDisplayLabel,
  documentStatusTone,
  statusPillClass,
} from '@/lib/civicStatus';

type Props = {
  leistungKey: string;
  sourceStatus: string;
  du: boolean;
};

const ACCEPT_ATTR = `${ALLOWED_FILE_EXTENSIONS.join(',')},application/pdf,image/jpeg,image/png`;

function StatusPill({ status, kind }: { status: DocumentStatus; kind: RequiredDocument['kind'] }) {
  return (
    <span className={`${statusPillClass(documentStatusTone(status, kind))} gap-1`}>
      {status === 'ausgewaehlt' ? <CheckCircle size={11} aria-hidden /> : null}
      {documentStatusDisplayLabel(status)}
    </span>
  );
}

function DocumentRow({
  index,
  doc,
  file,
  onSelect,
  onRemove,
}: {
  index: number;
  doc: RequiredDocument;
  file: SelectedFileMeta | undefined;
  onSelect: (docId: string, file: File) => void;
  onRemove: (docId: string) => void;
}) {
  const status = documentStatus(doc, Boolean(file));
  return (
    <li className="border-b border-[#E8EEF5] py-2.5 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003366] text-[11px] font-bold text-white">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12.5px] font-bold leading-snug text-[#1A2B45]">{doc.titel}</p>
            <StatusPill status={status} kind={doc.kind} />
          </div>
          {doc.hinweis ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-600">{doc.hinweis}</p>
          ) : null}

          {file ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] px-2.5 py-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle size={14} className="shrink-0 text-[#047857]" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-[#1A2B45]">{file.name}</p>
                  <p className="text-[10px] text-[#047857]">
                    {fileTypeShortLabel(file)} · {formatFileSize(file.size)} · lokal ausgewählt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50"
                aria-label={`Datei für ${doc.titel} entfernen`}
              >
                <X size={12} aria-hidden />
                entfernen
              </button>
            </div>
          ) : doc.kind === 'not_in_demo' ? null : (
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#003366] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#003366] hover:bg-[#FBFDFF]">
              <ChevronRight size={13} aria-hidden />
              Datei auswählen
              <input
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onSelect(doc.id, f);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>
    </li>
  );
}

export default function FuerMichDocumentPrep({ leistungKey, sourceStatus, du }: Props) {
  const config = useMemo(() => resolveDocumentPrep(leistungKey), [leistungKey]);
  const [files, setFiles] = useState<Record<string, SelectedFileMeta>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [simOpen, setSimOpen] = useState(false);

  const selectedIds = useMemo(() => new Set(Object.keys(files)), [files]);
  const requiredSelected = config ? countRequiredSelected(config, selectedIds) : 0;
  const canSimulate = requiredSelected >= 1;
  const submissionActive = submissionActiveForSourceStatus(sourceStatus);

  if (!config) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-[#D6E0EE] bg-[#F7F9FC] px-3 py-2 text-[11px] font-medium text-[#6B7A99]">
        Unterlagen-Check folgt später.
      </div>
    );
  }

  const handleSelect = (docId: string, file: File) => {
    const meta = toFileMeta(file); // nur Name/Typ/Größe – kein Inhalt wird gelesen
    if (!isAllowedFile(meta)) {
      setFileError(
        'Bitte nur PDF, JPG oder PNG bis 10 MB auswählen. Die Datei wird nicht hochgeladen oder gespeichert.',
      );
      return;
    }
    setFileError(null);
    setFiles((prev) => ({ ...prev, [docId]: meta }));
    setSimOpen(false);
  };

  const handleRemove = (docId: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setSimOpen(false);
  };

  // Nummerierte Checkliste: bei Gruppen sind die Gruppen die Hauptpunkte,
  // sonst die Pflicht- und optionalen Nachweise als fortlaufende Liste.
  const flatList: RequiredDocument[] = [...config.required_documents, ...config.optional_documents];

  return (
    <div className="mt-4 rounded-2xl border border-[#D6E0EE] bg-white p-3.5" style={{ boxShadow: '0 4px 14px rgba(0,40,100,0.06)' }}>
      <div className="flex items-center gap-2">
        <ListChecks size={16} className="text-[#003366]" aria-hidden />
        <h3 className="text-[14px] font-bold text-[#1A2B45]">Unterlagen vorbereiten</h3>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
        Die Auswahl bleibt lokal in dieser Sitzung. Es werden keine Dateien hochgeladen, gespeichert
        oder ausgelesen. Erlaubt: PDF, JPG, PNG bis 10 MB.
      </p>

      <h4 className="mt-3 text-[12.5px] font-bold text-[#1A2B45]">Benötigte Unterlagen</h4>
      <p className="mt-0.5 text-[10px] text-neutral-500">
        Keine Rechtsprüfung, keine Vollständigkeitsgarantie.
      </p>

      {config.document_groups.length > 0 ? (
        <ol className="mt-2 space-y-2.5">
          {config.document_groups.map((group, gIdx) => (
            <li key={group.id} className="rounded-xl border border-[#D6E0EE] bg-[#FBFDFF] p-2.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003366] text-[11px] font-bold text-white">
                  {gIdx + 1}
                </span>
                <p className="text-[12.5px] font-bold text-[#1A2B45]">{group.titel}</p>
              </div>
              <ul className="mt-2 space-y-2 pl-1">
                {group.documents.map((doc, dIdx) => (
                  <DocumentRow
                    key={doc.id}
                    index={dIdx + 1}
                    doc={doc}
                    file={files[doc.id]}
                    onSelect={handleSelect}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="mt-2 space-y-2">
          {flatList.map((doc, idx) => (
            <DocumentRow
              key={doc.id}
              index={idx + 1}
              doc={doc}
              file={files[doc.id]}
              onSelect={handleSelect}
              onRemove={handleRemove}
            />
          ))}
        </ol>
      )}

      {fileError ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-900">
          {fileError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setSimOpen((v) => !v)}
        disabled={!canSimulate}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#003366] bg-[#003366] py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
      >
        {simOpen ? 'Simulation ausblenden' : 'Behördenweg simulieren'}
        <ChevronRight size={14} aria-hidden />
      </button>
      {!canSimulate ? (
        <p className="mt-1 text-center text-[10px] text-neutral-500">
          {du
            ? 'Wähle mindestens einen erforderlichen Nachweis aus, um die Simulation zu starten.'
            : 'Wählen Sie mindestens einen erforderlichen Nachweis aus, um die Simulation zu starten.'}
        </p>
      ) : null}

      {simOpen && canSimulate ? (
        <SimulationPanel
          config={config}
          submissionActive={submissionActive}
        />
      ) : null}
    </div>
  );
}

function SimulationPanel({
  config,
  submissionActive,
}: {
  config: ReturnType<typeof resolveDocumentPrep>;
  submissionActive: boolean;
}) {
  if (!config) return null;
  return (
    <section
      className="mt-3 rounded-xl border border-[#9DBDE6] bg-[#F2F7FD] p-3"
      aria-label="Simulierter Behördenweg"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[13px] font-bold text-[#1A2B45]">Simulierter Behördenweg</h4>
        <span className="inline-flex items-center rounded-full border border-[#003366] bg-white px-2 py-0.5 text-[10px] font-bold text-[#003366]">
          {SIMULATION_BADGE_TEXT}
        </span>
      </div>

      <div className="mt-2.5 rounded-lg border border-[#D6E0EE] bg-white p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Zielstelle (Demo)
        </p>
        <p className="mt-0.5 text-[12px] font-semibold text-[#1A2B45]">
          {config.simulated_routing_target.zielstelle}
        </p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Übergabeart
        </p>
        <p className="mt-0.5 text-[12px] font-medium text-[#1A2B45]">
          {SUBMISSION_HANDOVER_LABELS[config.simulated_routing_target.handover]}
        </p>
      </div>

      {!submissionActive ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-900">
          {SUBMISSION_BLOCKED_UNVERIFIED}
        </p>
      ) : null}

      <ol className="mt-3 space-y-2">
        {config.simulated_submission_steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#003366] bg-white text-[10px] font-bold text-[#003366]">
              {idx + 1}
            </span>
            <p className="text-[11.5px] leading-relaxed text-[#1A2B45]">{step}</p>
          </li>
        ))}
      </ol>

      <p className="mt-3 rounded-lg border border-[#003366]/30 bg-white px-2.5 py-2 text-[11px] font-semibold leading-relaxed text-[#1A2B45]">
        {SIMULATION_NOTHING_TRANSMITTED}
      </p>
    </section>
  );
}
