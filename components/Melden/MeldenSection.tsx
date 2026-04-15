'use client';

import React, { useState, useCallback } from 'react';
import {
  AlertCircle,
  Send,
  Target,
  Award,
  Zap,
  Users,
  Info,
  MapPin,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const STORAGE_KEY = 'eidconnect_mangel_reports';

type Report = {
  id: string;
  category: string;
  description: string;
  createdAt: string;
  status: string;
  municipality: string;
};

function loadReports(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Report[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveReports(list: Report[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

const CATEGORIES = [
  {
    id: 'weg',
    label: 'Straße / Weg',
    hint: 'Schlaglöcher, Gehweg, Beschilderung',
    Icon: Target,
  },
  {
    id: 'gruen',
    label: 'Spielplatz / Grünanlage',
    hint: 'Defekte Geräte, Pflege, Sicherheit',
    Icon: Award,
  },
  {
    id: 'licht',
    label: 'Beleuchtung',
    hint: 'Ausfall, dunkle Wege, Lampen',
    Icon: Zap,
  },
  {
    id: 'muell',
    label: 'Müll / Sauberkeit',
    hint: 'Illegaler Müll, volle Behälter',
    Icon: Users,
  },
  {
    id: 'sonst',
    label: 'Sonstiges',
    hint: 'Weitere Anliegen an die Kommune',
    Icon: Info,
  },
];

/**
 * Mängelmeldung – nur sinnvoll auf Kommunalebene (Demo: lokale Speicherung).
 */
const MeldenSection: React.FC = () => {
  const { state } = useApp();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [mine, setMine] = useState<Report[]>([]);
  const municipality = state.regionResolution?.kommuneLabel || (state.activeLocation === 'kirkel' ? 'Kirkel' : null);
  const canSubmitInScope = state.regionResolution ? state.activeAdministrativeScope === 'kommune' : state.activeLocation === 'kirkel';
  const canSubmit = canSubmitInScope && !!municipality;
  const descriptionTrimmed = description.trim();
  const chars = descriptionTrimmed.length;
  const minChars = 8;
  const maxChars = 500;
  const hasValidDescription = chars >= minChars && chars <= maxChars;
  const canSendNow = canSubmit && !!category && hasValidDescription;

  React.useEffect(() => {
    setMine(loadReports());
  }, [sent]);

  const submit = useCallback(() => {
    if (!canSendNow || !municipality) return;
    const r: Report = {
      id: `r-${Date.now()}`,
      category,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      status: 'Eingegangen (Demo)',
      municipality,
    };
    const next = [r, ...loadReports()];
    saveReports(next);
    setMine(next);
    setDescription('');
    setCategory('');
    setSent(true);
    window.setTimeout(() => setSent(false), 4000);
  }, [canSendNow, category, description, municipality]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <AlertCircle className="text-amber-600" size={22} />
        <h2 className="text-lg font-semibold text-gray-900">Mängel melden</h2>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-900 border border-blue-200">
          <MapPin size={12} />
          Zielkommune: {municipality ?? 'nicht gesetzt'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 border border-emerald-200">
          <CheckCircle size={12} />
          Lokal gespeichert (Demo)
        </span>
      </div>
      <p className="text-[11px] text-gray-600 mb-4">
        Meldungen werden automatisch der aktuellen Kommune zugeordnet. In dieser Demo erfolgt keine Server-Übertragung.
      </p>
      {!canSubmit && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Meldungen sind nur auf Kommune-Ebene aktiv. Bitte Kommune auswählen.
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Kategorie</label>
          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const selected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  aria-pressed={selected}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg ${selected ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-600'}`}>
                      <c.Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">{c.label}</span>
                      <span className="block text-xs text-gray-600">{c.hint}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Ort, Problem, seit wann …"
            maxLength={maxChars}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[100px]"
          />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className={hasValidDescription || chars === 0 ? 'text-gray-500' : 'text-amber-700'}>
              {chars === 0
                ? 'Bitte Problem kurz und konkret beschreiben.'
                : chars < minChars
                  ? `Noch ${minChars - chars} Zeichen bis Mindestlänge`
                  : 'Beschreibung ausreichend'}
            </span>
            <span className="text-gray-400">
              {chars}/{maxChars}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSendNow}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-800"
        >
          <Send size={18} />
          Meldung absenden
        </button>
        {sent && (
          <p className="text-sm text-green-700 font-medium text-center">
            Meldung gespeichert (Demo) und automatisch {municipality} zugeordnet.
          </p>
        )}
      </div>

      {mine.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Meine Meldungen</h3>
          <ul className="space-y-2">
            {mine.slice(0, 8).map((r) => (
              <li key={r.id} className="bg-gray-50 rounded-xl p-3 text-xs border border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-gray-800">
                    {CATEGORIES.find((c) => c.id === r.category)?.label ?? r.category}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                    <Clock size={10} />
                    {r.status}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500">Kommune: {r.municipality || 'nicht gesetzt (älterer Demo-Eintrag)'}</div>
                <div className="text-gray-600 mt-1">{r.description}</div>
                <div className="text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleString('de-DE')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MeldenSection;
