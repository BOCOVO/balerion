import type { Core } from '@balerion/types';

export const destroyOnSignal = (balerion: Core.Balerion) => {
  let signalReceived = false;

  // For unknown reasons, we receive signals 2 times.
  // As a temporary fix, we ignore the signals received after the first one.

  const terminateBalerion = async () => {
    if (!signalReceived) {
      signalReceived = true;
      await balerion.destroy();
      process.exit();
    }
  };

  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, terminateBalerion);
  });
};
