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
  const [createTokenError, setCreateTokenError] = useState<string | null>(null);

  // Zugangs-Link (NDA / DocuSign): Vorname, Nachname, E-Mail
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [accessLinkExpiresDays, setAccessLinkExpiresDays] = useState(30);
  const [creatingAccessLink, setCreatingAccessLink] = useState(false);
  const [createdAccessUrl, setCreatedAccessUrl] = useState<string | null>(null);
  const [accessLinkError, setAccessLinkError] = useState<string | null>(null);
  const [accessLinkCopied, setAccessLinkCopied] = useState(false);

  // Test-Link (Checkbox, ohne DocuSign)
  const [testVorname, setTestVorname] = useState('');
  const [testNachname, setTestNachname] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [creatingTestLink, setCreatingTestLink] = useState(false);
  const [createdTestUrl, setCreatedTestUrl] = useState<string | null>(null);
  const [testLinkError, setTestLinkError] = useState<string | null>(null);
  const [testLinkCopied, setTestLinkCopied] = useState(false);

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
    if (!recipientName.trim()) return;
    setCreating(true);
    setCreateTokenError(null);
    try {
      const res = await fetch('/api/admin/create-demo-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientOrg: recipientOrg.trim() || undefined,
          expiresInDays: expiresDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateTokenError(data.error ?? 'Link konnte nicht erstellt werden.');
        return;
      }
      if (data.success && data.token) {
        setTokens((prev) => [data.token as DemoToken, ...prev]);
        setRecipientName('');
        setRecipientOrg('');
      }
    } catch (e) {
      setCreateTokenError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setCreating(false);
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

  async function createAccessLink() {
    const fullName = `${(vorname ?? '').trim()} ${(nachname ?? '').trim()}`.trim();
    if (!fullName || !(email ?? '').trim()) {
      setAccessLinkError('Vorname, Nachname und E-Mail sind Pflichtfelder.');
      return;
    }
    setAccessLinkError(null);
    setCreatedAccessUrl(null);
    setCreatingAccessLink(true);
    try {
      const res = await fetch('/api/admin/create-access-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          email: (email ?? '').trim(),
          company: (organisation ?? '').trim() || undefined,
          demoId: 'eid-demo-connect-v1',
          expiresInDays: accessLinkExpiresDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccessLinkError(data?.error ?? 'Link konnte nicht erstellt werden.');
        return;
      }
      if (data.accessUrl) {
        setCreatedAccessUrl(data.accessUrl);
        setVorname('');
        setNachname('');
        setEmail('');
        setOrganisation('');
      }
    } catch {
      setAccessLinkError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setCreatingAccessLink(false);
    }
  }

  function copyAccessLink() {
    if (createdAccessUrl) {
      navigator.clipboard.writeText(createdAccessUrl);
      setAccessLinkCopied(true);
      setTimeout(() => setAccessLinkCopied(false), 2000);
    }
  }

  async function createTestLink() {
    const fullName = `${(testVorname ?? '').trim()} ${(testNachname ?? '').trim()}`.trim();
    if (!fullName || !(testEmail ?? '').trim()) {
      setTestLinkError('Vorname, Nachname und E-Mail sind Pflichtfelder.');
      return;
    }
    setTestLinkError(null);
    setCreatedTestUrl(null);
    setCreatingTestLink(true);
    try {
      const res = await fetch('/api/admin/create-access-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          email: (testEmail ?? '').trim(),
          demoId: 'eid-demo-connect-v1',
          expiresInDays: 14,
          requireDocusign: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestLinkError(data?.error ?? 'Link konnte nicht erstellt werden.');
        return;
      }
      if (data.accessUrl) {
        setCreatedTestUrl(data.accessUrl);
        setTestVorname('');
        setTestNachname('');
        setTestEmail('');
      }
    } catch {
      setTestLinkError('Netzwerkfehler.');
    } finally {
      setCreatingTestLink(false);
    }
  }

  function copyTestLink() {
    if (createdTestUrl) {
      navigator.clipboard.writeText(createdTestUrl);
      setTestLinkCopied(true);
      setTimeout(() => setTestLinkCopied(false), 2000);
    }
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

      <div className="bg-white rounded-xl border-2 border-blue-200 p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-1 text-gray-900">Neuer Zugangs-Link (mit NDA / DocuSign)</h2>
        <p className="text-xs text-blue-600 font-medium mb-2">Empfohlen: Link mit DocuSign-Unterzeichnung – Empfänger erhält nach Unterschrift E-Mail mit Demo-Zugang.</p>
        <p className="text-sm text-gray-600 mb-3">
          Vorname, Nachname und E-Mail des Empfängers – danach Link generieren und z. B. per E-Mail senden. Der Empfänger öffnet den Link, unterzeichnet die Vertraulichkeitsvereinbarung per DocuSign und kommt in die Demo.
        </p>
        <div className="grid gap-3 max-w-md">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Vorname"
              value={vorname}
              onChange={(e) => { setVorname(e.target.value); setAccessLinkError(null); }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Nachname"
              value={nachname}
              onChange={(e) => { setNachname(e.target.value); setAccessLinkError(null); }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <input
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAccessLinkError(null); }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Organisation (optional)"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <span className="text-sm">Ablauf (Tage):</span>
            <input
              type="number"
              min={1}
              value={accessLinkExpiresDays}
              onChange={(e) => setAccessLinkExpiresDays(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-20"
            />
          </label>
          {accessLinkError && (
            <p className="text-sm text-red-600">{accessLinkError}</p>
          )}
          <button
            type="button"
            onClick={createAccessLink}
            disabled={creatingAccessLink}
            className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {creatingAccessLink ? 'Erstelle…' : 'Link erstellen'}
          </button>
          {createdAccessUrl && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-800 mb-1">Zugangs-Link erstellt:</p>
              <p className="text-xs text-green-700 break-all mb-2">{createdAccessUrl}</p>
              <button
                type="button"
                onClick={copyAccessLink}
                className="text-sm text-blue-600 hover:underline"
              >
                {accessLinkCopied ? 'Kopiert!' : 'Link kopieren'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-emerald-200 p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-1 text-gray-900">Test-Link (Checkbox-NDA, ohne DocuSign)</h2>
        <p className="text-xs text-emerald-600 font-medium mb-2">Für Freunde &amp; Tester – schneller Zugang mit Checkbox statt DocuSign.</p>
        <p className="text-sm text-gray-600 mb-3">
          Empfänger sieht das NDA, setzt ein Häkchen und kommt direkt in die Demo. Kein DocuSign nötig. 50 Zugriffe, 14 Tage gültig.
        </p>
        <div className="grid gap-3 max-w-md">
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Vorname" value={testVorname} onChange={(e) => { setTestVorname(e.target.value); setTestLinkError(null); }} className="border border-gray-300 rounded-lg px-3 py-2" />
            <input type="text" placeholder="Nachname" value={testNachname} onChange={(e) => { setTestNachname(e.target.value); setTestLinkError(null); }} className="border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <input type="email" placeholder="E-Mail-Adresse" value={testEmail} onChange={(e) => { setTestEmail(e.target.value); setTestLinkError(null); }} className="border border-gray-300 rounded-lg px-3 py-2" />
          {testLinkError && <p className="text-sm text-red-600">{testLinkError}</p>}
          <button type="button" onClick={createTestLink} disabled={creatingTestLink} className="bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {creatingTestLink ? 'Erstelle…' : 'Test-Link erstellen'}
          </button>
          {createdTestUrl && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-800 mb-1">Test-Link erstellt:</p>
              <p className="text-xs text-green-700 break-all mb-2">{createdTestUrl}</p>
              <button type="button" onClick={copyTestLink} className="text-sm text-blue-600 hover:underline">
                {testLinkCopied ? 'Kopiert!' : 'Link kopieren'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="font-semibold mb-3">Neuer Demo-Link (ohne NDA)</h2>
        {createTokenError && (
          <p className="text-sm text-red-600 mb-2">{createTokenError}</p>
        )}
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
