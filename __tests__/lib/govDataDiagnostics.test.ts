import {
  buildGovDataDiagnostics,
  isGovDataDiagnosticsEnabled,
} from '@/lib/govdata/diagnostics';
import { resolveExternalLinkStatus } from '@/lib/govdata/externalLinkGate';
import { resolveGovDataForCase } from '@/lib/govdata/govDataResolver';
import {
  SOURCE_NOTICE_DEMO,
  SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING,
  SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE,
} from '@/lib/govdata/sourceStatus';

describe('govDataDiagnostics', () => {
  const input = {
    text: 'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld, Kita und Krankenversicherung.',
    mode: 'private' as const,
  };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE;
    delete process.env.GOVDATA_SOURCE_MODE;
    delete process.env.PVOG_CLIENT_ID;
    delete process.env.PVOG_CLIENT_SECRET;
    delete process.env.PVOG_TOKEN_URL;
    delete process.env.GOVDATA_DIAGNOSTICS_ENABLED;
  });

  it('is disabled in production unless explicitly enabled', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete process.env.GOVDATA_DIAGNOSTICS_ENABLED;
    expect(isGovDataDiagnosticsEnabled()).toBe(false);

    process.env.GOVDATA_DIAGNOSTICS_ENABLED = 'true';
    expect(isGovDataDiagnosticsEnabled()).toBe(true);
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('never exposes secrets in diagnostics payload', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_bereitstelldienst';
    process.env.PVOG_CLIENT_ID = 'client-id-value';
    process.env.PVOG_CLIENT_SECRET = 'super-secret-value';
    process.env.PVOG_TOKEN_URL = 'https://token.example/oauth';

    const diagnostics = await buildGovDataDiagnostics();
    const serialized = JSON.stringify(diagnostics);

    expect(diagnostics.hasPvogClientId).toBe(true);
    expect(diagnostics.hasPvogClientSecret).toBe(true);
    expect(diagnostics.hasPvogTokenUrl).toBe(true);
    expect(serialized).not.toContain('super-secret-value');
    expect(serialized).not.toContain('client-id-value');
    expect(diagnostics.lastProbe.verifiedOfficialCount).toBe(0);
  });

  it('reports demo probe with no verified official links', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'demo';
    const diagnostics = await buildGovDataDiagnostics();

    expect(diagnostics.sourceMode).toBe('demo');
    expect(diagnostics.lastProbe.status).toBe('ok');
    expect(diagnostics.lastProbe.verifiedOfficialCount).toBe(0);
    expect(diagnostics.lastProbe.verifiedManualCount).toBe(0);
    expect(diagnostics.lastProbe.serviceCount).toBeGreaterThan(0);
  });

  it('reports credentials_required for bereitstelldienst without credentials', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_bereitstelldienst';
    const diagnostics = await buildGovDataDiagnostics();

    expect(diagnostics.lastProbe.status).toBe('credentials_required');
    expect(diagnostics.lastProbe.verifiedOfficialCount).toBe(0);
  });

  it('reports verified_catalog manual counts separately from PVOG', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'verified_catalog';
    const diagnostics = await buildGovDataDiagnostics();

    expect(diagnostics.sourceMode).toBe('verified_catalog');
    expect(diagnostics.lastProbe.sourceStatus).toBe('verified_catalog');
    expect(diagnostics.lastProbe.verifiedManualCount).toBeGreaterThan(0);
    expect(diagnostics.lastProbe.verifiedPvogCount).toBe(0);
    expect(diagnostics.lastProbe.fallbackUsed).toBe(false);
  });
});

describe('govDataResolver source verification', () => {
  const input = { text: 'Ich ziehe um und brauche Wohngeld', mode: 'private' as const };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE;
    delete process.env.GOVDATA_SOURCE_MODE;
    delete process.env.PVOG_CLIENT_ID;
    delete process.env.PVOG_CLIENT_SECRET;
    delete process.env.PVOG_TOKEN_URL;
  });

  it('demo mode never returns verified official links', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'demo';
    const resolution = await resolveGovDataForCase(input);

    expect(resolution.status).toBe('demo');
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_DEMO);
    for (const service of resolution.services) {
      expect(resolveExternalLinkStatus(service)).not.toBe('verified_official');
    }
  });

  it('pvog_search 401 returns safe fallback with no live claim', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_search';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as typeof fetch;

    const resolution = await resolveGovDataForCase(input);
    expect(resolution.status).toBe('unavailable');
    expect(resolution.isDemoData).toBe(true);
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE);
    expect(resolution.sourceNotice).not.toMatch(/live/i);
    for (const service of resolution.services) {
      expect(resolveExternalLinkStatus(service)).not.toBe('verified_official');
    }
  });

  it('missing bereitstelldienst credentials return credentials_required', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_bereitstelldienst';
    const resolution = await resolveGovDataForCase(input);

    expect(resolution.status).toBe('credentials_required');
    expect(resolution.isDemoData).toBe(true);
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING);
    for (const service of resolution.services) {
      expect(resolveExternalLinkStatus(service)).not.toBe('verified_official');
    }
  });

  it('live official status only appears with successful official response', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_search';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 'pvog-1',
            name: 'Elterngeld beantragen',
            description: 'Antrag auf Elterngeld',
            url: 'https://example.gov/elterngeld',
            authority: 'Familienkasse',
          },
        ],
      }),
    }) as typeof fetch;

    const resolution = await resolveGovDataForCase(input);
    expect(resolution.status).toBe('live');
    expect(resolution.isDemoData).toBe(false);
    expect(resolution.sourceNotice).toBeNull();

    const verified = resolution.services.filter(
      (service) => resolveExternalLinkStatus(service) === 'verified_official',
    );
    expect(verified.length).toBeGreaterThan(0);
    expect(verified[0].officialSourceUrl).toBe('https://example.gov/elterngeld');
  });

  it('returns exactly one source notice string in fallback modes', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'demo';
    const resolution = await resolveGovDataForCase(input);
    expect(typeof resolution.sourceNotice).toBe('string');
    expect(resolution.sourceNotice).toBeTruthy();
  });

  it('fallback source notices never claim PVOG is live', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_search';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as typeof fetch;

    const resolution = await resolveGovDataForCase(input);
    expect(resolution.sourceNotice).toMatch(/Demonstrationslogik|PVOG-Suchdienst/);
    expect(resolution.sourceNotice?.toLowerCase()).not.toMatch(/pvo[g]? live|live pvo[g]?/);
  });
});
