'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { THEME_NAMES } from '@/data/constants';
import { UserPreferences } from '@/types';

/** Simulierte eID-Adresse – reale Daten aus Kirkel, Saarpfalz-Kreis, Saarland */
const DEMO_EID_PLZ = '66459';
const DEMO_EID_CITY = 'Kirkel';
const DEMO_EID_LAND = 'Saarland';
const DEMO_EID_KREIS = 'Saarpfalz-Kreis';

const LoginScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const [addrPlz, setAddrPlz] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrError, setAddrError] = useState('');

  const handleStartEid = () => {
    setAddrError('');
    dispatch({ type: 'SET_CAN_VOTE', payload: true });
    dispatch({ type: 'SET_LOGIN_AUTH_METHOD', payload: 'eid' });
    dispatch({ type: 'SET_LOGIN_STEP', payload: 2 });
  };

  const handleAddressPreview = () => {
    setAddrError('');
    const plz = addrPlz.replace(/\D/g, '').slice(0, 5);
    const city = addrCity.trim();
    if (plz.length !== 5) {
      setAddrError('Bitte eine gültige fünfstellige PLZ eingeben.');
      return;
    }
    if (city.length < 2) {
      setAddrError('Bitte den Wohnort eingeben.');
      return;
    }
    dispatch({ type: 'APPLY_REGION_FROM_ADDRESS', payload: { plz, city } });
    dispatch({ type: 'SET_CAN_VOTE', payload: false });
    dispatch({ type: 'SET_LOGIN_AUTH_METHOD', payload: 'address' });
    dispatch({ type: 'SET_LOGIN_STEP', payload: 3 });
  };

  const handleEidSimulated = () => {
    dispatch({ type: 'APPLY_REGION_FROM_ADDRESS', payload: { plz: DEMO_EID_PLZ, city: DEMO_EID_CITY } });
    dispatch({ type: 'SET_CAN_VOTE', payload: true });
    dispatch({ type: 'SET_LOGIN_STEP', payload: 3 });
  };

  const handleAnredeSelect = (anrede: 'sie' | 'du') => {
    dispatch({ type: 'SET_ANREDE', payload: anrede });
    dispatch({ type: 'SET_LOGIN_STEP', payload: 4 });
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { [key]: value } });
  };

  const handleLogin = () => {
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      <div
        className="flex-shrink-0 px-5 py-6 text-center text-white"
        style={{ background: 'var(--eu,#003399)' }}
      >
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {process.env.NEXT_PUBLIC_APP_NAME || 'eIDConnect'}
        </h1>
        <p className="mt-1 text-sm text-white/90">
          Demonstrationsumgebung
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
        {/* Schritt 1: Zugang wählen */}
        {state.loginStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Zugang w&auml;hlen</h2>
              <p className="mt-2 text-sm text-slate-600">
                W&auml;hlen Sie, wie Sie die Demo nutzen m&ouml;chten. Bei der eID-Variante werden
                automatisch Meldedaten simuliert und die relevanten Wahlen f&uuml;r Ihren Wohnort angezeigt.
              </p>
            </div>

            {/* Option 1: eID */}
            <button
              type="button"
              onClick={handleStartEid}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-[var(--eu,#003399)] hover:shadow-md"
            >
              <span className="text-base font-semibold text-slate-900">
                Mit eID anmelden (Online-Ausweis / PersonaPP)
              </span>
              <span className="mt-1 block text-sm text-slate-600">
                Simulierter eID-Ablauf. Meldedaten werden automatisch gesetzt
                ({DEMO_EID_PLZ} {DEMO_EID_CITY}, {DEMO_EID_LAND}).{' '}
                <strong>Abstimmen und Wahlen m&ouml;glich.</strong>
              </span>
            </button>

            {/* Option 2: Adresse (Vorschau) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Ohne eID &ndash; nur Adresse eingeben (Vorschau)
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Geben Sie PLZ und Wohnort ein, um Inhalte und Wahlen f&uuml;r Ihre Region zu sehen.
                Abstimmungen sind in diesem Modus deaktiviert.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="PLZ"
                  value={addrPlz}
                  onChange={(e) => setAddrPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2.5 text-base"
                />
                <input
                  type="text"
                  placeholder="Wohnort"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="min-w-[8rem] flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base"
                />
              </div>
              {addrError ? <p className="mt-2 text-sm text-red-600">{addrError}</p> : null}
              <button
                type="button"
                onClick={handleAddressPreview}
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Weiter ohne eID (ohne Abstimmung)
              </button>
            </div>
          </div>
        )}

        {/* Schritt 2: eID / PersonaPP – Simulation mit realen Kirkel-Daten */}
        {state.loginStep === 2 && state.loginAuthMethod === 'eid' && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-slate-900">eID / PersonaPP (simuliert)</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              In der echten Anwendung w&uuml;rden Sie jetzt die <strong>AusweisApp2</strong> oder die
              Test-App <strong>PersonaPP</strong> &ouml;ffnen und Ihre Online-Ausweisfunktion nutzen.
              Anschlie&szlig;end &uuml;bermittelt der eID-Provider die gepr&uuml;ften Meldedaten.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Simulierte eID-Daten&uuml;bermittlung
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">PLZ</dt>
                  <dd className="font-semibold text-slate-900">{DEMO_EID_PLZ}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Wohnort</dt>
                  <dd className="font-semibold text-slate-900">{DEMO_EID_CITY}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Bundesland</dt>
                  <dd className="font-semibold text-slate-900">{DEMO_EID_LAND}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Kreis</dt>
                  <dd className="font-semibold text-slate-900">{DEMO_EID_KREIS}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Gemeinde</dt>
                  <dd className="font-semibold text-slate-900">{DEMO_EID_CITY}</dd>
                </div>
              </dl>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">
              Aus diesen Daten werden automatisch die zust&auml;ndigen Verwaltungsebenen
              (Bund, Land, Kreis, Kommune) und die relevanten Wahlen und Abstimmungen
              f&uuml;r Ihren Wohnort abgeleitet. Abstimmen ist mit eID-Anmeldung aktiviert.
            </p>

            <button
              type="button"
              onClick={handleEidSimulated}
              className="w-full rounded-xl py-4 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--gov-btn, #0066cc)' }}
            >
              Identit&auml;t best&auml;tigen und weiter
            </button>
          </div>
        )}

        {/* Schritt 3: Anrede */}
        {state.loginStep === 3 && (
          <div>
            <h2 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">
              Wie m&ouml;chten Sie angesprochen werden?
            </h2>
            {!state.canVote && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <strong>Hinweis:</strong> Sie nutzen die Vorschau ohne Abstimmung. Inhalte und Clara sind
                verf&uuml;gbar; Stimmabgaben sind deaktiviert.
              </p>
            )}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleAnredeSelect('sie')}
                className="rounded-xl border-2 border-slate-200 p-5 transition-all hover:border-[var(--eu,#003399)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eu,#003399)]"
              >
                <div className="mb-1 text-xl font-semibold">Sie</div>
                <div className="text-sm text-slate-600">F&ouml;rmlich</div>
              </button>
              <button
                type="button"
                onClick={() => handleAnredeSelect('du')}
                className="rounded-xl border-2 border-slate-200 p-5 transition-all hover:border-[var(--eu,#003399)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eu,#003399)]"
              >
                <div className="mb-1 text-xl font-semibold">Du</div>
                <div className="text-sm text-slate-600">Pers&ouml;nlich</div>
              </button>
            </div>
          </div>
        )}

        {/* Schritt 4: Politik-Barometer */}
        {state.loginStep === 4 && (
          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              {state.anrede === 'du' ? 'Dein' : 'Ihr'} Politik-Barometer
            </h2>
            <p className="mb-3 text-sm text-slate-600">
              {state.anrede === 'du'
                ? 'Diese Schieberegler helfen Clara, deine Analyse relevanter zu machen.'
                : 'Diese Schieberegler helfen Clara, Ihre Analyse relevanter zu machen.'}
            </p>

            <label className="mb-6 flex select-none items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={state.consentClaraPersonalization}
                onChange={(e) =>
                  dispatch({ type: 'SET_CONSENT_CLARA_PERSONALIZATION', payload: e.target.checked })
                }
                className="mt-1 accent-[var(--eu,#003399)]"
              />
              <span className="leading-snug">
                {state.anrede === 'du'
                  ? 'Einwilligung: Clara darf deine Politik-Schwerpunkte f\u00fcr personalisierte Analysen verwenden.'
                  : 'Einwilligung: Clara darf Ihre Politik-Schwerpunkte f\u00fcr personalisierte Analysen verwenden.'}
              </span>
            </label>

            <div className="mb-6 space-y-5">
              {Object.entries(THEME_NAMES).map(([key, name]) => (
                <div key={key}>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-slate-700">{name}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--eu,#003399)' }}>
                      {state.preferences[key as keyof UserPreferences]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.preferences[key as keyof UserPreferences]}
                    onChange={(e) =>
                      handlePreferenceChange(key as keyof UserPreferences, parseInt(e.target.value, 10))
                    }
                    className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-xl py-4 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--gov-btn, #0066cc)' }}
            >
              Zur Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
