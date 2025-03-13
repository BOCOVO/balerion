'use strict';

const {
  balerion: {
    providers: { createLocalBalerionSourceProvider },
  },
  file: {
    providers: { createLocalFileDestinationProvider },
  },
  engine: { createTransferEngine },
} = require('@balerion/data-transfer');
const { createBalerion, compileBalerion } = require('@balerion/balerion');
const path = require('path');

/**
 * Export the data from a balerion project.
 * This script should be run as `node <path-to>/dts-export.js [exportFilePath]` from the
 * root directory of a balerion project e.g. `/examples/kitchensink`.
 */
const createDataset = async () => {
  let args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error('Please provide the dataset path name as a parameter.');
    process.exit(1);
  }

  const datasetPath = path.resolve(args[0]);

  const balerion = await createBalerionInstance();

  const source = createSourceProvider(balerion);
  const destination = createDestinationProvider(datasetPath);

  const engine = createTransferEngine(source, destination, {
    versionStrategy: 'ignore',
    schemaStrategy: 'ignore',
  });

  engine.diagnostics.onDiagnostic(console.log);

  try {
    const results = await engine.transfer();
    const { destination, engine: engineResults } = results;

    const relativeArchivePath = path.relative(process.cwd(), destination.file.path);

    console.log(`Dataset exported to: ${relativeArchivePath}`);
    console.log('The export contains:');
    console.log(`  - ${engineResults.schemas?.count ?? 0} schemas`);
    console.log(`  - ${engineResults.entities?.count ?? 0} entities`);
    console.log(`  - ${engineResults.links?.count ?? 0} links`);
    console.log(`  - ${engineResults.assets?.count ?? 0} assets`);
    console.log(`  - ${engineResults.configuration?.count ?? 0} configs`);

    process.exit(0);
  } catch (e) {
    console.error('Export process failed.');
    console.error(e);
    process.exit(1);
  }
};

const createSourceProvider = (balerion) =>
  createLocalBalerionSourceProvider({
    async getBalerion() {
      return balerion;
    },
  });

const createDestinationProvider = (datasetPath) => {
  return createLocalFileDestinationProvider({
    file: { path: datasetPath },
    encryption: { enabled: false },
    compression: { enabled: true },
  });
};

const createBalerionInstance = async (logLevel = 'error') => {
  const appContext = await compileBalerion();
  const app = createBalerion(appContext);

  app.log.level = logLevel;
  return app.load();
};

createDataset().finally();
