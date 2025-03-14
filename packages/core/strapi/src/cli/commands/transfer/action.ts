import { isObject } from 'lodash/fp';
import { engine as engineDataTransfer, balerion as balerionDataTransfer } from '@balerion/data-transfer';

import {
  buildTransferTable,
  createBalerionInstance,
  DEFAULT_IGNORED_CONTENT_TYPES,
  formatDiagnostic,
  loadersFactory,
  exitMessageText,
  abortTransfer,
  getTransferTelemetryPayload,
  setSignalHandler,
  getDiffHandler,
  getAssetsBackupHandler,
  parseRestoreFromOptions,
} from '../../utils/data-transfer';
import { exitWith } from '../../utils/helpers';

const { createTransferEngine } = engineDataTransfer;
const {
  providers: {
    createRemoteBalerionDestinationProvider,
    createLocalBalerionSourceProvider,
    createLocalBalerionDestinationProvider,
    createRemoteBalerionSourceProvider,
  },
} = balerionDataTransfer;

interface CmdOptions {
  from?: URL;
  fromToken: string;
  to: URL;
  toToken: string;
  verbose?: boolean;
  only?: (keyof engineDataTransfer.TransferGroupFilter)[];
  exclude?: (keyof engineDataTransfer.TransferGroupFilter)[];
  throttle?: number;
  force?: boolean;
}
/**
 * Transfer command.
 *
 * Transfers data between local Balerion and remote Balerion instances
 */
export default async (opts: CmdOptions) => {
  // Validate inputs from Commander
  if (!isObject(opts)) {
    exitWith(1, 'Could not parse command arguments');
  }

  if (!(opts.from || opts.to) || (opts.from && opts.to)) {
    exitWith(1, 'Exactly one source (from) or destination (to) option must be provided');
  }

  const balerion = await createBalerionInstance();
  let source;
  let destination;

  // if no URL provided, use local Balerion
  if (!opts.from) {
    source = createLocalBalerionSourceProvider({
      getBalerion: () => balerion,
    });
  }
  // if URL provided, set up a remote source provider
  else {
    if (!opts.fromToken) {
      exitWith(1, 'Missing token for remote destination');
    }

    source = createRemoteBalerionSourceProvider({
      getBalerion: () => balerion,
      url: opts.from,
      auth: {
        type: 'token',
        token: opts.fromToken,
      },
    });
  }

  // if no URL provided, use local Balerion
  if (!opts.to) {
    destination = createLocalBalerionDestinationProvider({
      getBalerion: () => balerion,
      strategy: 'restore',
      restore: parseRestoreFromOptions(opts),
    });
  }
  // if URL provided, set up a remote destination provider
  else {
    if (!opts.toToken) {
      exitWith(1, 'Missing token for remote destination');
    }

    destination = createRemoteBalerionDestinationProvider({
      url: opts.to,
      auth: {
        type: 'token',
        token: opts.toToken,
      },
      strategy: 'restore',
      restore: parseRestoreFromOptions(opts),
    });
  }

  if (!source || !destination) {
    exitWith(1, 'Could not create providers');
  }

  const engine = createTransferEngine(source, destination, {
    versionStrategy: 'exact',
    schemaStrategy: 'strict',
    exclude: opts.exclude,
    only: opts.only,
    throttle: opts.throttle,
    transforms: {
      links: [
        {
          filter(link) {
            return (
              !DEFAULT_IGNORED_CONTENT_TYPES.includes(link.left.type) &&
              !DEFAULT_IGNORED_CONTENT_TYPES.includes(link.right.type)
            );
          },
        },
      ],
      entities: [
        {
          filter(entity) {
            return !DEFAULT_IGNORED_CONTENT_TYPES.includes(entity.type);
          },
        },
      ],
    },
  });

  engine.diagnostics.onDiagnostic(formatDiagnostic('transfer', opts.verbose));

  const progress = engine.progress.stream;

  const { updateLoader } = loadersFactory();

  engine.onSchemaDiff(getDiffHandler(engine, { force: opts.force, action: 'transfer' }));

  engine.addErrorHandler(
    'ASSETS_DIRECTORY_ERR',
    getAssetsBackupHandler(engine, { force: opts.force, action: 'transfer' })
  );

  progress.on(`stage::start`, ({ stage, data }) => {
    updateLoader(stage, data).start();
  });

  progress.on('stage::finish', ({ stage, data }) => {
    updateLoader(stage, data).succeed();
  });

  progress.on('stage::progress', ({ stage, data }) => {
    updateLoader(stage, data);
  });

  progress.on('stage::error', ({ stage, data }) => {
    updateLoader(stage, data).fail();
  });

  progress.on('transfer::start', async () => {
    console.log(`Starting transfer...`);

    await balerion.telemetry.send('didDEITSProcessStart', getTransferTelemetryPayload(engine));
  });

  let results: Awaited<ReturnType<typeof engine.transfer>>;
  try {
    // Abort transfer if user interrupts process
    setSignalHandler(() => abortTransfer({ engine, balerion }));

    results = await engine.transfer();

    // Note: we need to await telemetry or else the process ends before it is sent
    await balerion.telemetry.send('didDEITSProcessFinish', getTransferTelemetryPayload(engine));

    try {
      const table = buildTransferTable(results.engine);
      console.log(table?.toString());
    } catch (e) {
      console.error('There was an error displaying the results of the transfer.');
    }

    exitWith(0, exitMessageText('transfer'));
  } catch (e) {
    await balerion.telemetry.send('didDEITSProcessFail', getTransferTelemetryPayload(engine));
    exitWith(1, exitMessageText('transfer', true));
  }
};
