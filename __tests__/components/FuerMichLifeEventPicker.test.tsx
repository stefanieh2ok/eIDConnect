'use client';



import React, { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import FuerMichLifeEventPicker from '@/components/FuerMich/FuerMichLifeEventPicker';

import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';

import { FUER_MICH_LIFE_EVENT_CLUSTERS } from '@/data/fuerMichLifeEventClusters';

import type { ResolverResult } from '@/lib/kirkelServiceResolver';

import type { LifeEventId } from '@/types/fuerMich';
import { EMPTY_FUER_MICH_PROFILE } from '@/types/fuerMich';



const firstEvent = FUER_MICH_LIFE_EVENTS[0];

const secondEvent = FUER_MICH_LIFE_EVENTS.find((e) => e.id === 'education')!;



const mockResolved: ResolverResult = {

  matchedServices: [

    {

      id: 'demo-1',

      leistung_key: 'demo_key',

      titel: 'Demo-Leistung',

      lebenslagen: [],

      region: 'Kirkel',

      bundesland: 'Saarland',

      kommune: 'Kirkel',

      zustaendige_stelle: 'Demo-Stelle',

      zustaendigkeitsebene: 'kommune',

      kurzbeschreibung: 'Demo',

      moegliche_nachweise: [],

      source_label: 'Demo',

      source_status: 'demo',

      source_url: null,

      online_service_url: null,

      form_url: null,

      contact_url: null,

      fallback_message: 'Demo',

      last_checked_at: null,

      demo_notice: 'Demo',

    },

  ],

  nextSteps: [],

  furtherServices: [],

  evidenceChips: ['Nachweis A'],

  offices: ['Stelle A'],

  missingLinks: [],

  fallbackMessages: [],

};



function openClusterFor(eventId: LifeEventId) {

  const cluster = FUER_MICH_LIFE_EVENT_CLUSTERS.find((c) => c.eventIds.includes(eventId));

  if (!cluster) return;

  const btn = screen.getByRole('button', { name: new RegExp(`^${cluster.title}\\b`) });
  if (btn.getAttribute('aria-expanded') !== 'true') {
    fireEvent.click(btn);
  }

}



function PickerHarness() {

  const [selectedId, setSelectedId] = useState<LifeEventId | null>(null);



  const handleSelect = (id: LifeEventId) => {

    if (selectedId === id) {

      setSelectedId(null);

      return;

    }

    setSelectedId(id);

  };



  return (

    <FuerMichLifeEventPicker

      du

      profile={EMPTY_FUER_MICH_PROFILE}

      selectedId={selectedId}

      resolved={selectedId ? mockResolved : null}

      onSelect={handleSelect}

      onClearSelection={() => setSelectedId(null)}

      onShowFullResults={() => {}}

    />

  );

}



describe('FuerMichLifeEventPicker – Auswahl', () => {

  it('markiert eine Situation und entfernt sie beim erneuten Klick', () => {

    render(<PickerHarness />);

    openClusterFor(firstEvent.id);

    const option = screen.getByRole('button', { name: firstEvent.labelDu });



    fireEvent.click(option);

    expect(option).toHaveAttribute('aria-pressed', 'true');



    fireEvent.click(option);

    expect(option).toHaveAttribute('aria-pressed', 'false');

  });



  it('ersetzt die Auswahl bei einer anderen Situation', () => {

    render(<PickerHarness />);

    openClusterFor(firstEvent.id);

    const firstBtn = screen.getByRole('button', { name: firstEvent.labelDu });

    openClusterFor(secondEvent.id);

    const secondBtn = screen.getByRole('button', { name: secondEvent.labelDu });



    fireEvent.click(firstBtn);

    fireEvent.click(secondBtn);



    expect(firstBtn).toHaveAttribute('aria-pressed', 'false');

    expect(secondBtn).toHaveAttribute('aria-pressed', 'true');

  });



  it('leert die Auswahl über „Andere Situation wählen“', () => {

    render(<PickerHarness />);

    openClusterFor(firstEvent.id);

    const option = screen.getByRole('button', { name: firstEvent.labelDu });

    fireEvent.click(option);

    fireEvent.click(screen.getByRole('button', { name: 'Andere Situation wählen' }));

    expect(option).toHaveAttribute('aria-pressed', 'false');

  });

});

