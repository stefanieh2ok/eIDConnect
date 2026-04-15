const TRUSTED_SOURCE_HOSTS = [
  'bundeswahlleiterin.de',
  'gesetze-im-internet.de',
  'bundestag.de',
  'bundesrat.de',
  'bpb.de',
  'saarland.de',
  'kirkel.de',
  'govdata.de',
  'destatis.de',
];

function toHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isTrustedEvidenceUrl(url: string): boolean {
  const host = toHost(url);
  if (!host) return false;
  return TRUSTED_SOURCE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

export function sanitizeEvidenceSources(sources: string[]): string[] {
  const cleaned = (sources || []).map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return ['Evidenzstatus: missing – keine verifizierte Primärquelle hinterlegt'];
  }
  return cleaned;
}

