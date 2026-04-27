describe('isDemoLaunchEffectEnabled', () => {
  const OLD = process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT;
  const OLD_STYLE = process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = OLD;
    process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE = OLD_STYLE;
    jest.resetModules();
  });

  it('ist aktiv, wenn die Variable fehlt oder leer ist', async () => {
    delete process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT;
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(true);
  });

  it('ist nur bei exakt "true" aktiv (Build-Zeit-String)', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = 'true';
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(true);
  });

  it('ist auch für "True" aktiv (case-insensitive)', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = 'True';
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(true);
  });

  it('ist mit "false" explizit deaktiviert', async () => {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT = 'false';
    jest.resetModules();
    const { isDemoLaunchEffectEnabled } = await import('@/lib/demoLaunchEffectConfig');
    expect(isDemoLaunchEffectEnabled()).toBe(false);
  });
});

describe('getDemoLaunchStyle', () => {
  const OLD_STYLE = process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE = OLD_STYLE;
    jest.resetModules();
  });

  it('fällt ohne ENV stabil auf identity-seal zurück', async () => {
    delete process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE;
    jest.resetModules();
    const { getDemoLaunchStyle } = await import('@/lib/demoLaunchEffectConfig');
    expect(getDemoLaunchStyle()).toBe('identity-seal');
  });

  it('akzeptiert classic explizit', async () => {
    process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE = 'classic';
    jest.resetModules();
    const { getDemoLaunchStyle } = await import('@/lib/demoLaunchEffectConfig');
    expect(getDemoLaunchStyle()).toBe('classic');
  });
});
