'use client';

import React from 'react';
import { normalizePlz } from '@/data/plzDemoLookup';
import {
  BUNDESLAENDER_OPTIONS,
  ERWERBSSTATUS_OPTIONS,
  KINDER_ALTERSGRUPPEN,
  ROLLE_OPTIONS,
  SPRACHE_OPTIONS,
  WOHNSITUATION_OPTIONS,
} from '@/data/fuerMichProfileOptions';
import type { ChildAgeBand, FuerMichProfileState } from '@/types/fuerMich';

type FuerMichProfileCardProps = {
  du: boolean;
  profile: FuerMichProfileState;
  onChange: (patch: Partial<FuerMichProfileState>) => void;
  onSkip: () => void;
  /** Eingebettet (z. B. in einer einklappbaren Karte): ohne eigenen Rahmen/Titel/Skip. */
  embedded?: boolean;
};

const fieldClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800';
const labelClass = 'mb-1 block text-[11px] font-semibold text-neutral-700';

export default function FuerMichProfileCard({
  du,
  profile,
  onChange,
  onSkip,
  embedded = false,
}: FuerMichProfileCardProps) {
  const title = du
    ? 'Angaben, die die Orientierung verbessern können'
    : 'Angaben, die die Orientierung verbessern können';
  const body = du
    ? 'Diese Angaben sind freiwillig. Sie helfen nur dabei, die angezeigten Themen besser einzugrenzen. In dieser Demo werden keine echten Bürgerdaten benötigt.'
    : 'Diese Angaben sind freiwillig. Sie helfen nur dabei, die angezeigten Themen besser einzugrenzen. In dieser Demo werden keine echten Bürgerdaten benötigt.';

  const toggleChildAge = (band: ChildAgeBand) => {
    const next = profile.kinderAltersgruppen.includes(band)
      ? profile.kinderAltersgruppen.filter((b) => b !== band)
      : [...profile.kinderAltersgruppen, band];
    onChange({ kinderAltersgruppen: next });
  };

  return (
    <section
      className={embedded ? '' : 'mt-4 rounded-xl border border-neutral-200 bg-white p-2.5'}
      aria-labelledby={embedded ? undefined : 'fuer-mich-profile-heading'}
    >
      {embedded ? null : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 id="fuer-mich-profile-heading" className="text-sm font-semibold text-[#1A2B45]">
              {title}
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">{body}</p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            {du ? 'Überspringen' : 'Überspringen'}
          </button>
        </div>
      )}

      <div className={embedded ? 'space-y-3' : 'mt-3 space-y-3'}>
        <div>
          <label htmlFor="fuer-mich-bundesland" className={labelClass}>
            Bundesland
          </label>
          <select
            id="fuer-mich-bundesland"
            value={profile.bundesland}
            onChange={(e) => onChange({ bundesland: e.target.value })}
            className={fieldClass}
          >
            <option value="">{du ? 'Bitte wählen (optional)' : 'Bitte wählen (optional)'}</option>
            {BUNDESLAENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="fuer-mich-plz" className={labelClass}>
              PLZ
            </label>
            <input
              id="fuer-mich-plz"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={5}
              value={profile.plz}
              onChange={(e) => onChange({ plz: normalizePlz(e.target.value) })}
              placeholder={du ? 'z. B. 66459' : 'z. B. 66459'}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="fuer-mich-wohnort" className={labelClass}>
              {du ? 'Wohnort' : 'Wohnort'}
            </label>
            <input
              id="fuer-mich-wohnort"
              type="text"
              autoComplete="off"
              maxLength={80}
              value={profile.wohnort}
              onChange={(e) => onChange({ wohnort: e.target.value })}
              placeholder={du ? 'z. B. Kirkel' : 'z. B. Kirkel'}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="fuer-mich-sprache" className={labelClass}>
            Sprache
          </label>
          <select
            id="fuer-mich-sprache"
            value={profile.sprache}
            onChange={(e) => onChange({ sprache: e.target.value })}
            className={fieldClass}
          >
            <option value="">{du ? 'Bitte wählen (optional)' : 'Bitte wählen (optional)'}</option>
            {SPRACHE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={labelClass}>Kinder vorhanden?</legend>
          <div className="flex gap-2">
            {(['ja', 'nein'] as const).map((value) => {
              const active = profile.kinderVorhanden === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange({
                      kinderVorhanden: value,
                      kinderAltersgruppen: value === 'nein' ? [] : profile.kinderAltersgruppen,
                    })
                  }
                  className={`min-h-[40px] flex-1 rounded-lg border px-3 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'border-[#8EB1DE] bg-[#FBFDFF] text-[#1A2B45]'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {value === 'ja' ? 'Ja' : 'Nein'}
                </button>
              );
            })}
          </div>
        </fieldset>

        {profile.kinderVorhanden === 'ja' ? (
          <fieldset>
            <legend className={labelClass}>Altersgruppen der Kinder</legend>
            <div className="flex flex-wrap gap-2">
              {KINDER_ALTERSGRUPPEN.map((band) => {
                const active = profile.kinderAltersgruppen.includes(band.value);
                return (
                  <button
                    key={band.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleChildAge(band.value)}
                    className={`min-h-[36px] rounded-full border px-3 text-[10px] font-semibold transition-colors ${
                      active
                        ? 'border-[#8EB1DE] bg-[#ECFEFC] text-[#0F766E]'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div>
          <label htmlFor="fuer-mich-wohnsituation" className={labelClass}>
            Wohnsituation
          </label>
          <select
            id="fuer-mich-wohnsituation"
            value={profile.wohnsituation}
            onChange={(e) =>
              onChange({ wohnsituation: e.target.value as FuerMichProfileState['wohnsituation'] })
            }
            className={fieldClass}
          >
            <option value="">{du ? 'Bitte wählen (optional)' : 'Bitte wählen (optional)'}</option>
            {WOHNSITUATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fuer-mich-erwerbsstatus" className={labelClass}>
            Erwerbsstatus
          </label>
          <select
            id="fuer-mich-erwerbsstatus"
            value={profile.erwerbsstatus}
            onChange={(e) =>
              onChange({ erwerbsstatus: e.target.value as FuerMichProfileState['erwerbsstatus'] })
            }
            className={fieldClass}
          >
            <option value="">{du ? 'Bitte wählen (optional)' : 'Bitte wählen (optional)'}</option>
            {ERWERBSSTATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fuer-mich-rolle" className={labelClass}>
            Rolle
          </label>
          <select
            id="fuer-mich-rolle"
            value={profile.rolle}
            onChange={(e) => onChange({ rolle: e.target.value as FuerMichProfileState['rolle'] })}
            className={fieldClass}
          >
            <option value="">{du ? 'Bitte wählen (optional)' : 'Bitte wählen (optional)'}</option>
            {ROLLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
