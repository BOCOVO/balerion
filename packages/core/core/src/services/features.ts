/**
 * The features service is responsible for managing features within balerion,
 * including interacting with the feature configuration file to know
 * which are enabled and disabled.
 */

import type { Core, Modules } from '@balerion/types';

type FeatureName = keyof Modules.Features.FeaturesConfig['future'];

const createFeaturesService = (balerion: Core.Balerion): Modules.Features.FeaturesService => {
  const service: Modules.Features.FeaturesService = {
    get config() {
      return balerion.config.get<Modules.Features.FeaturesService['config']>('features');
    },
    future: {
      isEnabled(futureFlagName: string): boolean {
        return service.config?.future?.[futureFlagName as FeatureName] === true;
      },
    },
  };

  return service;
};

export { createFeaturesService };
export type FeaturesService = Modules.Features.FeaturesService;
