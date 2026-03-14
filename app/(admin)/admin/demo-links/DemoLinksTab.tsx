'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type DemoToken = {
  id: string;
  token: string;
  recipient_name: string;
  recipient_org: string | null;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  first_accessed_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30) || 'demo';
}

export default function DemoLinksTab() {
  const [tokens, setTokens] = useState<DemoToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [recipientOrg, setRecipientOrg] = useState('');
  const [expiresDays, setExpiresDays] = useState(30);
  const [creating, setCreating] = useState(false);
  const [copyId, setCopyId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [emailSnippetCopied, setEmailSnippetCopied] = useState(false);

  const supabase = createClient();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const ndaUrl = `${baseUrl}/legal/demo-nda`;

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('demo_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setTokens((data as DemoToken[]) ?? []);
        setLoading(false);
      });
  }, [supabase]);

  async function createToken() {
    if (!supabase || !recipientName.trim()) return;
    setCreating(true);
    const exp = new Date();
    exp.setDate(exp.getDate() + expiresDays);
    const token = `${slug(recipientOrg || recipientName)}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from('demo_tokens')
      .insert({
        token,
        recipient_name: recipientName.trim(),
        recipient_org: recipientOrg.trim() || null,
        expires_at: exp.toISOString(),
        is_active: true,
      })
      .select()
      .single();
    setCreating(false);
    if (!error && data) {
      setTokens((prev) => [data as DemoToken, ...prev]);
      setRecipientName('');
      setRecipientOrg('');
    }
  }

  function getStatus(t: DemoToken): string {
    const now = new Date();
    const exp = new Date(t.expires_at);
    if (!t.is_active) return 'deaktiviert';
    if (exp <= now) return 'abgelaufen';
    if (t.access_count === 0) return 'aktiv & ungeöffnet';
    return 'aktiv & geöffnet';
  }

  function copyLink(t: DemoToken) {
    const url = `${baseUrl}/demo?token=${encodeURIComponent(t.token)}`;
    navigator.clipboard.writeText(url);
    setCopyId(t.id);
    setTimeout(() => setCopyId(null), 2000);
  }

  const emailSnippetText = `Dieser Demo-Link ist personalisiert und ausschließlich für den benannten Empfänger bestimmt. Eine Weiterleitung, gemeinsame Nutzung oder Offenlegung an Dritte ist untersagt.

Mit dem Öffnen bzw. der Nutzung des Links bestätigen Sie, dass Sie die bereitgestellten Inhalte ausschließlich zur Prüfung einer möglichen Zusammenarbeit verwenden. Der Link darf nicht an Dritte weitergeleitet oder gemeinsam genutzt werden. Sämtliche Inhalte der Demo (Funktionen, Konzepte, Designs, Texte, Workflows) sind vertraulich und dürfen ohne vorherige schriftliche Zustimmung weder kopiert, gespeichert, weitergegeben noch für eigene oder fremde Lösungen verwendet werden. Zugriffe werden zu Sicherheits- und Nachweiszwecken protokolliert (u. a. IP-Adresse, Zeitstempel, User-Agent, besuchte Seiten). Es gelten Vertraulichkeitsverpflichtungen für fünf Jahre.

Vollständige Geheimhaltungsvereinbarung: ${ndaUrl}`;

  function copyEmailSnippet() {
    navigator.clipboard.writeText(emailSnippetText);
    setEmailSnippetCopied(true);
    setTimeout(() => setEmailSnippetCopied(false), 2500);
  }

  async function exportProof(tokenId: string) {
    setExportingId(tokenId);
    try {
      const res = await fetch(`/api/admin/proof-report?tokenId=${encodeURIComponent(tokenId)}`);
      if (!res.ok) throw new Error('Export fehlgeschlagen');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Zugriffs-Nachweis-${tokenId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (_) {}
    setExportingId(null);
  }

  async function deactivate(t: DemoToken) {
    if (!supabase) return;
    await supabase.from('demo_tokens').update({ is_active: false }).eq('id', t.id);
    setTokens((prev) => prev.map((x) => (x.id === t.id ? { ...x, is_active: false } : x)));
  }

  if (loading) return <p className="text-gray-600">Lade…</p>;

  return (
    <div>
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold mb-2 text-sm text-gray-700">Text für E-Mail / Vertraulichkeitshinweis</h2>
        <p className="text-xs text-gray-600 mb-2">
          Kurztext und Link zur Geheimhaltungsvereinbarung – beim Versand des Demo-Links in die E-Mail einfügen.
        </p>
        <p className="text-xs text-gray-500 mb-2">
          <strong>Link zur NDA:</strong>{' '}
          <a href={ndaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {ndaUrl}
          </a>
        </p>
        <button
          type="button"
          onClick={copyEmailSnippet}
          className="text-sm text-blue-600 hover:underline"
        >
          {emailSnippetCopied ? 'Kopiert!' : 'Vertraulichkeits-Text kopieren (für E-Mail)'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="font-semibold mb-3">Neuer Demo-Link</h2>
        <div className="grid gap-3 max-w-md">
          <input
            type="text"
            placeholder="Empfänger-Name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Organisation"
            value={recipientOrg}
            onChange={(e) => setRecipientOrg(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <span className="text-sm">Ablauf (Tage):</span>
            <input
              type="number"
              min={1}
              value={expiresDays}
              onChange={(e) => setExpiresDays(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-20"
            />
          </label>
          <button
            onClick={createToken}
            disabled={creating}
            className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {creating ? 'Erstelle…' : 'Link erstellen'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3">Empfänger</th>
              <th className="text-left p-3">Organisation</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Erstellt</th>
              <th className="text-left p-3">Erster Zugriff</th>
              <th className="text-left p-3">Letzter Zugriff</th>
              <th className="text-left p-3">Zugriffe</th>
              <th className="text-left p-3">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-3">{t.recipient_name}</td>
                <td className="p-3">{t.recipient_org ?? '–'}</td>
                <td className="p-3">{getStatus(t)}</td>
                <td className="p-3">{new Date(t.created_at).toLocaleString('de-DE')}</td>
                <td className="p-3">{t.first_accessed_at ? new Date(t.first_accessed_at).toLocaleString('de-DE') : '–'}</td>
                <td className="p-3">{t.last_accessed_at ? new Date(t.last_accessed_at).toLocaleString('de-DE') : '–'}</td>
                <td className="p-3">{t.access_count}</td>
                <td className="p-3 flex flex-wrap gap-1">
                  <button
                    onClick={() => copyLink(t)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    {copyId === t.id ? 'Kopiert!' : 'Link kopieren'}
                  </button>
                  <button
                    onClick={() => exportProof(t.id)}
                    disabled={exportingId === t.id}
                    className="text-blue-600 hover:underline text-xs disabled:opacity-50"
                  >
                    {exportingId === t.id ? '…' : 'Beweis-PDF'}
                  </button>
                  {t.is_active && (
                    <button
                      onClick={() => deactivate(t)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Deaktivieren
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
