import { getDevDemoEnterPath, isDevDemoAutoEnterEnabled } from '@/lib/security/dev-demo-enter-path';

describe('devDemoEnter', () => {
  const prevNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
  });

  it('is enabled only in development', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevDemoAutoEnterEnabled()).toBe(true);
    process.env.NODE_ENV = 'production';
    expect(isDevDemoAutoEnterEnabled()).toBe(false);
  });

  it('builds enter path with demo id', () => {
    expect(getDevDemoEnterPath('eidconnect-v1')).toBe(
      '/api/dev/enter-demo?demo_id=eidconnect-v1',
    );
  });
});
