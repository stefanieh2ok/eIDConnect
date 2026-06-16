import { resolveExternalLinkStatus, VERIFIED_OFFICIAL_MANUAL_LABEL } from '@/lib/govdata/externalLinkGate';
import { resolveGovDataForCase } from '@/lib/govdata/govDataResolver';
import {
  SOURCE_NOTICE_DEMO,
  SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING,
  SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE,
  SOURCE_NOTICE_VERIFIED_CATALOG,
} from '@/lib/govdata/sourceStatus';
import {
  matchVerifiedCatalogServices,
  VERIFIED_CATALOG_SOURCE_LABEL,
  VERIFIED_OFFICIAL_CATALOG,
} from '@/lib/govdata/verifiedOfficialSources';

describe('verifiedOfficialSources', () => {
  it('contains 15 curated official entries', () => {
    expect(VERIFIED_OFFICIAL_CATALOG).toHaveLength(15);
    for (const entry of VERIFIED_OFFICIAL_CATALOG) {
      expect(entry.sourceSystem).toBe('VerifiedCatalog');
      expect(entry.sourceLabel).toBe(VERIFIED_CATALOG_SOURCE_LABEL);
      expect(entry.sourceVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.officialSourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('matches child-related private cases to family services', () => {
    const services = matchVerifiedCatalogServices({
      text: 'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld, Kita und Krankenversicherung.',
      mode: 'private',
    });
    expect(services.length).toBeGreaterThan(0);
    expect(services.some((s) => /Elterngeld|Kindergeld|Kita/i.test(s.title))).toBe(true);
    for (const service of services) {
      expect(resolveExternalLinkStatus(service)).toBe('verified_official_manual');
    }
  });

  it('matches business registration cases', () => {
    const services = matchVerifiedCatalogServices({
      text: 'Ich möchte ein Gewerbe anmelden und wissen, welche Stellen zuständig sind.',
      mode: 'business',
    });
    expect(services.some((s) => /Gewerbe|Gründ/i.test(s.title))).toBe(true);
  });
});

describe('verified_catalog resolver mode', () => {
  const childCase = {
    text: 'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld, Kita und Krankenversicherung.',
    mode: 'private' as const,
  };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE;
    delete process.env.GOVDATA_SOURCE_MODE;
  });

  it('returns VerifiedCatalog services with official links', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'verified_catalog';
    const resolution = await resolveGovDataForCase(childCase);

    expect(resolution.mode).toBe('verified_catalog');
    expect(resolution.status).toBe('verified_catalog');
    expect(resolution.isDemoData).toBe(false);
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_VERIFIED_CATALOG);
    expect(resolution.services.length).toBeGreaterThan(0);
    expect(resolution.services.every((s) => s.sourceSystem === 'VerifiedCatalog')).toBe(true);
    expect(
      resolution.services.every((s) => resolveExternalLinkStatus(s) === 'verified_official_manual'),
    ).toBe(true);
  });

  it('never claims PVOG live in source notice', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'verified_catalog';
    const resolution = await resolveGovDataForCase(childCase);
    expect(resolution.sourceNotice).not.toMatch(/PVOG live|XZuFi live|amtlich angebunden/i);
    expect(resolution.sourceNotice).toMatch(/kuratierten offiziellen Quellenkatalog/i);
  });

  it('includes sourceVerifiedAt on matched services', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'verified_catalog';
    const resolution = await resolveGovDataForCase(childCase);
    for (const service of resolution.services) {
      expect(service.sourceVerifiedAt).toBeTruthy();
      expect(service.sourceLabel).toBe(VERIFIED_CATALOG_SOURCE_LABEL);
    }
  });

  it('shows one source notice string', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'verified_catalog';
    const resolution = await resolveGovDataForCase(childCase);
    expect(typeof resolution.sourceNotice).toBe('string');
    expect(resolution.sourceNotice).toBeTruthy();
  });

  it('falls back safely when no curated match exists', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'verified_catalog';
    const resolution = await resolveGovDataForCase({
      text: 'xyzabc nonsense query without keywords',
      mode: 'private',
    });
    expect(resolution.status).toBe('verified_catalog_no_match');
    expect(resolution.services).toHaveLength(0);
    expect(resolution.fallbackUsed).toBe(true);
    expect(resolution.sourceNotice).toMatch(/noch keine kuratierte Quelle/i);
  });
});

describe('verified_catalog UI labels', () => {
  it('uses manual verified label, not Demo-Link wording', () => {
    expect(VERIFIED_OFFICIAL_MANUAL_LABEL).toBe('Manuell verifizierte offizielle Quelle');
    expect(VERIFIED_OFFICIAL_MANUAL_LABEL).not.toMatch(/Demo-Link/i);
  });
});

describe('other source modes remain safe', () => {
  const input = { text: 'Ich ziehe um und brauche Wohngeld', mode: 'private' as const };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE;
    delete process.env.GOVDATA_SOURCE_MODE;
    delete process.env.PVOG_CLIENT_ID;
    delete process.env.PVOG_CLIENT_SECRET;
    delete process.env.PVOG_TOKEN_URL;
  });

  it('demo mode still shows no verified official links', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'demo';
    const resolution = await resolveGovDataForCase(input);
    expect(resolution.status).toBe('demo');
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_DEMO);
    for (const service of resolution.services) {
      expect(resolveExternalLinkStatus(service)).not.toBe('verified_official');
      expect(resolveExternalLinkStatus(service)).not.toBe('verified_official_manual');
    }
  });

  it('pvog_search 401 still fails safely', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_search';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as typeof fetch;

    const resolution = await resolveGovDataForCase(input);
    expect(resolution.status).toBe('unavailable');
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE);
  });

  it('missing bereitstelldienst credentials remain safe', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_bereitstelldienst';
    const resolution = await resolveGovDataForCase(input);
    expect(resolution.status).toBe('credentials_required');
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING);
  });

  it('ManualDemo services never produce verified official links', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'demo';
    const resolution = await resolveGovDataForCase(input);
    for (const service of resolution.services) {
      if (service.sourceSystem === 'ManualDemo') {
        expect(resolveExternalLinkStatus(service)).toBe('demo_unverified');
      }
    }
  });
});
