import { WebSocket } from 'ws';
import type { IRemoteBalerionDestinationProviderOptions } from '..';

import { createRemoteBalerionDestinationProvider } from '..';
import { TRANSFER_PATH } from '../../../remote/constants';

const defaultOptions: IRemoteBalerionDestinationProviderOptions = {
  strategy: 'restore',
  url: new URL('http://balerion.com/admin'),
  auth: undefined,
};

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  createDispatcher: jest.fn(),
}));

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation(() => {
    return {};
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Remote Balerion Destination', () => {
  describe('Bootstrap', () => {
    test('Should not attempt to create websocket connection if bootstrap has not been called', () => {
      createRemoteBalerionDestinationProvider(defaultOptions);

      expect(WebSocket).not.toHaveBeenCalled();
    });

    test('Should attempt to create websocket connection if bootstrap has been called', async () => {
      const provider = createRemoteBalerionDestinationProvider(defaultOptions);
      try {
        await provider.bootstrap();
      } catch {
        // ignore bootstrap failures from mocked WebSocket, we only care about the attempt
      }

      expect(WebSocket).toHaveBeenCalled();
    });
  });

  test('Should use ws protocol for http urls', async () => {
    const provider = createRemoteBalerionDestinationProvider(defaultOptions);
    try {
      await provider.bootstrap();
    } catch {
      // ignore bootstrap failures from mocked WebSocket, we only care about the attempt
    }

    expect(WebSocket).toHaveBeenCalledWith(`ws://balerion.com/admin${TRANSFER_PATH}/push`, undefined);
  });

  test('Should use wss protocol for https urls', async () => {
    const provider = createRemoteBalerionDestinationProvider({
      ...defaultOptions,
      url: new URL('https://balerion.com/admin'),
    });
    try {
      await provider.bootstrap();
    } catch {
      // ignore bootstrap failures from mocked WebSocket, we only care about the attempt
    }

    expect(WebSocket).toHaveBeenCalledWith(
      `wss://balerion.com/admin${TRANSFER_PATH}/push`,
      undefined
    );
  });

  test('Should throw on invalid protocol', async () => {
    const provider = createRemoteBalerionDestinationProvider({
      ...defaultOptions,
      url: new URL('ws://balerion.com/admin'),
    });

    await expect(provider.bootstrap()).rejects.toThrowError('Invalid protocol');
  });
});
