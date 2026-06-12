'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { InfoHint } from '@/components/ui/InfoHint';
import { useApp } from '@/context/AppContext';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';
import {
  meldungStatusLabel,
  meldungStatusTone,
  processStripItemClass,
  type MeldungsProcessStatus,
} from '@/lib/civicStatus';

type MeldungKategorie =
  | 'strasse'
  | 'spielplatz'
  | 'beleuchtung'
  | 'gruenanlage'
  | 'sonstiges';

const KATEGORIEN: { id: MeldungKategorie; label: string; hint: string }[] = [
  { id: 'strasse',     label: 'Straße / Weg',   hint: 'Schlaglöcher, beschädigter Gehweg, Beschilderung' },
  { id: 'spielplatz',  label: 'Spielplatz',     hint: 'Defekte Geräte, fehlende Absicherung' },
  { id: 'beleuchtung', label: 'Beleuchtung',    hint: 'Ausgefall. Straßenlaterne, dunkle Wege' },
  { id: 'gruenanlage', label: 'Grünanlage',     hint: 'Verwildert, umgestürzter Baum, Müll' },
  { id: 'sonstiges',   label: 'Sonstiges',      hint: 'Andere Meldungen an die Gemeinde' },
];

type Step = 'kategorie' | 'details' | 'bestaetigt';
type StatusFilter = 'alle' | MeldungsProcessStatus;

const FLOW_STEPS: { key: Step; label: string }[] = [
  { key: 'kategorie', label: 'Kategorie' },
  { key: 'details', label: 'Details' },
  { key: 'bestaetigt', label: 'Status' },
];

function MeldungFlowStepper({ step }: { step: Step }) {
  const currentIdx = step === 'kategorie' ? 0 : step === 'details' ? 1 : 2;
  return (
    <div className="civic-flow-stepper" aria-label="Meldungsablauf">
      {FLOW_STEPS.map((flowStep, idx) => (
        <React.Fragment key={flowStep.key}>
          <div
            className={`civic-flow-stepper__step${
              idx === currentIdx ? ' civic-flow-stepper__step--active' : ''
            }${idx < currentIdx ? ' civic-flow-stepper__step--done' : ''}`}
          >
            <span className="civic-flow-stepper__dot" aria-hidden>
              {idx < currentIdx ? '✓' : idx + 1}
            </span>
            <span className="civic-flow-stepper__label">{flowStep.label}</span>
          </div>
          {idx < FLOW_STEPS.length - 1 ? <span className="civic-flow-stepper__line" aria-hidden /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

function meldungStatusDotClass(status: MeldungsProcessStatus): string {
  return `meldung-status-dot meldung-status-dot--${status}`;
}

const PROCESS_STATUSES: MeldungsProcessStatus[] = ['offen', 'in_bearbeitung', 'erledigt'];

function demoMeldungenForGemeinde(gemeinde: string) {
  return [
    { id: 1, titel: 'Schlagloch Hauptstraße', ort: gemeinde, datum: '20.03.2026', status: 'in_bearbeitung' as const },
    { id: 2, titel: 'Defektes Spielgerät auf Spielplatz', ort: gemeinde, datum: '18.03.2026', status: 'offen' as const },
    { id: 3, titel: 'Straßenlaterne ausgefallen', ort: gemeinde, datum: '15.03.2026', status: 'erledigt' as const },
  ];
}

type MeldungenSectionProps = {
  /** Eingebettet im Walkthrough: etwas kompaktere Abstände, gleiche Funktionalität. */
  embeddedInWalkthrough?: boolean;
  /** Walkthrough: automatisierte Demo-Sequenz (Tippen + Upload-Vorschau), ohne Speicherung. */
  walkthroughDemo?: {
    enabled: boolean;
    /** Beschreibungs-Text, der per Typewriter eingetippt wird. */
    descriptionText: string;
    /** Optional: Adresse, die im Walkthrough ebenfalls eingetippt wird. */
    addressText?: string;
    /** Public-URL zu einem Demo-Bild, das nach dem Tippen „hochgeladen“ wird. */
    imageUrl: string;
    /** Optional: Signalisiert, dass die Walkthrough-Sequenz fertig ist. */
    onSequenceDone?: () => void;
  };
};

export default function MeldungenSection({ embeddedInWalkthrough = false, walkthroughDemo }: MeldungenSectionProps) {
  const { state, dispatch } = useApp();
  const du = state.anrede === 'du';
  const gemeindeLoc = activeLocationForLevel(state.residenceLocation, 'kommune');
  const gemeinde = DEMO_LOCATION_LABEL[gemeindeLoc];
  const demoListe = useMemo(() => demoMeldungenForGemeinde(gemeinde), [gemeinde]);

  const [step, setStep] = useState<Step>('kategorie');
  const [kategorie, setKategorie] = useState<MeldungKategorie | null>(null);
  const [beschreibung, setBeschreibung] = useState('');
  const [adresse, setAdresse] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('alle');
  const [dringlichkeit, setDringlichkeit] = useState(2);
  const [demoUploadPct, setDemoUploadPct] = useState(0);
  const [demoUploaded, setDemoUploaded] = useState(false);
  const [demoTyping, setDemoTyping] = useState(false);
  const [demoTypingAddress, setDemoTypingAddress] = useState(false);
  const [demoPhotoLabel, setDemoPhotoLabel] = useState(false);
  const [demoFinalReady, setDemoFinalReady] = useState(false);
  const [demoImageZoom, setDemoImageZoom] = useState(false);
  const demoTimerRef = useRef<number | null>(null);
  const demoUiTimersRef = useRef<number[]>([]);

  const photoPreviews = useMemo(() => {
    return photos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [photos]);

  useEffect(() => {
    return () => {
      for (const p of photoPreviews) URL.revokeObjectURL(p.url);
    };
  }, [photoPreviews]);

  useEffect(() => {
    if (!walkthroughDemo?.enabled) return;

    // Start directly in the real input UI (details view) and simulate a short sequence:
    // typewriter text → upload progress → thumbnail appears. No persistence.
    setStep('details');
    setKategorie('spielplatz');
    setAdresse('');
    setPhotos([]);
    setDemoUploadPct(0);
    setDemoUploaded(false);
    setDemoTyping(true);
    setDemoTypingAddress(false);
    setDemoPhotoLabel(false);
    setDemoFinalReady(false);
    setDemoImageZoom(false);
    for (const t of demoUiTimersRef.current) window.clearTimeout(t);
    demoUiTimersRef.current = [];

    const text = walkthroughDemo.descriptionText;
    let i = 0;
    setBeschreibung('');

    const tickTyping = () => {
      i += 1;
      setBeschreibung(text.slice(0, i));
      if (i < text.length) {
        demoTimerRef.current = window.setTimeout(tickTyping, 26 + Math.floor(Math.random() * 32));
        return;
      }

      setDemoTyping(false);
      const addrTarget = walkthroughDemo.addressText?.trim();
      if (addrTarget) {
        setDemoTypingAddress(true);
        let ai = 0;
        setAdresse('');
        const tickAddress = () => {
          ai += 1;
          setAdresse(addrTarget.slice(0, ai));
          if (ai < addrTarget.length) {
            demoTimerRef.current = window.setTimeout(tickAddress, 24 + Math.floor(Math.random() * 28));
            return;
          }
          setDemoTypingAddress(false);
          demoTimerRef.current = window.setTimeout(startUpload, 300);
        };
        demoTimerRef.current = window.setTimeout(tickAddress, 240);
        return;
      }

      // No address typing configured: go straight to upload.
      startUpload();
    };

    const startUpload = () => {
      const start = Date.now();
      const durationMs = 1200;
      const tickUpload = () => {
        const t = Math.min(1, (Date.now() - start) / durationMs);
        setDemoUploadPct(Math.round(t * 100));
        if (t < 1) {
          demoTimerRef.current = window.setTimeout(tickUpload, 70);
          return;
        }
        setDemoUploaded(true);
        // Follow-up UI cues: label first, then final “prepared” state.
        demoUiTimersRef.current.push(window.setTimeout(() => setDemoPhotoLabel(true), 220));
        demoUiTimersRef.current.push(
          window.setTimeout(() => {
            setDemoFinalReady(true);
            walkthroughDemo?.onSequenceDone?.();
          }, 640)
        );
      };
      demoTimerRef.current = window.setTimeout(tickUpload, 180);
    };

    demoTimerRef.current = window.setTimeout(tickTyping, 500);

    return () => {
      if (demoTimerRef.current) window.clearTimeout(demoTimerRef.current);
      for (const t of demoUiTimersRef.current) window.clearTimeout(t);
      demoUiTimersRef.current = [];
    };
  }, [
    walkthroughDemo?.enabled,
    walkthroughDemo?.descriptionText,
    walkthroughDemo?.addressText,
    walkthroughDemo?.imageUrl,
    walkthroughDemo?.onSequenceDone,
  ]);

  const handleSenden = () => {
    if (!beschreibung.trim()) return;
    dispatch({ type: 'RECORD_MELDUNG_SUBMITTED' });
    setStep('bestaetigt');
  };

  const handleNeu = () => {
    setStep('kategorie');
    setKategorie(null);
    setBeschreibung('');
    setAdresse('');
    setPhotos([]);
    setDringlichkeit(2);
  };

  const selectedKat = KATEGORIEN.find((k) => k.id === kategorie);
  const filteredDemoListe = useMemo(
    () => demoListe.filter((m) => statusFilter === 'alle' || m.status === statusFilter),
    [demoListe, statusFilter],
  );
  const shellClass = embeddedInWalkthrough ? 'civic-module-shell civic-module-shell--compact' : 'civic-module-shell';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (step === 'details' && !walkthroughDemo?.enabled) {
      document.documentElement.setAttribute('data-meldungen-form-open', 'true');
    } else {
      document.documentElement.removeAttribute('data-meldungen-form-open');
    }
    return () => document.documentElement.removeAttribute('data-meldungen-form-open');
  }, [step, walkthroughDemo?.enabled]);
  const showDemoUpload = Boolean(walkthroughDemo?.enabled) && step === 'details';
  const showDemoCaret = Boolean(walkthroughDemo?.enabled) && step === 'details' && demoTyping;
  const showDemoAddressCaret = Boolean(walkthroughDemo?.enabled) && step === 'details' && demoTypingAddress;
  const isWalkthroughFilmMode = Boolean(walkthroughDemo?.enabled);

  return (
    <div
      className={`${embeddedInWalkthrough ? 'walkthrough-meldungen-embed' : ''} ${
        isWalkthroughFilmMode ? 'walkthrough-meldungen-film' : ''
      } ${shellClass}`}
    >
      {!isWalkthroughFilmMode ? <MeldungFlowStepper step={step} /> : null}

      {/* Step: Kategorie wählen */}
      {step === 'kategorie' && (
        <div className="pb-20">
          <p className="mb-2 text-[14px] font-semibold text-[#003366]">
            {du ? 'Was möchtest du melden?' : 'Was möchten Sie melden?'}
          </p>
          <div className="mt-2 border-t border-[#E8EEF5]">
            {KATEGORIEN.map((k) => (
              <div key={k.id} className="meldung-category-row group">
                <button
                  onClick={() => { setKategorie(k.id); setStep('details'); }}
                  className="meldung-category-pill w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 text-[13px] font-semibold leading-snug text-[#1A2B45]">{k.label}</div>
                    <span className="text-sm font-semibold text-[#94a3b8] group-hover:text-[#0055A4]" aria-hidden>
                      &rsaquo;
                    </span>
                  </div>
                </button>
                <InfoHint label={`Beispiele: ${k.label}`} className="meldung-category-row__hint">
                  <p>{k.hint}</p>
                </InfoHint>
              </div>
            ))}
          </div>

          <div className="meldung-list-section">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="meldung-list-section__title">Aktuelle Meldungen · {gemeinde}</p>
            </div>
            <div className="meldung-process-header mb-2">
              <button
                type="button"
                onClick={() => setStatusFilter('alle')}
                className={`meldung-filter-neutral${statusFilter === 'alle' ? ' meldung-filter-neutral--active' : ''}`}
              >
                Alle
              </button>
              <div className="process-strip" role="group" aria-label="Bearbeitungsstatus">
                {PROCESS_STATUSES.map((status) => {
                  const tone = meldungStatusTone(status);
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      aria-pressed={active}
                      className={processStripItemClass(tone, active)}
                    >
                      {meldungStatusLabel(status)}
                    </button>
                  );
                })}
              </div>
            </div>
            {filteredDemoListe.length === 0 ? (
              <p className="rounded-lg border border-[#E8EEF5] bg-white p-3 text-xs text-gray-500">
                Für diesen Status liegen aktuell keine Beispiel-Meldungen vor.
              </p>
            ) : null}
            {filteredDemoListe.map((m) => (
                <div key={m.id} className="meldung-issue-card">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={meldungStatusDotClass(m.status)} aria-hidden />
                      <span className="text-[10px] font-semibold text-[#5f6b7a]">{meldungStatusLabel(m.status)}</span>
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-gray-800 truncate">{m.titel}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{m.ort} · {m.datum}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Step: Details eingeben */}
      {step === 'details' && selectedKat && (
        <div className={isWalkthroughFilmMode ? 'p-1' : ''}>
          {!isWalkthroughFilmMode ? (
            <button
              onClick={() => setStep('kategorie')}
              className="mb-3 inline-flex items-center gap-1 rounded-lg border border-transparent px-1.5 py-1 text-xs font-medium text-[#1F4F8A] hover:border-[#D6E0EE] hover:bg-white"
            >
              ← Kategorie ändern
            </button>
          ) : null}

          <div className={`${isWalkthroughFilmMode ? 'mb-1.5' : 'mb-3'} flex items-center gap-1.5 border-b border-[#E8EEF5] pb-2`}>
            <span className="text-[10px] font-semibold text-[#6B7A99]">Kategorie</span>
            <span className={`${isWalkthroughFilmMode ? 'text-[13px]' : 'text-sm'} font-semibold text-[#1A2B45]`}>
              {selectedKat.label}
            </span>
          </div>

          <div
            className={
              `walkthrough-meldungen-film-stack space-y-1.5 ${embeddedInWalkthrough ? (isWalkthroughFilmMode ? 'pb-0.5' : 'pb-12') : 'pb-28'} ` +
              (isWalkthroughFilmMode ? 'origin-top scale-[0.84]' : '')
            }
          >
            {!walkthroughDemo?.enabled ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold text-[#1A2B45]">Priorität</p>
                <div className="flex gap-1.5">
                  {(['Niedrig', 'Mittel', 'Hoch'] as const).map((label, idx) => {
                    const level = idx + 1;
                    const active = dringlichkeit === level;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setDringlichkeit(level)}
                        aria-pressed={active}
                        className={`priority-pill flex-1 ${active ? 'priority-pill--active' : ''}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div>
              <label className={`block text-xs font-semibold text-gray-700 ${isWalkthroughFilmMode ? 'mb-0.5' : 'mb-1.5'}`}>
                {du ? 'Deine Beschreibung *' : 'Ihre Beschreibung *'}
              </label>
              <div className="relative">
                <textarea
                  value={beschreibung}
                  onChange={(e) => setBeschreibung(e.target.value)}
                  rows={isWalkthroughFilmMode ? 1 : 3}
                  placeholder={
                    du
                      ? 'Beschreibe das Problem so genau wie möglich...'
                      : 'Bitte beschreiben Sie das Problem so genau wie möglich...'
                  }
                  className={
                    'form-textarea w-full resize-none [font-family:inherit] tracking-normal ' +
                    (showDemoCaret ? 'text-transparent caret-transparent' : '')
                  }
                />
                {showDemoCaret ? (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl whitespace-pre-wrap break-words text-[15px] leading-[22px] [font-family:inherit] tracking-normal text-[#1A2B45]"
                    aria-hidden
                    style={{ padding: '14px' }}
                  >
                    {beschreibung}
                    <span className="intro-typewriter-caret ml-px inline-block h-[1em] w-[2px] bg-[#0055A4]" />
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold text-gray-700 ${isWalkthroughFilmMode ? 'mb-0.5' : 'mb-1.5'}`}>
                {isWalkthroughFilmMode ? 'Standort / Adresse' : 'Standort / Adresse (optional)'}
              </label>
              <div className="flex gap-2">
                <div className="relative min-h-0 flex-1">
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder={`z. B. Hauptstraße 12, ${gemeinde}`}
                    className={
                      'form-input w-full [font-family:inherit] tracking-normal ' +
                      (showDemoAddressCaret ? 'text-transparent caret-transparent' : '')
                    }
                  />
                  {showDemoAddressCaret ? (
                    <div
                      className="pointer-events-none absolute inset-0 flex min-h-[48px] items-center overflow-x-auto whitespace-nowrap rounded-[14px] px-[14px] text-[15px] leading-5 [font-family:inherit] tracking-normal text-[#1A2B45] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      aria-hidden
                    >
                      {adresse}
                      <span className="intro-typewriter-caret ml-px inline-block h-[1em] w-[2px] shrink-0 bg-[#0055A4]" />
                    </div>
                  ) : null}
                </div>
                {!isWalkthroughFilmMode ? (
                  <button
                    type="button"
                    className="btn-secondary min-w-[64px] text-sm"
                    style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
                    title="Aktuellen Standort verwenden"
                  >
                    Ort
                  </button>
                ) : null}
              </div>
            </div>

            {/* Foto */}
            <div className={isWalkthroughFilmMode ? 'space-y-0.5' : 'space-y-1.5'}>
              <label
                className={`civic-upload-zone ${photos.length > 0 ? 'civic-upload-zone--active' : ''} ${
                  isWalkthroughFilmMode ? 'py-2' : ''
                }`}
              >
                <Camera className="h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[12px] font-semibold text-[#003366]">
                    {photos.length > 0 ? `${photos.length} Foto(s) ausgewählt` : 'Foto lokal hinzufügen'}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[#6B7A99]">In der Demo nur lokal sichtbar</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const next = Array.from(e.target.files ?? []);
                    if (next.length === 0) return;
                    setPhotos((prev) => [...prev, ...next].slice(0, 5));
                    e.currentTarget.value = '';
                  }}
                />
              </label>

              {showDemoUpload && demoUploadPct > 0 && !demoUploaded ? (
                <div className={`rounded-xl border border-slate-200 bg-white ${isWalkthroughFilmMode ? 'px-2 py-1' : 'px-3 py-2'}`}>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
                    <span>Upload</span>
                    <span>{demoUploadPct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0055A4] transition-[width] duration-300 ease-out"
                      style={{ width: `${demoUploadPct}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {showDemoUpload && demoUploaded ? (
                <div className={isWalkthroughFilmMode ? 'space-y-1.5' : 'space-y-1.5'}>
                  {demoPhotoLabel ? (
                    <div className="text-[10px] font-semibold text-emerald-800">Foto hinzugefügt</div>
                  ) : null}
                  <div
                    className={
                      isWalkthroughFilmMode
                        ? 'flex justify-center pt-0.5'
                        : 'grid grid-cols-3 gap-1.5'
                    }
                  >
                    <div
                      className={
                        'intro-upload-pop relative overflow-hidden rounded-xl border border-neutral-200 bg-white ' +
                        (isWalkthroughFilmMode ? 'w-full max-w-[280px] shadow-sm' : '')
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setDemoImageZoom((z) => !z)}
                        className={
                          'relative block w-full overflow-hidden ' +
                          (isWalkthroughFilmMode ? 'h-[200px]' : 'h-20')
                        }
                        title="Bild vergrößern"
                      >
                        <img
                          src={walkthroughDemo!.imageUrl}
                          alt="Foto Vorschau"
                          className={
                            'h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-125 ' +
                            (demoImageZoom ? 'scale-[1.7]' : 'scale-100')
                          }
                        />
                      </button>
                    </div>
                  </div>
                  {demoFinalReady ? (
                    <div className="mt-0.5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                      Bereit zur Weiterleitung
                    </div>
                  ) : null}
                </div>
              ) : null}

              {photoPreviews.length > 0 && (
                <div className="space-y-1.5">
                  {photoPreviews.map((p) => (
                    <div key={p.url} className="civic-upload-file-row">
                      <img src={p.url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-[#1A2B45]">{p.file.name}</p>
                        <p className="text-[10px] text-[#6B7A99]">
                          {(p.file.size / 1024).toFixed(0)} KB · lokal
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((f) => f !== p.file))}
                        className="civic-upload-file-row__remove"
                        aria-label="Foto entfernen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {!isWalkthroughFilmMode ? (
                <p className="text-[10px] text-gray-400">
                  {du ? 'Max. 5 Fotos. In der Vorschau werden sie nur lokal angezeigt.' : 'Max. 5 Fotos. In der Vorschau werden sie nur lokal angezeigt.'}
                </p>
              ) : null}
            </div>

            {!isWalkthroughFilmMode ? (
              <>
                <button
                  type="button"
                  onClick={handleSenden}
                  disabled={!beschreibung.trim()}
                  className="btn-primary t-button w-full transition-opacity hover:opacity-95 disabled:bg-neutral-300 disabled:text-neutral-100 disabled:opacity-100"
                >
                  Meldung vorbereiten
                </button>

                <p className="flex items-center justify-center gap-1 text-center text-[10px] text-[#6B7A99]">
                  Vorschau
                  <InfoHint label="Hinweis zur Meldung">
                    <p>
                      {du
                        ? 'Keine echte Übermittlung an die Gemeinde — nur lokale Demo-Vorschau.'
                        : 'Keine echte Übermittlung an die Gemeinde — nur lokale Demo-Vorschau.'}
                    </p>
                  </InfoHint>
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Step: Bestätigung */}
      {step === 'bestaetigt' && (
        <div className="py-8 text-center">
          <div
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--gov-accent-light, #E6F7F1)' }}
          >
            <span className="text-sm font-bold text-emerald-700">OK</span>
          </div>
          <h3 className="mb-2 text-lg font-bold text-[#003366]">Vorschau erstellt</h3>
          <p className="mb-1 text-sm text-[#5f6b7a]">
            {du
              ? `Deine Meldung für ${gemeinde} ist lokal vorbereitet — keine echte Übermittlung.`
              : `Ihre Meldung für ${gemeinde} ist lokal vorbereitet — keine echte Übermittlung.`}
          </p>
          <p className="mb-6 text-xs text-[#6B7A99]">Demo-Ansicht · keine Bearbeitungszusage</p>
          <button
            onClick={handleNeu}
            className="rounded-2xl bg-[#003D80] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Neue Meldung erstellen
          </button>
        </div>
      )}
    </div>
  );
}
