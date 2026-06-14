import {
  CIVIC_EXTERNAL_ADAPTERS,
  FIM_LEIKA_ADAPTER,
  PVOG_ADAPTER,
  getExternalAdapter,
} from '@/lib/adapters';

describe('civic external adapters', () => {
  it('definiert alle sieben Deutschland-Stack-Adapter ohne Live-Calls', () => {
    expect(CIVIC_EXTERNAL_ADAPTERS).toHaveLength(7);
    for (const adapter of CIVIC_EXTERNAL_ADAPTERS) {
      expect(adapter.noLiveCalls).toBe(true);
      expect(adapter.name.length).toBeGreaterThan(2);
      expect(adapter.purpose.length).toBeGreaterThan(10);
      expect(adapter.demoBoundary.length).toBeGreaterThan(10);
      expect(adapter.futureIntegrationNotes).toMatch(/verifizieren/i);
    }
  });

  it('kennzeichnet PVOG als not_started und FIM als mock_ready', () => {
    expect(PVOG_ADAPTER.currentStatus).toBe('not_started');
    expect(FIM_LEIKA_ADAPTER.currentStatus).toBe('mock_ready');
  });

  it('findet Adapter per ID', () => {
    expect(getExternalAdapter('eudi_wallet')?.name).toBe('EUDI Wallet');
    expect(getExternalAdapter('unknown')).toBeUndefined();
  });
});
