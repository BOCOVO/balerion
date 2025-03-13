import * as mockDataTransfer from '@balerion/data-transfer';

import transferAction from '../action';
import { expectExit } from '../../__tests__/commands.test.utils';

jest.mock('../../../utils/data-transfer', () => {
  return {
    ...jest.requireActual('../../../utils/data-transfer'),
    getTransferTelemetryPayload: jest.fn().mockReturnValue({}),
    loadersFactory: jest.fn().mockReturnValue({ updateLoader: jest.fn() }),
    formatDiagnostic: jest.fn(),
    createBalerionInstance() {
      return {
        telemetry: {
          send: jest.fn(),
        },
      };
    },
    getDefaultExportName: jest.fn(() => 'default'),
    buildTransferTable: jest.fn(() => {
      return {
        toString() {
          return 'table';
        },
      };
    }),
    exitMessageText: jest.fn(),
    getDiffHandler: jest.fn(),
    getAssetsBackupHandler: jest.fn(),
    setSignalHandler: jest.fn(),
  };
});

// mock data transfer
jest.mock('@balerion/data-transfer', () => {
  const acutal = jest.requireActual('@balerion/data-transfer');
  return {
    ...acutal,
    balerion: {
      ...acutal.balerion,
      providers: {
        ...acutal.balerion.providers,
        createLocalBalerionSourceProvider: jest.fn().mockReturnValue({ name: 'testLocalSource' }),
        createLocalBalerionDestinationProvider: jest.fn().mockReturnValue({ name: 'testLocalDest' }),
        createRemoteBalerionDestinationProvider: jest
          .fn()
          .mockReturnValue({ name: 'testRemoteDest' }),
      },
    },
    engine: {
      ...acutal.engine,
      createTransferEngine() {
        return {
          transfer: jest.fn(() => {
            return {
              engine: {},
            };
          }),
          progress: {
            on: jest.fn(),
            stream: {
              on: jest.fn(),
            },
          },
          sourceProvider: { name: 'testSource' },
          destinationProvider: { name: 'testDestination' },
          diagnostics: {
            on: jest.fn().mockReturnThis(),
            onDiagnostic: jest.fn().mockReturnThis(),
          },
          onSchemaDiff: jest.fn(),
          addErrorHandler: jest.fn(),
        };
      },
    },
  };
});

describe('Transfer', () => {
  // mock command utils

  // console spies
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  const destinationUrl = new URL('http://one.localhost/admin');
  const destinationToken = 'test-token';

  const sourceUrl = new URL('http://two.localhost/admin');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exits with error when no --to or --from is provided', async () => {
    await expectExit(1, async () => {
      await transferAction({ from: undefined, to: undefined } as any);
    });

    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/one source/i));

    expect(
      mockDataTransfer.balerion.providers.createRemoteBalerionDestinationProvider
    ).not.toHaveBeenCalled();
  });

  it('exits with error when both --to and --from are provided', async () => {
    await expectExit(1, async () => {
      await transferAction({ from: sourceUrl, to: destinationUrl } as any);
    });

    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/one source/i));

    expect(
      mockDataTransfer.balerion.providers.createRemoteBalerionDestinationProvider
    ).not.toHaveBeenCalled();
  });

  describe('--to', () => {
    it('exits with error when auth is not provided', async () => {
      await expectExit(1, async () => {
        await transferAction({ from: undefined, to: destinationUrl } as any);
      });

      expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/missing token/i));

      expect(
        mockDataTransfer.balerion.providers.createRemoteBalerionDestinationProvider
      ).not.toHaveBeenCalled();
    });

    it('uses destination url and token provided by user', async () => {
      await expectExit(0, async () => {
        await transferAction({
          from: undefined,
          to: destinationUrl,
          toToken: destinationToken,
        } as any);
      });

      expect(console.error).not.toHaveBeenCalled();
      expect(
        mockDataTransfer.balerion.providers.createRemoteBalerionDestinationProvider
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          url: destinationUrl,
          auth: {
            type: 'token',
            token: destinationToken,
          },
        })
      );
    });

    it('uses local Balerion source when from is not specified', async () => {
      await expectExit(0, async () => {
        await transferAction({
          from: undefined,
          to: destinationUrl,
          toToken: destinationToken,
        } as any);
      });

      expect(console.error).not.toHaveBeenCalled();
      expect(mockDataTransfer.balerion.providers.createLocalBalerionSourceProvider).toHaveBeenCalled();
      expect(
        mockDataTransfer.balerion.providers.createRemoteBalerionDestinationProvider
      ).toHaveBeenCalled();
    });
  });

  it.todo('uses local Balerion destination when to is not specified');

  it('uses restore as the default strategy', async () => {
    await expectExit(0, async () => {
      await transferAction({
        from: undefined,
        to: destinationUrl,
        toToken: destinationToken,
      } as any);
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(
      mockDataTransfer.balerion.providers.createRemoteBalerionDestinationProvider
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: 'restore',
      })
    );
  });
});
