'use client';

import React, { useCallback, useId, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { planCivicCase, getExampleCases } from '@/lib/ai/claraCasePlanner';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';

export type ClaraWegweiserMode = 'private' | 'business' | 'unsure';

type Props = {
  du?: boolean;
  plz?: string;
  bundesland?: string;
  wohnort?: string;
  onPlanReady?: (plan: CivicCasePlanResult) => void;
};

export function ClaraWegweiser({ du = true, plz, bundesland, wohnort, onPlanReady }: Props) {
  const textareaId = useId();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<ClaraWegweiserMode>('private');
  const [plan, setPlan] = useState<CivicCasePlanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const examples = getExampleCases();

  const runAnalysis = useCallback(
    (inputText: string, inputMode: ClaraWegweiserMode) => {
      const trimmed = inputText.trim();
      if (!trimmed) return;
      setAnalyzing(true);
      requestAnimationFrame(() => {
        const result = planCivicCase(
          {
            text: trimmed,
            mode: inputMode,
            plz,
            bundesland,
            wohnort,
          },
          du,
        );
        setPlan(result);
        setAnalyzing(false);
        onPlanReady?.(result);
      });
    },
    [plz, bundesland, wohnort, du, onPlanReady],
  );

  const handleAnalyze = () => runAnalysis(text, mode);

  const handleExample = (exampleId: string) => {
    const ex = examples.find((e) => e.id === exampleId);
    if (!ex) return;
    setText(ex.text);
    setMode(ex.mode);
    runAnalysis(ex.text, ex.mode);
  };

  const handleClear = () => {
    setPlan(null);
    setText('');
  };

  return (
    <div className="clara-wegweiser">
      <div className="clara-wegweiser__hero rounded-2xl border border-slate-200/95 bg-gradient-to-b from-white via-sky-50/30 to-white p-3.5 shadow-[0_8px_32px_rgba(0,51,102,0.06)] sm:p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-[#003366] sm:text-base">
              {du ? 'Was ist deine Situation?' : 'Was ist Ihre Situation?'}
            </h2>
            <p className="text-[10.5px] leading-snug text-[#5f6b7a] sm:text-[11px]">
              {du
                ? 'Beschreibe kurz, worum es geht. Clara erstellt daraus einen verständlichen Behördenfahrplan — mit Themenübersicht, Unterlagencheck, Reihenfolge und offiziellen Antragswegen.'
                : 'Beschreiben Sie kurz, worum es geht. Clara erstellt daraus einen verständlichen Behördenfahrplan — mit Themenübersicht, Unterlagencheck, Reihenfolge und offiziellen Antragswegen.'}
            </p>
          </div>
        </div>

        <label htmlFor={textareaId} className="sr-only">
          {du ? 'Situation beschreiben' : 'Situation beschreiben'}
        </label>
        <textarea
          id={textareaId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={
            du
              ? 'Zum Beispiel: Ich ziehe mit zwei Kindern um und brauche Unterstützung. Oder: Ich möchte ein Gewerbe anmelden und weiß nicht, welche Stellen ich informieren muss.'
              : 'Zum Beispiel: Ich ziehe mit zwei Kindern um und brauche Unterstützung. Oder: Ich möchte ein Gewerbe anmelden und weiß nicht, welche Stellen ich informieren muss.'
          }
          className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-[#1A2B45] shadow-inner placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/60"
        />

        <fieldset className="mt-3">
          <legend className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {du ? 'Kontext' : 'Kontext'}
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {(
              [
                { id: 'private' as const, label: du ? 'Privat' : 'Privat' },
                { id: 'business' as const, label: du ? 'Geschäftlich' : 'Geschäftlich' },
                { id: 'unsure' as const, label: du ? 'Ich bin unsicher' : 'Ich bin unsicher' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={
                  'min-h-[36px] rounded-full border px-3 text-[11px] font-semibold transition ' +
                  (mode === m.id
                    ? 'border-[#003366] bg-[#003366] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')
                }
                aria-pressed={mode === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!text.trim() || analyzing}
            className="btn-primary t-button min-h-[44px] flex-1 rounded-xl text-[13px] font-bold disabled:opacity-50"
          >
            {analyzing ? (du ? 'Analysiere…' : 'Analysiere…') : du ? 'Fall analysieren' : 'Fall analysieren'}
          </button>
          <button
            type="button"
            onClick={() => handleExample('move-kids')}
            className="btn-ghost t-button min-h-[44px] flex-1 rounded-xl border border-slate-200 text-[12px] font-semibold"
          >
            {du ? 'Beispiel ansehen' : 'Beispiel ansehen'}
          </button>
        </div>
      </div>

      {/* Example cases */}
      {!plan ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {du ? 'Beispielfälle' : 'Beispielfälle'}
          </p>
          <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
            {examples.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => handleExample(ex.id)}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-2.5 py-2 text-left text-[10.5px] font-medium leading-snug text-[#003366] transition hover:border-sky-200 hover:bg-sky-50/40"
                >
                  {ex.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* In-place result — no scroll jump */}
      {plan ? (
        <div className="clara-wegweiser__result mt-4 rounded-2xl border border-sky-200/70 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h3 className="text-[14px] font-bold text-[#003366]">
              {du ? 'Dein Behördenfahrplan' : 'Ihr Behördenfahrplan'}
            </h3>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 text-[10px] font-semibold text-slate-500 underline-offset-2 hover:text-[#003366] hover:underline"
            >
              {du ? 'Neuer Fall' : 'Neuer Fall'}
            </button>
          </div>
          <CivicCasePlan plan={plan} du={du} />
        </div>
      ) : null}
    </div>
  );
}
