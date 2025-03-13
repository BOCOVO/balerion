import { join } from 'path';
import { register } from '../register';

const exampleMiddlewaresConfig = [
  {
    name: 'balerion::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://exampledomain.global.balerion.io'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://exampledomain.global.balerion.io'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];

jest.mock('@balerion/provider-upload-local', () => ({
  init() {
    global.balerion.config.set('middlewares', exampleMiddlewaresConfig);

    return {
      uploadStream: jest.fn(),
      upload: jest.fn(),
      delete: jest.fn(),
    };
  },
}));

describe('Upload plugin register function', () => {
  test('The upload plugin registers the /upload route', async () => {
    const registerRoute = jest.fn();

    global.balerion = {
      dirs: { app: { root: process.cwd() }, static: { public: join(process.cwd(), 'public') } },
      plugins: { upload: {} },
      server: { app: { on: jest.fn() }, routes: registerRoute },
      admin: { services: { permission: { actionProvider: { registerMany: jest.fn() } } } },
      config: {
        get: jest.fn().mockReturnValueOnce({ provider: 'local' }),
        set: jest.fn(),
      },
    } as any;

    await register({ balerion });

    expect(registerRoute).toHaveBeenCalledTimes(1);
  });

  test('Balerion config can programatically be extended by providers', async () => {
    const setConfig = jest.fn();

    global.balerion = {
      dirs: { app: { root: process.cwd() }, static: { public: join(process.cwd(), 'public') } },
      plugins: { upload: {} },
      server: { app: { on: jest.fn() }, routes: jest.fn() },
      admin: { services: { permission: { actionProvider: { registerMany: jest.fn() } } } },
      config: {
        get: jest.fn().mockReturnValueOnce({ provider: 'local' }),
        set: setConfig,
      },
    } as any;

    await register({ balerion });

    expect(setConfig).toHaveBeenCalledWith('middlewares', exampleMiddlewaresConfig);
  });
});
