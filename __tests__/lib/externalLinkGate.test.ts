import { MOCK_GOV_SERVICES } from '@/lib/govdata/mockGovServices';
import { DEMO_SERVICE_SOURCE_LABEL } from '@/lib/govdata/sourceStatus';
import {
  EXTERNAL_HANDOVER_NOTICE,
  VERIFIED_OFFICIAL_LABEL,
  externalLinkBadgeLabel,
  externalLinkButtonLabel,
  handoverLinkLabel,
  isVerifiedOfficialLink,
  resolveExternalLinkStatus,
  resolvePvogFallbackLinkStatus,
  shouldRenderExternalLink,
  sourceSystemLinkStatus,
} from '@/lib/govdata/externalLinkGate';
import { formatOfficialHandover } from '@/lib/govdata/officialSourceFormatter';
import { fetchPvogServices, markPvogLiveVerified, resetPvogLiveVerified } from '@/lib/govdata/pvogClient';

describe('externalLinkGate', () => {
  afterEach(() => {
    resetPvogLiveVerified();
  });

  it('never labels ManualDemo links as verified official', () => {
    const demoService = MOCK_GOV_SERVICES.find((s) => s.sourceSystem === 'ManualDemo' && s.officialSourceUrl);
    expect(demoService).toBeDefined();
    const status = resolveExternalLinkStatus(demoService!);
    expect(status).toBe('demo_unverified');
    expect(isVerifiedOfficialLink(status)).toBe(false);
    expect(externalLinkBadgeLabel(status)).toBe(DEMO_SERVICE_SOURCE_LABEL);
    expect(handoverLinkLabel(status, 'source')).toBe(DEMO_SERVICE_SOURCE_LABEL);
    expect(handoverLinkLabel(status, 'source')).not.toBe(VERIFIED_OFFICIAL_LABEL);
    expect(shouldRenderExternalLink(status)).toBe(false);
    expect(externalLinkButtonLabel(status)).toBe('Offizieller Link folgt');
  });

  it('treats PVOG mock fallback as demo_unverified, not live', async () => {
    const pvogResult = await fetchPvogServices();
    expect(pvogResult.status).toBe('mock_fallback');
    expect(resolvePvogFallbackLinkStatus()).toBe('demo_unverified');
    expect(sourceSystemLinkStatus('PVOG')).toBe('demo_unverified');
  });

  it('labels verified official only when live PVOG access is marked available', () => {
    for (const service of MOCK_GOV_SERVICES) {
      expect(isVerifiedOfficialLink(resolveExternalLinkStatus(service))).toBe(false);
    }
    markPvogLiveVerified(true);
    const pvogLike = {
      ...MOCK_GOV_SERVICES[0],
      sourceSystem: 'PVOG' as const,
      officialSourceUrl: 'https://example.gov/service',
    };
    const status = resolveExternalLinkStatus(pvogLike);
    expect(status).toBe('verified_official');
    expect(shouldRenderExternalLink(status)).toBe(true);
    expect(externalLinkButtonLabel(status)).toBe('Offizielle Informationen öffnen');
  });

  it('keeps official handover copy external-only', () => {
    expect(EXTERNAL_HANDOVER_NOTICE).toContain('extern');
    expect(EXTERNAL_HANDOVER_NOTICE).toMatch(/reicht nichts ein/i);
    const service = MOCK_GOV_SERVICES[0];
    const links = formatOfficialHandover(service);
    for (const link of links) {
      if (link.url) {
        expect(link.label).not.toBe(VERIFIED_OFFICIAL_LABEL);
      }
    }
  });
});
