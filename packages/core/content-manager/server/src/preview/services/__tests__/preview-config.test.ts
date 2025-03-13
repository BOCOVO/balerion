import { createPreviewConfigService } from '../preview-config';

const getConfig = (enabled: boolean, handler: () => void) => {
  return {
    enabled,
    config: {
      handler,
    },
  };
};

describe('Preview Config', () => {
  test('Is not enabled by default', () => {
    const balerion = {
      config: {
        get: () => undefined,
      },
    } as any;

    expect(createPreviewConfigService({ balerion }).isEnabled()).toBe(false);
  });

  test('Is enabled when configuration is set', () => {
    const balerion = {
      config: {
        get: () => getConfig(true, () => {}),
      },
    } as any;

    expect(createPreviewConfigService({ balerion }).isEnabled()).toBe(true);
  });

  describe('Validation', () => {
    test('Passes on valid configuration', () => {
      const balerion = {
        config: {
          get: () => getConfig(true, () => {}),
        },
      } as any;

      createPreviewConfigService({ balerion }).validate();
    });

    test('Fails on missing handler', () => {
      const balerion = {
        config: {
          // @ts-expect-error - invalid handler
          get: () => getConfig(true, 3),
        },
      } as any;

      expect(() => createPreviewConfigService({ balerion }).validate()).toThrowError();
    });
  });
});
