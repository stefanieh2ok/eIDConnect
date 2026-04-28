'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';

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
type MeldungsStatus = 'offen' | 'in_bearbeitung' | 'erledigt';
type StatusFilter = 'alle' | MeldungsStatus;

function demoMeldungenForGemeinde(gemeinde: string) {
  return [
    { id: 1, titel: 'Schlagloch Hauptstraße Ecke Bahnhofstr.', ort: gemeinde, datum: '20.03.2026', status: 'in_bearbeitung' as const },
    { id: 2, titel: 'Defektes Spielgerät auf dem Spielplatz', ort: gemeinde, datum: '18.03.2026', status: 'offen' as const },
    { id: 3, titel: 'Straßenlaterne ausgefallen Waldstr.', ort: gemeinde, datum: '15.03.2026', status: 'erledigt' as const },
    { id: 4, titel: 'Überwucherter Gehweg am Gemeindezentrum', ort: gemeinde, datum: '10.03.2026', status: 'erledigt' as const },
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
  const dringlichkeitLabel = dringlichkeit === 1 ? 'Niedrig' : dringlichkeit === 2 ? 'Mittel' : 'Hoch';
  const shellClass = embeddedInWalkthrough ? 'card-section p-2.5' : 'card-section p-3';
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
      {!isWalkthroughFilmMode ? (
        <div className={`flex items-start justify-between ${embeddedInWalkthrough ? 'mb-2' : 'mb-3'}`}>
          <div className="t-meta mt-0.5">
            {selectionLabelForSection('meldungen', state.activeLocation, state.residenceLocation)}
          </div>
          <SectionLevelFilterIcon section="meldungen" />
        </div>
      ) : null}
      {/* Intro-Info, bewusst ruhig statt herohaft */}
      {!isWalkthroughFilmMode ? (
        <div className={embeddedInWalkthrough ? 'card-content mb-3 p-4' : 'card-content mb-4 p-4'}>
          <div className="mb-2 inline-flex items-center rounded-full border border-[#CFE0F7] bg-[#F4F8FE] px-2.5 py-1 text-[10px] font-semibold text-[#1F4F8A]">
            Kommunaler Service
          </div>
          <p className="t-body-sm">
            {du
              ? `Melde Probleme oder Anliegen direkt an die Gemeindeverwaltung ${gemeinde}.`
              : `Hinweise und Anliegen können direkt an die Gemeindeverwaltung ${gemeinde} gesendet werden.`}
          </p>
        </div>
      ) : null}

      {/* Step: Kategorie wählen */}
      {step === 'kategorie' && (
        <div className="card-content p-3 pb-24">
          <p className="mb-2.5 text-sm font-semibold text-[#1A2B45]">
            {du ? 'Was möchtest du melden?' : 'Was möchten Sie melden?'}
          </p>
          <div className="space-y-2.5">
            {KATEGORIEN.map((k) => (
              <button
                key={k.id}
                onClick={() => { setKategorie(k.id); setStep('details'); }}
                className="card-compact group min-h-[68px] w-full text-left transition-all hover:border-[#8EB1DE] hover:bg-[#FBFDFF] hover:shadow-md active:translate-y-[1px] active:border-[#78D9D0] active:bg-[#F3FCFB]"
                style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-semibold leading-snug text-[#1A2B45]">{k.label}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{k.hint}</div>
                  </div>
                  <span className="text-sm font-semibold text-neutral-400 transition-colors group-hover:text-[#1F4F8A]" aria-hidden>
                    &rsaquo;
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Letzte Meldungen (Demo) */}
          <div className="mt-5 rounded-xl border border-neutral-200 bg-[#FBFCFF] p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Aktuelle Meldungen in {gemeinde}
              </p>
              <div className="flex items-center gap-1 rounded-full border border-[#D6E0EE] bg-white p-1">
                {[
                  { id: 'alle', label: 'Alle' },
                  { id: 'offen', label: 'Offen' },
                  { id: 'in_bearbeitung', label: 'In Bearb.' },
                  { id: 'erledigt', label: 'Erledigt' },
                ].map((option) => {
                  const active = statusFilter === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setStatusFilter(option.id as StatusFilter)}
                      className="rounded-full px-2 py-1 text-[10px] font-semibold transition-colors"
                      style={
                        active
                          ? {
                              color: '#0F766E',
                              border: '1px solid #7ADFD4',
                              backgroundColor: '#ECFEFC',
                            }
                          : undefined
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {filteredDemoListe.length === 0 ? (
              <p className="rounded-xl border border-[#D6E0EE] bg-white p-3 text-xs text-gray-500">
                Für diesen Status liegen aktuell keine Demo-Meldungen vor.
              </p>
            ) : null}
            {filteredDemoListe.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 bg-white rounded-xl p-3 mb-2 border"
                style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
              >
                <span
                  className={`mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'offen'
                      ? 'bg-amber-100 text-amber-700'
                      : m.status === 'in_bearbeitung'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {m.status === 'offen'
                    ? 'Offen'
                    : m.status === 'in_bearbeitung'
                    ? 'In Bearb.'
                    : 'Erledigt'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{m.titel}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{m.ort} · {m.datum}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Details eingeben */}
      {step === 'details' && selectedKat && (
        <div className={`card-content ${isWalkthroughFilmMode ? 'p-1.5' : 'p-3'}`}>
          {!isWalkthroughFilmMode ? (
            <button
              onClick={() => setStep('kategorie')}
              className="mb-3 inline-flex items-center gap-1 rounded-lg border border-transparent px-1.5 py-1 text-xs font-medium text-[#1F4F8A] hover:border-[#D6E0EE] hover:bg-white"
            >
              ← Kategorie ändern
            </button>
          ) : null}

          <div className={`${isWalkthroughFilmMode ? 'mb-1.5 p-2' : 'mb-4 p-3.5'} rounded-xl border border-[#CFE0F7] bg-[#F6FAFF]`}>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#4F6F96]">Ausgewählte Kategorie</div>
            <div className={`${isWalkthroughFilmMode ? 'mt-0.5 text-[13px]' : 'mt-1 text-sm'} font-semibold text-[#1A2B45]`}>
              {selectedKat.label}
            </div>
          </div>

          <div
            className={
              `walkthrough-meldungen-film-stack space-y-1.5 ${embeddedInWalkthrough ? (isWalkthroughFilmMode ? 'pb-0.5' : 'pb-12') : 'pb-28'} ` +
              (isWalkthroughFilmMode ? 'origin-top scale-[0.84]' : '')
            }
          >
            {!walkthroughDemo?.enabled ? (
              <div className="rounded-xl border border-[#CFE7E3] bg-[#F4FCFA] p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="dringlichkeit-range" className="text-xs font-semibold text-[#1A2B45]">
                    Priorität
                  </label>
                  <span className="rounded-full border border-[#7ADFD4] bg-[#ECFEFC] px-2 py-0.5 text-[10px] font-semibold text-[#0F766E]">
                    {dringlichkeitLabel}
                  </span>
                </div>
                <input
                  id="dringlichkeit-range"
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={dringlichkeit}
                  onChange={(e) => setDringlichkeit(Number(e.target.value))}
                  className="w-full accent-[#16B8AE]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                  <span>Niedrig</span>
                  <span>Mittel</span>
                  <span>Hoch</span>
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
                    'form-textarea w-full resize-none ' +
                    (showDemoCaret ? 'text-transparent caret-transparent' : '')
                  }
                />
                {showDemoCaret ? (
                  <div
                    className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words text-[inherit] leading-[inherit] text-[#1A2B45]"
                    aria-hidden
                    style={{ padding: '0.75rem 0.875rem' }}
                  >
                    {beschreibung}
                    <span className="intro-typewriter-caret ml-px inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#0055A4]" />
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold text-gray-700 ${isWalkthroughFilmMode ? 'mb-0.5' : 'mb-1.5'}`}>
                {isWalkthroughFilmMode ? 'Standort / Adresse' : 'Standort / Adresse (optional)'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder={`z. B. Hauptstraße 12, ${gemeinde}`}
                    className={
                      'form-input w-full ' + (showDemoAddressCaret ? 'text-transparent caret-transparent' : '')
                    }
                  />
                  {showDemoAddressCaret ? (
                    <div
                      className="pointer-events-none absolute inset-0 truncate text-[inherit] leading-[inherit] text-[#1A2B45]"
                      aria-hidden
                      style={{ padding: '0.625rem 0.75rem' }}
                    >
                      {adresse}
                      <span className="intro-typewriter-caret ml-px inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#0055A4]" />
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
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white text-sm font-medium transition-colors hover:border-[#7AA4D8] hover:text-[#1F4F8A] ${
                  isWalkthroughFilmMode ? 'py-1.5' : 'py-2'
                }`}
                style={{ borderColor: 'var(--gov-border, #D6E0EE)', color: photos.length > 0 ? '#1F4F8A' : undefined }}
              >
                {photos.length > 0
                  ? du
                    ? `${photos.length} Foto(s) ausgewählt`
                    : `${photos.length} Foto(s) ausgewählt`
                  : du
                    ? 'Foto hinzufügen'
                    : 'Foto hinzufügen'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const next = Array.from(e.target.files ?? []);
                    if (next.length === 0) return;
                    // max 5, mobile-first
                    setPhotos((prev) => [...prev, ...next].slice(0, 5));
                    e.currentTarget.value = '';
                  }}
                />
              </label>

              {showDemoUpload && demoUploadPct > 0 && !demoUploaded ? (
                <div className={`rounded-xl border border-slate-200 bg-white ${isWalkthroughFilmMode ? 'px-2 py-1' : 'px-3 py-2'}`}>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
                    <span>Upload (Demo)</span>
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
                <div className={isWalkthroughFilmMode ? 'space-y-1' : 'space-y-1.5'}>
                  {demoPhotoLabel ? (
                    <div className="text-[10px] font-semibold text-emerald-800">Foto hinzugefügt</div>
                  ) : null}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="intro-upload-pop relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setDemoImageZoom((z) => !z)}
                        className={`relative block w-full overflow-hidden ${isWalkthroughFilmMode ? 'h-14' : 'h-20'}`}
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
                      <span className="absolute left-1 top-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold text-white">
                        Demo
                      </span>
                    </div>
                  </div>
                  {demoFinalReady ? (
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                      Bereit zur Weiterleitung · Demo
                    </div>
                  ) : null}
                </div>
              ) : null}

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((p) => (
                    <div key={p.url} className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
                      <img src={p.url} alt="Foto Vorschau" className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((f) => f !== p.file))}
                        className="absolute right-1 top-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold text-white"
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
                  {du ? 'Max. 5 Fotos. In der Demo werden sie nur lokal angezeigt.' : 'Max. 5 Fotos. In der Demo werden sie nur lokal angezeigt.'}
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
                  Meldung senden
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  {du
                    ? `Deine Meldung wird an die Gemeindeverwaltung ${gemeinde} weitergeleitet.`
                    : `Ihre Meldung wird an die Gemeindeverwaltung ${gemeinde} weitergeleitet.`}
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Step: Bestätigung */}
      {step === 'bestaetigt' && (
        <div className="card-content py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'var(--gov-accent-light, #E6F7F1)' }}>
            <span className="text-[#00A86B] text-sm font-bold">OK</span>
          </div>
          <h3 className="text-lg font-bold text-[#1A2B45] mb-2">Meldung eingegangen!</h3>
          <p className="text-sm text-gray-500 mb-1">
            {du
              ? `Deine Meldung wurde an die Gemeinde ${gemeinde} weitergeleitet.`
              : `Ihre Meldung wurde an die Gemeinde ${gemeinde} weitergeleitet.`}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Bearbeitungszeit: in der Regel 3–5 Werktage
          </p>
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
