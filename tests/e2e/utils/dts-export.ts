import type { Core } from '@balerion/balerion';

import dts from '@balerion/data-transfer';
import { createBalerion } from '@balerion/balerion';
import { ALLOWED_CONTENT_TYPES } from '../constants';

const {
  file: {
    providers: { createLocalFileDestinationProvider },
  },
  balerion: {
    providers: { createLocalBalerionSourceProvider },
  },
  engine: { createTransferEngine },
} = dts;

export const exportData = async (): Promise<void> => {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error('Please provide the export file name as a parameter.');
    process.exit(1);
  }

  const balerion = await createBalerionInstance();

  const source = createSourceProvider(balerion);
  const destination = createDestinationProvider(args[0]);

  const engine = createTransferEngine(source, destination, {
    versionStrategy: 'ignore', // for an export to file, versionStrategy will always be skipped
    schemaStrategy: 'ignore', // for an export to file, schemaStrategy will always be skipped
    transforms: {
      links: [
        {
          filter(link) {
            return (
              ALLOWED_CONTENT_TYPES.includes(link.left.type) &&
              ALLOWED_CONTENT_TYPES.includes(link.right.type)
            );
          },
        },
      ],
      entities: [
        {
          filter(entity) {
            return ALLOWED_CONTENT_TYPES.includes(entity.type);
          },
        },
      ],
    },
  });

  engine.diagnostics.onDiagnostic((diagnostic) => {
    if (diagnostic.kind !== 'info') console.log(diagnostic);
  });

  try {
    const results = await engine.transfer();

    console.log(JSON.stringify(results.engine, null, 2));
  } catch {
    console.error('Export process failed.');
    process.exit(1);
  }

  process.exit(0);
};

const createSourceProvider = (balerion: Core.Balerion) =>
  createLocalBalerionSourceProvider({
    async getBalerion() {
      return balerion;
    },
  });

const createDestinationProvider = (filePath: string) =>
  createLocalFileDestinationProvider({
    file: { path: filePath },
    encryption: { enabled: false },
    compression: { enabled: false },
  });

const createBalerionInstance = async (logLevel = 'error'): Promise<Core.Balerion> => {
  const app = createBalerion();

  app.log.level = logLevel;
  const loadedApp = await app.load();

  return loadedApp;
};
