'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

const KATEGORIEN: { id: MeldungKategorie; label: string; code: string; hint: string }[] = [
  { id: 'strasse',     label: 'Straße / Weg',   code: 'S', hint: 'Schlaglöcher, beschädigter Gehweg, Beschilderung' },
  { id: 'spielplatz',  label: 'Spielplatz',     code: 'P', hint: 'Defekte Geräte, fehlende Absicherung' },
  { id: 'beleuchtung', label: 'Beleuchtung',    code: 'B', hint: 'Ausgefall. Straßenlaterne, dunkle Wege' },
  { id: 'gruenanlage', label: 'Grünanlage',     code: 'G', hint: 'Verwildert, umgestürzter Baum, Müll' },
  { id: 'sonstiges',   label: 'Sonstiges',      code: 'X', hint: 'Andere Meldungen an die Gemeinde' },
];

type Step = 'kategorie' | 'details' | 'bestaetigt';

function demoMeldungenForGemeinde(gemeinde: string) {
  return [
    { id: 1, titel: 'Schlagloch Hauptstraße Ecke Bahnhofstr.', ort: gemeinde, datum: '20.03.2026', status: 'in_bearbeitung' as const },
    { id: 2, titel: 'Defektes Spielgerät auf dem Spielplatz', ort: gemeinde, datum: '18.03.2026', status: 'offen' as const },
    { id: 3, titel: 'Straßenlaterne ausgefallen Waldstr.', ort: gemeinde, datum: '15.03.2026', status: 'erledigt' as const },
    { id: 4, titel: 'Überwucherter Gehweg am Gemeindezentrum', ort: gemeinde, datum: '10.03.2026', status: 'erledigt' as const },
  ];
}

export default function MeldungenSection() {
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
  };

  const selectedKat = KATEGORIEN.find((k) => k.id === kategorie);

  return (
    <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meldungen</h2>
            <div className="mt-0.5 text-[11px] text-neutral-500">
              {selectionLabelForSection('meldungen', state.activeLocation, state.residenceLocation)}
            </div>
          </div>
          <SectionLevelFilterIcon section="meldungen" />
      </div>
      {/* Header */}
      <div
        className="rounded-2xl text-white p-5 mb-4"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
      >
        <h2 className="text-base font-bold mb-1">Meldungen an {gemeinde}</h2>
        <p className="text-xs opacity-80">
          {du
            ? `Melde Probleme oder Anliegen direkt an die Gemeindeverwaltung ${gemeinde}.`
            : `Hinweise und Anliegen können direkt an die Gemeindeverwaltung ${gemeinde} gesendet werden.`}
        </p>
      </div>

      {/* Step: Kategorie wählen */}
      {step === 'kategorie' && (
        <div>
          <p className="text-sm font-semibold text-[#1A2B45] mb-3">
            {du ? 'Was möchtest du melden?' : 'Was möchten Sie melden?'}
          </p>
          <div className="space-y-2">
            {KATEGORIEN.map((k) => (
              <button
                key={k.id}
                onClick={() => { setKategorie(k.id); setStep('details'); }}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border text-left transition-all hover:border-[#0055A4] hover:shadow-sm group"
                style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
              >
                <span className="text-[#0055A4] flex-shrink-0 rounded-md border border-[#BFD9FF] bg-[#E8F0FB] px-2 py-1 text-[11px] font-bold">
                  {k.code}
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#1A2B45]">{k.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{k.hint}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Letzte Meldungen (Demo) */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Aktuelle Meldungen in {gemeinde}
            </p>
            {demoListe.map((m) => (
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
        <div>
          <button
            onClick={() => setStep('kategorie')}
            className="text-xs text-[#0055A4] mb-3 hover:underline flex items-center gap-1"
          >
            ← Kategorie ändern
          </button>

          <div className="bg-[#E8F0FB] rounded-xl p-3 mb-4 flex items-center gap-2">
            <span className="text-[#0055A4] rounded-md border border-[#BFD9FF] bg-white px-2 py-1 text-[11px] font-bold">{selectedKat.code}</span>
            <span className="text-sm font-semibold text-[#003366]">{selectedKat.label}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {du ? 'Deine Beschreibung *' : 'Ihre Beschreibung *'}
              </label>
              <textarea
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                rows={3}
                placeholder={
                  du
                    ? 'Beschreibe das Problem so genau wie möglich...'
                    : 'Bitte beschreiben Sie das Problem so genau wie möglich...'
                }
                className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0055A4]"
                style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Standort / Adresse (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder={`z. B. Hauptstraße 12, ${gemeinde}`}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0055A4]"
                  style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl text-[#0055A4] border transition-colors hover:bg-[#E8F0FB]"
                  style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
                  title="Aktuellen Standort verwenden"
                >
                  Ort
                </button>
              </div>
            </div>

            {/* Foto */}
            <div className="space-y-2">
              <label
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors cursor-pointer hover:border-[#0055A4] hover:text-[#0055A4]"
                style={{ borderColor: 'var(--gov-border, #D6E0EE)', color: photos.length > 0 ? '#0055A4' : undefined }}
              >
                {photos.length > 0
                  ? du
                    ? `${photos.length} Foto(s) ausgewählt`
                    : `${photos.length} Foto(s) ausgewählt`
                  : du
                    ? 'Fotos hinzufügen (optional)'
                    : 'Fotos hinzufügen (optional)'}
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
              <p className="text-[10px] text-gray-400">
                {du ? 'Max. 5 Fotos. In der Demo werden sie nur lokal angezeigt.' : 'Max. 5 Fotos. In der Demo werden sie nur lokal angezeigt.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSenden}
              disabled={!beschreibung.trim()}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
            >
              Meldung senden
            </button>

            <p className="text-[10px] text-gray-400 text-center">
              {du
                ? `Deine Meldung wird an die Gemeindeverwaltung ${gemeinde} weitergeleitet.`
                : `Ihre Meldung wird an die Gemeindeverwaltung ${gemeinde} weitergeleitet.`}
            </p>
          </div>
        </div>
      )}

      {/* Step: Bestätigung */}
      {step === 'bestaetigt' && (
        <div className="text-center py-8">
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
            className="px-6 py-3 rounded-2xl text-white font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
          >
            Neue Meldung erstellen
          </button>
        </div>
      )}
    </div>
  );
}
