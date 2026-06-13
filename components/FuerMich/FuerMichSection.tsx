'use client';



import React, { useMemo, useRef, useState } from 'react';

import { SlidersHorizontal } from 'lucide-react';

import { InfoHint } from '@/components/ui/InfoHint';
import { CivicTrustBar } from '@/components/shell/CivicTrustBar';
import { useApp } from '@/context/AppContext';

import FuerMichLifeEventPicker from '@/components/FuerMich/FuerMichLifeEventPicker';

import FuerMichResults from '@/components/FuerMich/FuerMichResults';

import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';

import { resolveServicesForSituation } from '@/lib/kirkelServiceResolver';

import type { LifeEventId } from '@/types/fuerMich';



export default function FuerMichSection() {

  const { state } = useApp();

  const du = state.anrede === 'du';

  const profile = state.buergerProfil;



  const [selectedLifeEvent, setSelectedLifeEvent] = useState<LifeEventId | null>(null);

  const [showFullResults, setShowFullResults] = useState(false);

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

    requestAnimationFrame(() => {

      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    });

  };



  const handleClearSelection = () => {

    setSelectedLifeEvent(null);

    setShowFullResults(false);

  };



  const handleChangeSituation = () => {

    handleClearSelection();

  };



  const headline = du ? 'Was steht gerade an?' : 'Was steht gerade an?';

  const subline = du

    ? 'Wähle eine Situation — HookAI Civic baut daraus deinen Behördenweg.'

    : 'Wählen Sie eine Situation — HookAI Civic baut daraus Ihren Behördenweg.';



  return (

    <div className="wegweiser-shell">

      <header className="wegweiser-launcher-header">

        <h2 id="fuer-mich-life-event-heading" className="text-[18px] font-bold tracking-tight text-[#003366]">

          {headline}

        </h2>

        <p className="mt-1 text-[12px] leading-snug text-[#5f6b7a]">{subline}</p>

        <div className="wegweiser-guidance">
          <span>1. Profil in Einstellungen anlegen · 2. Wegweiser auswählen</span>
          <InfoHint label="Hinweise zur Vorschau">
            <p>Kirkel/Saarland · Vorschau-Daten · keine Anspruchsprüfung.</p>
            <p className="mt-1">Verbindlich entscheidet die zuständige Stelle.</p>
          </InfoHint>
        </div>

      </header>



      <FuerMichLifeEventPicker

        du={du}

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

