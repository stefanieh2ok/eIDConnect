/**
 * Demo civic identity context — Kirkel pilot assumption.
 * Not a claim of live eID/EU-wallet data extraction.
 */

export type CivicIdentityKnownFrom = 'demo_profile' | 'eid' | 'eu_wallet' | 'manual';

export type CivicIdentityContext = {
  profileMode: 'demo' | 'verified' | 'anonymous';
  municipality?: string;
  federalState?: string;
  country?: string;
  plz?: string;
  knownFrom?: CivicIdentityKnownFrom;
  disclaimer: string;
};

export const KIRKEL_DEMO_CONTEXT: CivicIdentityContext = {
  profileMode: 'demo',
  municipality: 'Kirkel',
  federalState: 'Saarland',
  country: 'Deutschland',
  plz: '66459',
  knownFrom: 'demo_profile',
  disclaimer:
    'Für diese Demo nutzt Clara einen vorbereiteten Profilkontext mit Wohnort Kirkel, Saarland. In der Produktivversion würden solche Daten nur mit Zustimmung aus einem verifizierten Profil übernommen.',
};

export function formatKnownLocationLabel(ctx: CivicIdentityContext, du = true): string | null {
  if (!ctx.municipality && !ctx.federalState) return null;
  const place = [ctx.municipality, ctx.federalState].filter(Boolean).join(', ');
  return du ? `Demo-Kontext: ${place}` : `Demo-Kontext: ${place}`;
}

export function formatKnownLocationFact(ctx: CivicIdentityContext, du = true): string | null {
  if (!ctx.municipality && !ctx.federalState) return null;
  const place = [ctx.municipality, ctx.federalState].filter(Boolean).join(', ');
  return du
    ? `Aus deinem Demo-Profil bekannt: Wohnort ${place}.`
    : `Aus Ihrem Demo-Profil bekannt: Wohnort ${place}.`;
}

export function hasMunicipalityContext(ctx: CivicIdentityContext): boolean {
  return Boolean(ctx.municipality || ctx.federalState || ctx.plz);
}

/** Merge explicit profile fields with Kirkel demo fallback for Wegweiser planning. */
export function resolvePlannerIdentityContext(fields?: {
  plz?: string;
  bundesland?: string;
  wohnort?: string;
}): CivicIdentityContext {
  const municipality = fields?.wohnort?.trim() || KIRKEL_DEMO_CONTEXT.municipality;
  const federalState = fields?.bundesland?.trim() || KIRKEL_DEMO_CONTEXT.federalState;
  const plz = fields?.plz?.trim() || KIRKEL_DEMO_CONTEXT.plz;
  return {
    ...KIRKEL_DEMO_CONTEXT,
    municipality,
    federalState,
    plz,
  };
}
