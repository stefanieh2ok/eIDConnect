'use client';

import React, { useEffect } from 'react';
import {
  Baby,
  CalendarDays,
  CheckCircle2,
  Gift,
  ListChecks,
  Mail,
  MessageCircle,
  Sparkles,
  ThumbsUp,
  Vote,
} from 'lucide-react';

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
  'Informationen zu Elterngeld und Kindergeld prüfen',
  'Unterlagen sammeln',
  'Frist im Kalender merken',
  'Rückfragen im Postfach verfolgen',
] as const;

const BEHOERDENWEG_STEPS_SIE = [
  'Geburt beim Standesamt anmelden',
  'Geburtsurkunde vorbereiten',
  'Informationen zu Elterngeld und Kindergeld prüfen',
  'Unterlagen sammeln',
  'Frist im Kalender merken',
  'Rückfragen im Postfach verfolgen',
] as const;

const OEKOSYSTEM_AREAS = [
  { id: 'wegweiser', label: 'Wegweiser', Icon: ListChecks },
  { id: 'meldungen', label: 'Meldungen', Icon: MessageCircle },
  { id: 'abstimmen', label: 'Abstimmungen', Icon: ThumbsUp },
  { id: 'wahlen', label: 'Wahlen', Icon: Vote },
  { id: 'kalender', label: 'Kalender', Icon: CalendarDays },
  { id: 'postfach', label: 'Postfach', Icon: Mail },
  { id: 'praemien', label: 'Prämien', Icon: Gift },
  { id: 'clara', label: 'Clara', Icon: Sparkles },
] as const;

/** Szene 1 — Elevator Pitch mit App-Vorschau. */
export function WalkthroughIntroElevator({ du, onVisualDone }: EmbedProps) {
  useEffect(() => {
    const id = window.setTimeout(() => onVisualDone?.(), 1200);
    return () => window.clearTimeout(id);
  }, [onVisualDone]);

  return (
    <div className="wt-scene-intro space-y-3 px-1 pb-2">
      <p className="rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2 text-center text-[11px] font-semibold leading-snug text-[#003366]">
        {du
          ? 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.'
          : 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.'}
      </p>
      <div className="rounded-xl border border-slate-200/90 bg-white p-2 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="h-5 w-24 rounded bg-[#003366]/10" aria-hidden />
          <div className="flex gap-1" aria-hidden>
            <span className="h-4 w-4 rounded bg-slate-100" />
            <span className="h-4 w-4 rounded bg-slate-100" />
            <span className="h-4 w-4 rounded bg-slate-100" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 border-t border-slate-100 pt-2">
          {[
            { label: 'Wegweiser', active: true },
            { label: 'Melden', active: false },
            { label: 'Beteiligen', active: false },
            { label: 'Wahlen', active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={
                'flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[8px] font-semibold ' +
                (item.active ? 'bg-emerald-50 text-[#003366]' : 'text-slate-500')
              }
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Szene 2 — Wegweiser Hero mit Baby-Beispiel. */
export function WalkthroughWegweiserBaby({ du, onVisualDone }: EmbedProps) {
  const options = WEGWEISER_OPTIONS_DU;
  const selected = options[0];

  useEffect(() => {
    const id = window.setTimeout(() => onVisualDone?.(), 2200);
    return () => window.clearTimeout(id);
  }, [onVisualDone]);

  return (
    <div className="wt-scene-wegweiser space-y-2.5 px-0.5 pb-1">
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
                  'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-medium ' +
                  (isSelected
                    ? 'border-emerald-300 bg-emerald-50/80 text-[#003366]'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600')
                }
              >
                {isSelected ? <Baby className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden /> : null}
                <span>{opt}</span>
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

  const rows = du
    ? [
        ['Wohnort', 'Kirkel'],
        ['Lebenslage', 'Baby kommt'],
        ['Haushalt', 'Familie'],
        ['Erinnerung', 'Fristen im Kalender'],
        ['Kommunikationsweg', 'Postfach'],
      ]
    : [
        ['Wohnort', 'Kirkel'],
        ['Lebenslage', 'Baby kommt'],
        ['Haushalt', 'Familie'],
        ['Erinnerung', 'Fristen im Kalender'],
        ['Kommunikationsweg', 'Postfach'],
      ];

  return (
    <div className="wt-scene-profil space-y-2 px-0.5 pb-1">
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
        <p className="text-[11px] font-bold text-[#003366]">
          {du ? 'Freiwilliges Kurzprofil' : 'Freiwilliges Kurzprofil'}
        </p>
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
    <div className="wt-scene-behoerdenweg space-y-2 px-0.5 pb-1">
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
        Beispielhafte Orientierung. Angaben können je nach Kommune und Lebenslage abweichen.
      </p>
    </div>
  );
}

/** Szene 11 — Ökosystem-Zoom-out. */
export function WalkthroughOekosystemFinale({ du, onVisualDone }: EmbedProps) {
  useEffect(() => {
    const id = window.setTimeout(() => onVisualDone?.(), 1400);
    return () => window.clearTimeout(id);
  }, [onVisualDone]);

  return (
    <div className="wt-scene-oekosystem space-y-2.5 px-0.5 pb-1">
      <p className="text-center text-[10.5px] font-semibold text-[#003366]">
        {du
          ? 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.'
          : 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.'}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {OEKOSYSTEM_AREAS.map(({ id, label, Icon }) => (
          <div
            key={id}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-2 text-center shadow-sm"
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
