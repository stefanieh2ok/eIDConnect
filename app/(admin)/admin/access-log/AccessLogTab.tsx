'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type LogRow = {
  id: string;
  accessed_at: string;
  event_type: string;
  page_path: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata?: { nda_version?: string; nda_document_hash?: string };
  demo_tokens?: { recipient_name: string; recipient_org: string | null } | null;
};

const FIVE_MIN_MS = 5 * 60 * 1000;

export default function AccessLogTab() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterToken, setFilterToken] = useState('');
  const [tokens, setTokens] = useState<{ id: string; recipient_name: string; recipient_org: string | null }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.from('demo_tokens').select('id, recipient_name, recipient_org').order('recipient_name').then(({ data }) => {
      setTokens((data as typeof tokens) ?? []);
    });
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let q = supabase
      .from('demo_access_logs')
      .select(`
        id,
        accessed_at,
        event_type,
        page_path,
        ip_address,
        user_agent,
        metadata,
        token_id,
        demo_tokens(recipient_name, recipient_org)
      `)
      .order('accessed_at', { ascending: false })
      .limit(500);

    if (filterToken) q = q.eq('token_id', filterToken);

    q.then(({ data, error }) => {
      if (!error) setRows((data as unknown as LogRow[]) ?? []);
      setLoading(false);
    });
  }, [supabase, filterToken]);

  const isLive = (accessedAt: string) => Date.now() - new Date(accessedAt).getTime() < FIVE_MIN_MS;

  if (loading) return <p className="text-gray-600">Lade…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm">Filter:</label>
        <select
          value={filterToken}
          onChange={(e) => setFilterToken(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Alle</option>
          {tokens.map((t) => (
            <option key={t.id} value={t.id}>
              {t.recipient_name} {t.recipient_org ? `(${t.recipient_org})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3">Zeit</th>
              <th className="text-left p-3">Person</th>
              <th className="text-left p-3">Organisation</th>
              <th className="text-left p-3">Event</th>
              <th className="text-left p-3">Seite</th>
              <th className="text-left p-3">IP</th>
              <th className="text-left p-3">Gerät</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const token = (r as { demo_tokens?: { recipient_name: string; recipient_org: string | null } | null }).demo_tokens;
              return (
                <tr key={r.id} className="border-b">
                  <td className="p-3 whitespace-nowrap">{new Date(r.accessed_at).toLocaleString('de-DE')}</td>
                  <td className="p-3">{token?.recipient_name ?? '–'}</td>
                  <td className="p-3">{token?.recipient_org ?? '–'}</td>
                  <td className="p-3">
                    {r.event_type}
                    {r.event_type === 'terms_accepted' && r.metadata?.nda_version && (
                      <span className="ml-1 text-gray-500" title={r.metadata?.nda_document_hash ? `Hash: ${r.metadata.nda_document_hash}` : undefined}>
                        (v{r.metadata.nda_version})
                      </span>
                    )}
                  </td>
                  <td className="p-3 max-w-[200px] truncate">{r.page_path ?? '–'}</td>
                  <td className="p-3">{r.ip_address ?? '–'}</td>
                  <td className="p-3 max-w-[180px] truncate">{r.user_agent ?? '–'}</td>
                  <td className="p-3">
                    {r.event_type === 'heartbeat' && isLive(r.accessed_at) && (
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Live" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
