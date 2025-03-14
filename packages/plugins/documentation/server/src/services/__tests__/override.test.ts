import override from '../override';

const balerionMock = {
  config: {
    get: () => ({
      'x-balerion-config': {
        plugins: null,
      },
    }),
  },
} as any;

let balerion = balerionMock;
describe('Documentation plugin | Override service', () => {
  afterEach(() => {
    // Reset balerion after each test
    balerion = balerionMock;
  });

  it('should register an override', () => {
    const mockOverride = {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
    } as any;

    const overrideService = override({ balerion });
    overrideService.registerOverride(mockOverride);

    expect(overrideService.registeredOverrides).toEqual([mockOverride]);
  });

  it('should not register an override from a plugin that is not in the config', () => {
    const mockOverride = {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
    } as any;

    const overrideService = override({ balerion });
    overrideService.registerOverride(mockOverride, { pluginOrigin: 'test' });

    expect(overrideService.registeredOverrides).toEqual([]);
  });

  it('should register an override from a plugin that is in the config and exclude it from generation', () => {
    const mockOverride = {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
    } as any;

    balerion.config.get = () => ({
      'x-balerion-config': {
        plugins: ['test'],
      },
    });

    const overrideService = override({ balerion });
    overrideService.registerOverride(mockOverride, {
      pluginOrigin: 'test',
      excludeFromGeneration: ['test', 'some-other-api-to-exclude'],
    });

    expect(overrideService.registeredOverrides).toEqual([mockOverride]);
    expect(overrideService.excludedFromGeneration).toEqual(['test', 'some-other-api-to-exclude']);
  });

  it('should register an api or plugin to exclude from generation', () => {
    const overrideService = override({ balerion });
    overrideService.excludeFromGeneration('my-api');
    overrideService.excludeFromGeneration(['my-other-api', 'my-plugin', 'my-other-plugin']);

    expect(overrideService.excludedFromGeneration).toEqual([
      'my-api',
      'my-other-api',
      'my-plugin',
      'my-other-plugin',
    ]);
  });
});
