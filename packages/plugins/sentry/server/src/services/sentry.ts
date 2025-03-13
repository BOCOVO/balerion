import type { Core } from '@balerion/balerion';
import type { Config } from 'src/config';
import * as Sentry from '@sentry/node';

const createSentryService = (balerion: Core.Balerion) => {
  let isReady = false;
  let instance: typeof Sentry | null = null;

  // Retrieve user config and merge it with the default one
  const config = balerion.config.get('plugin::sentry') as Config;

  return {
    /**
     * Initialize Sentry service
     */
    init() {
      // Make sure there isn't a Sentry instance already running
      if (instance != null) {
        return this;
      }

      // Don't init Sentry if no DSN was provided
      if (!config.dsn) {
        balerion.log.info('@balerion/plugin-sentry is disabled because no Sentry DSN was provided');
        return this;
      }

      try {
        Sentry.init({
          dsn: config.dsn,
          environment: balerion.config.get('environment'),
          ...config.init,
        });

        // Store the successfully initialized Sentry instance
        instance = Sentry;
        isReady = true;
      } catch (error) {
        balerion.log.warn('Could not set up Sentry, make sure you entered a valid DSN');
      }

      return this;
    },

    /**
     * Expose Sentry instance through a getter
     */
    getInstance() {
      return instance;
    },

    /**
     * Higher level method to send exception events to Sentry
     */
    sendError(error: Error, configureScope?: (scope: Sentry.Scope) => void) {
      // Make sure Sentry is ready
      if (!isReady || !instance) {
        balerion.log.warn("Sentry wasn't properly initialized, cannot send event");
        return;
      }

      instance.withScope((scope) => {
        // Configure the Sentry scope using the provided callback
        if (configureScope && config.sendMetadata) {
          configureScope(scope);
        }

        // Actually send the Error to Sentry
        instance?.captureException(error);
      });
    },
  };
};

export default ({ balerion }: { balerion: Core.Balerion }) => createSentryService(balerion);
