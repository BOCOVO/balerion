import type { Plugin } from '@balerion/types';
import { controllers } from './controllers';
import { services } from './services';
import { routes } from './routes';
import { getService } from './utils';
import { historyVersion } from './models/history-version';

/**
 * Check once if the feature is enabled before loading it,
 * so that we can assume it is enabled in the other files.
 */
const getFeature = (): Partial<Plugin.LoadedPlugin> => {
  if (balerion.ee.features.isEnabled('cms-content-history')) {
    return {
      register({ balerion }) {
        balerion.get('models').add(historyVersion);
      },
      bootstrap({ balerion }) {
        // Start recording history and saving history versions
        getService(balerion, 'lifecycles').bootstrap();
      },
      destroy({ balerion }) {
        getService(balerion, 'lifecycles').destroy();
      },
      controllers,
      services,
      routes,
    };
  }

  /**
   * Keep registering the model to avoid losing the data if the feature is disabled,
   * or if the license expires.
   */
  return {
    register({ balerion }) {
      balerion.get('models').add(historyVersion);
    },
  };
};

export default getFeature();
