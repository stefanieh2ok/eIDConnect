import { MOCK_GOV_SERVICES } from '@/lib/govdata/mockGovServices';
import {
  DEMO_LINK_LABEL,
  EXTERNAL_HANDOVER_NOTICE,
  VERIFIED_OFFICIAL_LABEL,
  externalLinkBadgeLabel,
  handoverLinkLabel,
  isVerifiedOfficialLink,
  resolveExternalLinkStatus,
  resolvePvogFallbackLinkStatus,
  sourceSystemLinkStatus,
} from '@/lib/govdata/externalLinkGate';
import { formatOfficialHandover } from '@/lib/govdata/officialSourceFormatter';
import { fetchPvogServices } from '@/lib/govdata/pvogClient';

describe('externalLinkGate', () => {
  it('never labels ManualDemo links as verified official', () => {
    const demoService = MOCK_GOV_SERVICES.find((s) => s.sourceSystem === 'ManualDemo' && s.officialSourceUrl);
    expect(demoService).toBeDefined();
    const status = resolveExternalLinkStatus(demoService!);
    expect(status).toBe('demo_unverified');
    expect(isVerifiedOfficialLink(status)).toBe(false);
    expect(externalLinkBadgeLabel(status)).toBe(DEMO_LINK_LABEL);
    expect(handoverLinkLabel(status, 'source')).toBe(DEMO_LINK_LABEL);
    expect(handoverLinkLabel(status, 'source')).not.toBe(VERIFIED_OFFICIAL_LABEL);
  });

  it('treats PVOG mock fallback as demo_unverified, not live', async () => {
    const pvogResult = await fetchPvogServices();
    expect(pvogResult.status).toBe('mock_fallback');
    expect(resolvePvogFallbackLinkStatus()).toBe('demo_unverified');
    expect(sourceSystemLinkStatus('PVOG')).toBe('demo_unverified');
  });

  it('labels verified official only when live PVOG/Bundesportal access is available', () => {
    // pvogLiveAccessAvailable() is false in MVP — no service should appear verified
    for (const service of MOCK_GOV_SERVICES) {
      const status = resolveExternalLinkStatus(service);
      expect(isVerifiedOfficialLink(status)).toBe(false);
    }
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
