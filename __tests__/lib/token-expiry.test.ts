import { resolveTokenExpiresAt } from '@/lib/security/token-expiry';

describe('resolveTokenExpiresAt', () => {
  it('bevorzugt expiresInMinutes vor expiresInDays', () => {
    const before = Date.now();
    const exp = resolveTokenExpiresAt({ expiresInMinutes: 10, expiresInDays: 30 });
    const deltaMs = exp.getTime() - before;
    expect(deltaMs).toBeGreaterThanOrEqual(9 * 60 * 1000);
    expect(deltaMs).toBeLessThanOrEqual(11 * 60 * 1000);
  });

  it('fällt auf Tage zurück, wenn keine Minuten gesetzt sind', () => {
    const before = Date.now();
    const exp = resolveTokenExpiresAt({ expiresInDays: 2 });
    const deltaMs = exp.getTime() - before;
    expect(deltaMs).toBeGreaterThanOrEqual(2 * 24 * 60 * 60 * 1000 - 1000);
    expect(deltaMs).toBeLessThanOrEqual(2 * 24 * 60 * 60 * 1000 + 1000);
  });
});
