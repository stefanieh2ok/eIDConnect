/**
 * Einheitliche Quellen-Erkennung für Stimmzettel / Info-Modal (Demo).
 */

export type SourceLink = { label: string; url: string };

export function collectSourceLinks(data: unknown): SourceLink[] {
  const out: SourceLink[] = [];
  const push = (label: string, url?: unknown) => {
    const u = typeof url === 'string' ? url.trim() : '';
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) return;
    if (out.some((x) => x.url === u)) return;
    out.push({ label, url: u });
  };

  const d = data as Record<string, unknown> | null | undefined;
  if (!d) return out;

  if (Array.isArray(d.sources)) {
    for (const s of d.sources) {
      if (s && typeof s === 'object') {
        const label = typeof (s as { label?: string }).label === 'string' ? (s as { label: string }).label : 'Quelle';
        push(label, (s as { url?: string }).url);
      }
    }
  }

  if (Array.isArray(d.quellen)) {
    for (const q of d.quellen) {
      if (typeof q !== 'string') continue;
      const match = q.match(/https?:\/\/[^\s)]+/i);
      if (!match) continue;
      const url = match[0];
      const label = q.replace(url, '').replace(/\s+/g, ' ').trim();
      push(label || 'Quelle', url);
    }
  }

  push('Wikipedia', d.wikipediaUrl);
  push('Bundestag/Parlament', d.parlamentUrl);
  push('abgeordnetenwatch', d.abgeordnetenwatchUrl);
  const sm = d.socialMedia as { website?: string } | undefined;
  push('Offizielle Website', sm?.website);

  return out;
}

export function hasVerifiedPrimarySource(data: unknown): boolean {
  return collectSourceLinks(data).length > 0;
}
