import { hashForAudit } from '@/lib/ai/hash-content';

describe('clara AI audit hashing', () => {
  it('produces stable SHA-256 hex', () => {
    const a = hashForAudit('test-input');
    const b = hashForAudit('test-input');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('differs for different inputs', () => {
    expect(hashForAudit('a')).not.toBe(hashForAudit('b'));
  });
});
