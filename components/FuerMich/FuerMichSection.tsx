'use client';

import React, { useMemo, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { InfoHint } from '@/components/ui/InfoHint';
import { CivicTrustBar } from '@/components/shell/CivicTrustBar';
import { useApp } from '@/context/AppContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { InstitutionalReliefPanel } from '@/components/civic/InstitutionalReliefPanel';
import FuerMichLifeEventPicker from '@/components/FuerMich/FuerMichLifeEventPicker';
import FuerMichResults from '@/components/FuerMich/FuerMichResults';
import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';
import { resolveServicesForSituation } from '@/lib/kirkelServiceResolver';
import { CLARA_OFFICIAL_SOURCE_NOTICE } from '@/lib/claraCaseGuidance';
import type { LifeEventId } from '@/types/fuerMich';

export default function FuerMichSection() {
  const { state } = useApp();
  const du = state.anrede === 'du';
  const profile = state.buergerProfil;

  const [selectedLifeEvent, setSelectedLifeEvent] = useState<LifeEventId | null>(null);
  const [showFullResults, setShowFullResults] = useState(false);
  const [hasCasePlan, setHasCasePlan] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    if (!selectedLifeEvent) return null;
    const event = FUER_MICH_LIFE_EVENTS.find((e) => e.id === selectedLifeEvent);
    if (!event) return null;
    return du ? event.labelDu : event.labelSie;
  }, [selectedLifeEvent, du]);

  const resolved = useMemo(
    () =>
      resolveServicesForSituation({
        selectedLifeEvents: selectedLifeEvent ? [selectedLifeEvent] : [],
        profile: {
          bundesland: profile.bundesland,
          plz: profile.plz,
          wohnort: profile.wohnort,
        },
      }),
    [selectedLifeEvent, profile.bundesland, profile.plz, profile.wohnort],
  );

  const hasFullResults =
    showFullResults && selectedLifeEvent !== null && resolved.matchedServices.length > 0;

  const openProfile = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('app:open-settings', { detail: { scrollTo: 'settings-demo-stammdaten' } }),
    );
  };

  const handleSelectSituation = (id: LifeEventId) => {
    if (selectedLifeEvent === id) {
      setSelectedLifeEvent(null);
      setShowFullResults(false);
      return;
    }
    setSelectedLifeEvent(id);
    setShowFullResults(false);
  };

  const handleShowFullResults = () => {
    setShowFullResults(true);
  };

  const handleClearSelection = () => {
    setSelectedLifeEvent(null);
    setShowFullResults(false);
  };

  const handleChangeSituation = () => {
    handleClearSelection();
  };

  const headline = du ? 'Von der Lebenslage zum Behördenfahrplan.' : 'Von der Lebenslage zum Behördenfahrplan.';
  const subline = du
    ? 'Clara verbindet offizielle Verwaltungsinformationen mit deiner konkreten Situation — verständlich, strukturiert und mit sicherer Übergabe an die zuständige Stelle.'
    : 'Clara verbindet offizielle Verwaltungsinformationen mit Ihrer konkreten Situation — verständlich, strukturiert und mit sicherer Übergabe an die zuständige Stelle.';
  const positioning = du
    ? 'HookAI Civic baut keine zweite Verwaltung. Clara macht dich antragsfähig, bevor du offizielle digitale Verwaltungsdienste nutzt.'
    : 'HookAI Civic baut keine zweite Verwaltung. Clara macht Sie antragsfähig, bevor Sie offizielle digitale Verwaltungsdienste nutzt.';

  return (
    <div className="wegweiser-shell">
      <header className="wegweiser-launcher-header">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0055A4]">
          Clara Wegweiser · Vorbereitungscockpit
        </p>
        <h2 id="fuer-mich-life-event-heading" className="app-shell-page-heading mt-1">
          {headline}
        </h2>
        <p className="mt-1 text-[12px] leading-snug text-[#5f6b7a]">{subline}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#1A2B45]">{positioning}</p>
        <p className="mt-1.5 text-[10px] font-medium text-slate-600">{CLARA_OFFICIAL_SOURCE_NOTICE}</p>
        <div className="wegweiser-guidance mt-2">
          <span>{du ? 'Orientierung · Unterlagen · offizielle Übergabe' : 'Orientierung · Unterlagen · offizielle Übergabe'}</span>
          <InfoHint label="Hinweise zur Vorschau">
            <p>Demo-Daten (ManualDemo) · keine Live-PVOG-Anbindung · keine Anspruchsprüfung.</p>
            <p className="mt-1">Clara ersetzt keine Rechtsberatung und keine behördliche Entscheidung.</p>
          </InfoHint>
        </div>
      </header>

      <ClaraWegweiser
        du={du}
        plz={profile.plz}
        bundesland={profile.bundesland}
        wohnort={profile.wohnort}
        onPlanReady={() => setHasCasePlan(true)}
      />

      {!hasCasePlan ? (
        <>
          <section className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5" aria-labelledby="how-it-works">
            <h3 id="how-it-works" className="text-[12px] font-bold text-[#003366]">
              {du ? 'So funktioniert es' : 'So funktioniert es'}
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[10.5px] leading-relaxed text-[#5f6b7a]">
              <li>{du ? 'Situation in eigenen Worten beschreiben' : 'Situation in eigenen Worten beschreiben'}</li>
              <li>{du ? 'Clara erstellt einen Behördenfahrplan mit Themen und Unterlagen' : 'Clara erstellt einen Behördenfahrplan mit Themen und Unterlagen'}</li>
              <li>{du ? 'Offizielle Stellen und Antragswege öffnen — extern' : 'Offizielle Stellen und Antragswege öffnen — extern'}</li>
            </ol>
          </section>
          <div className="mt-3">
            <InstitutionalReliefPanel du={du} />
          </div>
        </>
      ) : null}

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {du ? 'Oder Lebenslage wählen' : 'Oder Lebenslage wählen'}
        </span>
        <div className="h-px flex-1 bg-slate-200" aria-hidden />
      </div>

      <FuerMichLifeEventPicker
        du={du}
        profile={profile}
        selectedId={selectedLifeEvent}
        resolved={selectedLifeEvent ? resolved : null}
        onSelect={handleSelectSituation}
        onClearSelection={handleClearSelection}
        onShowFullResults={handleShowFullResults}
      />

      <CivicTrustBar
        onOpenSecurity={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:open-settings'));
          }
        }}
      />

      {hasFullResults ? (
        <div ref={resultsRef} style={{ scrollMarginTop: '8px' }}>
          <FuerMichResults
            du={du}
            resolved={resolved}
            lifeEvents={selectedLifeEvent ? [selectedLifeEvent] : []}
            profile={profile}
            selectedLifeEventLabel={selectedLabel}
            onChangeSituation={handleChangeSituation}
          />
        </div>
      ) : null}

      {hasFullResults ? (
        <section className="wegweiser-profile-nudge" aria-labelledby="fuer-mich-profile-link-heading">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#0055A4]" aria-hidden />
            <h3 id="fuer-mich-profile-link-heading" className="text-[12px] font-bold text-[#003366]">
              Orientierung genauer machen
            </h3>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#5f6b7a]">
            Mit freiwilligen Angaben wie PLZ oder Bundesland können die Ergebnisse besser eingeordnet werden.
          </p>
          <button
            type="button"
            onClick={openProfile}
            className="mt-2 inline-flex items-center justify-center rounded-xl border border-[#003366] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#003366] transition-colors hover:bg-[#FBFDFF]"
          >
            Zum Profil
          </button>
        </section>
      ) : null}
    </div>
  );
}
