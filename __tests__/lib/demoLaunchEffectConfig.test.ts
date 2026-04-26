describe('isDemoLaunchEffectEnabled', () => {
  const OLD = process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = OLD;
    jest.resetModules();
  });

  it('ist false, wenn die Variable fehlt oder leer ist', async () => {
    delete process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT;
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(false);
  });

  it('ist nur bei exakt "true" aktiv (Build-Zeit-String)', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = 'true';
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(true);
  });

  it('ist false für True / 1 (kein truthy-Casting)', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = 'True';
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(false);
  });
});
