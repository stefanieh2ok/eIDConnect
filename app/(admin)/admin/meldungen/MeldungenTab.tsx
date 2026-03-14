'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Meldung = {
  id: string;
  title: string;
  category: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  ort: string | null;
  description: string | null;
};

const STATUS_OPTIONS = ['Neu', 'In Bearbeitung', 'Erledigt'];

export default function MeldungenTab() {
  const [rows, setRows] = useState<Meldung[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Meldung | null>(null);
  const [editing, setEditing] = useState<Meldung | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('meldungen')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setRows((data as Meldung[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  async function updateStatus(id: string, status: string) {
    if (!supabase) return;
    await supabase.from('meldungen').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (detail?.id === id) setDetail({ ...detail, status });
    setEditing(null);
  }

  async function deleteMeldung(id: string) {
    if (!supabase || !confirm('Meldung wirklich löschen?')) return;
    await supabase.from('meldungen').delete().eq('id', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (detail?.id === id) setDetail(null);
  }

  if (loading) return <p className="text-gray-600">Lade…</p>;

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3">Titel</th>
              <th className="text-left p-3">Kategorie</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Erstellt</th>
              <th className="text-left p-3">Ort</th>
              <th className="text-left p-3">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.category ?? '–'}</td>
                <td className="p-3">
                  {editing?.id === r.id ? (
                    <select
                      value={editing.status}
                      onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                      onBlur={() => updateStatus(r.id, editing.status)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditing(r)}
                      className="text-blue-600 hover:underline"
                    >
                      {r.status}
                    </button>
                  )}
                </td>
                <td className="p-3">{new Date(r.created_at).toLocaleString('de-DE')}</td>
                <td className="p-3">{r.ort ?? '–'}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => setDetail(detail?.id === r.id ? null : r)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => deleteMeldung(r.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 max-w-lg">
          <h3 className="font-semibold mb-2">{detail.title}</h3>
          <p className="text-sm text-gray-600"><strong>Status:</strong> {detail.status}</p>
          <p className="text-sm text-gray-600"><strong>Kategorie:</strong> {detail.category ?? '–'}</p>
          <p className="text-sm text-gray-600"><strong>Ort:</strong> {detail.ort ?? '–'}</p>
          <p className="text-sm text-gray-600 mt-2"><strong>Beschreibung:</strong></p>
          <p className="text-sm mt-1">{detail.description ?? '–'}</p>
          <button
            onClick={() => setDetail(null)}
            className="mt-3 text-gray-600 hover:underline text-sm"
          >
            Schließen
          </button>
        </div>
      )}
    </div>
  );
}
