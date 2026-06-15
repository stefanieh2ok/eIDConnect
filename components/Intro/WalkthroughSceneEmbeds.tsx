'use client';

import React, { useEffect, useState } from 'react';
import {
  Baby,
  CalendarDays,
  CheckCircle2,
  Gift,
  ListChecks,
  Mail,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Vote,
} from 'lucide-react';
import { WalkthroughCoachmark } from '@/components/Intro/WalkthroughCoachmark';

type EmbedProps = {
  du: boolean;
  onVisualDone?: () => void;
};

const WEGWEISER_OPTIONS_DU = [
  'Ich bekomme ein Baby',
  'Ich ziehe um',
  'Ich brauche ein Dokument',
  'Ich möchte etwas melden',
  'Ich möchte mich beteiligen',
] as const;

const BEHOERDENWEG_STEPS_DU = [
  'Geburt beim Standesamt anmelden',
  'Geburtsurkunde vorbereiten',
  'Elterngeld/Kindergeld-Information prüfen',
  'Unterlagen sammeln',
  'Frist im Kalender merken',
  'Rückfrage im Postfach verfolgen',
] as const;

const BEHOERDENWEG_STEPS_SIE = [
  'Geburt beim Standesamt anmelden',
  'Geburtsurkunde vorbereiten',
  'Elterngeld/Kindergeld-Information prüfen',
  'Unterlagen sammeln',
  'Frist im Kalender merken',
  'Rückfrage im Postfach verfolgen',
] as const;

const OEKOSYSTEM_AREAS = [
  { id: 'wegweiser', label: 'Wegweiser', Icon: ListChecks },
  { id: 'meldungen', label: 'Melden', Icon: MessageCircle },
  { id: 'abstimmen', label: 'Beteiligen', Icon: ThumbsUp },
  { id: 'wahlen', label: 'Wählen', Icon: Vote },
  { id: 'kalender', label: 'Kalender', Icon: CalendarDays },
  { id: 'postfach', label: 'Postfach', Icon: Mail },
  { id: 'praemien', label: 'Prämien', Icon: Gift },
  { id: 'clara', label: 'Clara', Icon: Sparkles },
  { id: 'trust', label: 'Trust', Icon: ShieldCheck },
] as const;

type NavHighlight = 'bottom' | 'header' | 'clara' | null;

/** Szene 1 — App-Navigation mit sequentiellen Highlights. */
export function WalkthroughIntroElevator({ du, onVisualDone }: EmbedProps) {
  const [highlight, setHighlight] = useState<NavHighlight>('bottom');

  useEffect(() => {
    const t1 = window.setTimeout(() => setHighlight('header'), 2600);
    const t2 = window.setTimeout(() => setHighlight('clara'), 5200);
    const t3 = window.setTimeout(() => {
      setHighlight(null);
      onVisualDone?.();
    }, 7600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onVisualDone]);

  const coachText =
    highlight === 'bottom'
      ? du
        ? 'Unten: deine Hauptwege'
        : 'Unten: Ihre Hauptwege'
      : highlight === 'header'
        ? du
          ? 'Oben: Postfach, Kalender, Prämien, Einstellungen'
          : 'Oben: Postfach, Kalender, Prämien, Einstellungen'
        : highlight === 'clara'
          ? 'Clara hilft jederzeit'
          : '';

  const bottomItems = [
    { label: 'Wegweiser', Icon: ListChecks, active: true },
    { label: 'Melden', Icon: MessageCircle, active: false },
    { label: 'Beteiligen', Icon: ThumbsUp, active: false },
    { label: 'Wählen', Icon: Vote, active: false },
  ] as const;

  const headerItems = [
    { label: 'Postfach', Icon: Mail },
    { label: 'Kalender', Icon: CalendarDays },
    { label: 'Prämien', Icon: Gift },
    { label: 'Einstellungen', Icon: Settings },
  ] as const;

  return (
    <div className="wt-scene-intro relative space-y-2 px-0.5 pb-1">
      {coachText ? <WalkthroughCoachmark text={coachText} position="top" pulse /> : null}
      <div className="rounded-xl border border-slate-200/90 bg-white p-2 shadow-sm">
        <div
          className={
            'mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2 transition ' +
            (highlight === 'header' ? 'wt-nav-zone--active' : '')
          }
        >
          <span className="text-[10px] font-bold tracking-tight text-[#003366]">HookAI Civic</span>
          <div className="flex items-center gap-1.5" aria-label="Header-Werkzeuge">
            {headerItems.map(({ label, Icon }) => (
              <span
                key={label}
                title={label}
                className={
                  'flex h-6 w-6 items-center justify-center rounded-md border transition ' +
                  (highlight === 'header'
                    ? 'wt-nav-icon--pulse border-sky-200 bg-sky-50 text-[#003366]'
                    : 'border-slate-100 bg-slate-50 text-slate-500')
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-[5.5rem] rounded-lg border border-dashed border-slate-100 bg-slate-50/60 px-2 py-3 text-center text-[9px] text-slate-400">
          {du ? 'Inhalt der gewählten Sektion' : 'Inhalt der gewählten Sektion'}
        </div>

        <div
          className={
            'mt-2 grid grid-cols-4 gap-1 border-t border-slate-100 pt-2 transition ' +
            (highlight === 'bottom' ? 'wt-nav-zone--active' : '')
          }
        >
          {bottomItems.map(({ label, Icon, active }) => (
            <div
              key={label}
              className={
                'flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[8px] font-semibold transition ' +
                (active
                  ? 'bg-emerald-50 text-[#003366] wt-nav-icon--pulse'
                  : highlight === 'bottom'
                    ? 'bg-sky-50/80 text-[#003366]'
                    : 'text-slate-500')
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div
          className={
            'mx-auto mt-2 flex max-w-[10rem] items-center justify-center gap-1 rounded-full border px-2 py-1 text-[8px] font-semibold transition ' +
            (highlight === 'clara'
              ? 'wt-nav-icon--pulse border-violet-200 bg-violet-50 text-violet-800'
              : 'border-violet-100 bg-violet-50/70 text-violet-700')
          }
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          <span>Clara</span>
        </div>
      </div>
    </div>
  );
}

/** Szene 2 — Wegweiser Hero mit Baby-Beispiel und Tap-Puls. */
export function WalkthroughWegweiserBaby({ du, onVisualDone }: EmbedProps) {
  const options = WEGWEISER_OPTIONS_DU;
  const selected = options[0];
  const [pulseBaby, setPulseBaby] = useState(true);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPulseBaby(false), 1400);
    const t2 = window.setTimeout(() => onVisualDone?.(), 2800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onVisualDone]);

  return (
    <div className="wt-scene-wegweiser relative space-y-2.5 px-0.5 pb-1">
      <WalkthroughCoachmark
        text={du ? 'Tippe auf eine Lebenslage.' : 'Tippen Sie auf eine Lebenslage.'}
        position="top"
        pulse={pulseBaby}
      />
      <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <h3 className="text-[13px] font-bold text-[#003366]">
          {du ? 'Was steht bei dir an?' : 'Was steht bei Ihnen an?'}
        </h3>
        <div className="mt-2 space-y-1.5">
          {options.map((opt) => {
            const isSelected = opt === selected;
            return (
              <div
                key={opt}
                className={
                  'relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition ' +
                  (isSelected
                    ? 'border-emerald-300 bg-emerald-50/80 text-[#003366] ' +
                      (pulseBaby ? 'wt-tap-target--pulse' : '')
                    : 'border-slate-200 bg-slate-50/50 text-slate-600')
                }
              >
                {isSelected ? <Baby className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden /> : null}
                <span>{opt}</span>
                {isSelected && pulseBaby ? (
                  <span className="wt-tap-ripple absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full" aria-hidden />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-lg border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 to-white px-2.5 py-2">
        <p className="text-[11px] font-bold text-[#003366]">
          {du ? 'Dein Behördenweg: Baby kommt' : 'Ihr Behördenweg: Baby kommt'}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-600">
          {du ? 'Aus einer Lebenslage wird ein klarer nächster Schritt.' : 'Aus einer Lebenslage wird ein klarer nächster Schritt.'}
        </p>
      </div>
    </div>
  );
}

/** Szene 3 — Freiwilliges Kurzprofil. */
export function WalkthroughProfilPreview({ du, onVisualDone }: EmbedProps) {
  useEffect(() => {
    onVisualDone?.();
  }, [onVisualDone]);

  const rows = [
    ['Wohnort', 'Kirkel'],
    ['Lebenslage', 'Baby kommt'],
    ['Erinnerung', 'Fristen im Kalender'],
    ['Kommunikationsweg', 'Postfach'],
  ];

  return (
    <div className="wt-scene-profil relative space-y-2 px-0.5 pb-1">
      <WalkthroughCoachmark
        text={du ? 'Freiwillig. Änderbar. Keine Bewertung.' : 'Freiwillig. Änderbar. Keine Bewertung.'}
        position="top"
      />
      <div className="flex flex-wrap gap-1.5">
        {['Freiwillige Angaben', 'Keine automatische Entscheidung', 'Jederzeit änderbar'].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <p className="text-[11px] font-bold text-[#003366]">Freiwilliges Kurzprofil</p>
        <dl className="mt-2 space-y-1.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2 text-[10.5px]">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-semibold text-[#1A2B45]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** Szene 4 — Behördenweg-Checkliste aus Baby-Beispiel. */
export function WalkthroughBehoerdenwegChecklist({ du, onVisualDone }: EmbedProps) {
  const steps = du ? BEHOERDENWEG_STEPS_DU : BEHOERDENWEG_STEPS_SIE;

  useEffect(() => {
    const id = window.setTimeout(() => onVisualDone?.(), 1800);
    return () => window.clearTimeout(id);
  }, [onVisualDone]);

  return (
    <div className="wt-scene-behoerdenweg relative space-y-2 px-0.5 pb-1">
      <WalkthroughCoachmark text="Checkliste öffnen" position="top" />
      <h3 className="text-[12px] font-bold text-[#003366]">
        {du ? 'Dein Behördenweg: Baby kommt' : 'Ihr Behördenweg: Baby kommt'}
      </h3>
      <ol className="space-y-1.5">
        {steps.map((step, i) => (
          <li
            key={step}
            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10.5px] leading-snug text-[#1A2B45]"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003366]/10 text-[9px] font-bold text-[#003366]">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-2.5 py-2 text-[9.5px] leading-snug text-amber-900/90">
        Beispielhafte Orientierung — keine Anspruchsprüfung.
      </p>
    </div>
  );
}

/** Szene 8 — Kalender Juni 2026 mit Frist-Highlight. */
export function WalkthroughKalenderJune({ du, onVisualDone }: EmbedProps) {
  useEffect(() => {
    const id = window.setTimeout(() => onVisualDone?.(), 1200);
    return () => window.clearTimeout(id);
  }, [onVisualDone]);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const startOffset = 0;

  return (
    <div className="wt-scene-kalender relative space-y-2 px-0.5 pb-1">
      <WalkthroughCoachmark text={du ? 'Frist merken' : 'Frist merken'} position="top" pulse />
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-[#003366]">Juni 2026</p>
          <span className="text-[9px] font-semibold text-slate-500">Kirkel</span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[8px] font-semibold text-slate-400">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-0.5">
          {Array.from({ length: startOffset }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const isFocus = day === 30;
            return (
              <span
                key={day}
                className={
                  'flex aspect-square items-center justify-center rounded-md text-[9px] font-semibold ' +
                  (isFocus
                    ? 'wt-tap-target--pulse bg-sky-100 text-[#003366] ring-2 ring-sky-300'
                    : day === 15 || day === 22
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600')
                }
              >
                {day}
              </span>
            );
          })}
        </div>
        <ul className="mt-2 space-y-0.5 text-[8.5px] text-slate-600">
          <li>● Frist aus Wegweiser</li>
          <li>● Beteiligung</li>
          <li>● Wahltermin</li>
          <li>● Rückfrage/Postfach</li>
        </ul>
      </div>
    </div>
  );
}

/** Szene 12 — Ökosystem-Zoom-out. */
export function WalkthroughOekosystemFinale({ du, onVisualDone }: EmbedProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i < OEKOSYSTEM_AREAS.length; i++) {
      timers.push(window.setTimeout(() => setActiveIdx(i), i * 420));
    }
    timers.push(
      window.setTimeout(() => {
        onVisualDone?.();
      }, OEKOSYSTEM_AREAS.length * 420 + 400),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onVisualDone]);

  return (
    <div className="wt-scene-oekosystem space-y-2.5 px-0.5 pb-1">
      <p className="text-center text-[10.5px] font-semibold text-[#003366]">
        {du
          ? 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.'
          : 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.'}
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3">
        {OEKOSYSTEM_AREAS.map(({ id, label, Icon }, idx) => (
          <div
            key={id}
            className={
              'flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-center shadow-sm transition ' +
              (idx === activeIdx
                ? 'wt-nav-icon--pulse border-sky-200 bg-sky-50'
                : 'border-slate-200 bg-white')
            }
          >
            <Icon className="h-4 w-4 text-[#003366]" aria-hidden />
            <span className="text-[8.5px] font-semibold leading-tight text-slate-700">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
        <span>{du ? 'Alles hängt zusammen — du behältst die Kontrolle.' : 'Alles hängt zusammen — Sie behalten die Kontrolle.'}</span>
      </div>
    </div>
  );
}
