const { resolve } = require('path');
const { CUSTOM_TRANSFER_TOKEN_ACCESS_KEY } = require('../constants');
const {
  file: {
    providers: { createLocalFileSourceProvider },
  },
  balerion: {
    providers: { createRemoteBalerionDestinationProvider },
  },
  engine: { createTransferEngine },
} = require('@balerion/data-transfer');

/**
 * Reset the DB and import data from a DTS dataset
 * This is meant to be used directly from a CLI test
 */
const resetDatabaseAndImportDataFromPath = async (filePath) => {
  const source = createSourceProvider(filePath);
  const destination = createDestinationProvider();

  const engine = createTransferEngine(source, destination, {
    versionStrategy: 'ignore',
    schemaStrategy: 'ignore',
  });

  engine.diagnostics.onDiagnostic(console.log);

  try {
    await engine.transfer();
  } catch (e) {
    console.error('Import process failed.');
    console.error(e);
    process.exit(1);
  }
};

const createSourceProvider = (filePath) =>
  createLocalFileSourceProvider({
    file: { path: resolve(filePath) },
    encryption: { enabled: false },
    compression: { enabled: true },
  });

const createDestinationProvider = () => {
  // TODO: When possible, use the local balerion destination provider instead
  //       For this we need to wait to have access to a Balerion instance
  return createRemoteBalerionDestinationProvider({
    url: new URL(`http://127.0.0.1:${process.env.PORT ?? 1337}/admin`),
    auth: { type: 'token', token: CUSTOM_TRANSFER_TOKEN_ACCESS_KEY },
    strategy: 'restore',
  });
};

module.exports = { resetDatabaseAndImportDataFromPath };
