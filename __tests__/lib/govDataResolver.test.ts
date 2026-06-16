import { resolveGovDataForCase } from '@/lib/govdata/govDataResolver';
import { SOURCE_NOTICE_DEMO, SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING } from '@/lib/govdata/sourceStatus';

describe('govDataResolver', () => {
  const input = { text: 'Ich ziehe um und brauche Wohngeld', mode: 'private' as const };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE;
    delete process.env.GOVDATA_SOURCE_MODE;
    delete process.env.PVOG_CLIENT_ID;
    delete process.env.PVOG_CLIENT_SECRET;
    delete process.env.PVOG_TOKEN_URL;
  });

  it('demo mode returns one source notice and ManualDemo services', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'demo';
    const resolution = await resolveGovDataForCase(input);
    expect(resolution.isDemoData).toBe(true);
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_DEMO);
    expect(resolution.services.length).toBeGreaterThan(0);
  });

  it('pvog_bereitstelldienst without credentials fails safely with one notice', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_bereitstelldienst';
    const resolution = await resolveGovDataForCase(input);
    expect(resolution.status).toBe('credentials_required');
    expect(resolution.isDemoData).toBe(true);
    expect(resolution.sourceNotice).toBe(SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING);
    expect(resolution.services.length).toBeGreaterThan(0);
  });

  it('pvog_search unavailable falls back with explicit notice', async () => {
    process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE = 'pvog_search';
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as typeof fetch;
    const resolution = await resolveGovDataForCase(input);
    expect(resolution.isDemoData).toBe(true);
    expect(resolution.sourceNotice).toMatch(/PVOG-Suchdienst/);
  });
});
