/* eslint-disable no-undef */
import { createRoot } from 'react-dom/client';

import { BalerionApp, BalerionAppConstructorArgs } from './BalerionApp';
import { getFetchClient } from './utils/getFetchClient';
import { createAbsoluteUrl } from './utils/urls';

import type { Modules } from '@balerion/types';

interface RenderAdminArgs {
  customisations: {
    register?: (app: BalerionApp) => Promise<void> | void;
    bootstrap?: (app: BalerionApp) => Promise<void> | void;
    config?: BalerionAppConstructorArgs['config'];
  };
  plugins: BalerionAppConstructorArgs['appPlugins'];
  features?: Modules.Features.FeaturesService['config'];
}

const renderAdmin = async (
  mountNode: HTMLElement | null,
  { plugins, customisations, features }: RenderAdminArgs
) => {
  if (!mountNode) {
    throw new Error('[@balerion/admin]: Could not find the root element to mount the admin app');
  }

  window.balerion = {
    /**
     * This ENV variable is passed from the balerion instance, by default no url is set
     * in the config and therefore the instance returns you an empty string so URLs are relative.
     *
     * To ensure that the backendURL is always set, we use the window.location.origin as a fallback.
     */
    backendURL: createAbsoluteUrl(process.env.BALERION_ADMIN_BACKEND_URL),
    isEE: false,
    telemetryDisabled: process.env.BALERION_TELEMETRY_DISABLED === 'true',
    future: {
      isEnabled: (name: keyof NonNullable<Modules.Features.FeaturesConfig['future']>) => {
        return features?.future?.[name] === true;
      },
    },
    // @ts-expect-error – there's pollution from the global scope of Node.
    features: {
      SSO: 'sso',
      AUDIT_LOGS: 'audit-logs',
      REVIEW_WORKFLOWS: 'review-workflows',
      /**
       * If we don't get the license then we know it's not EE
       * so no feature is enabled.
       */
      isEnabled: () => false,
    },
    projectType: 'Community',
    flags: {
      nps: false,
      promoteEE: true,
    },
  };

  const { get } = getFetchClient();

  interface ProjectType extends Pick<Window['balerion'], 'flags'> {
    isEE: boolean;
    features: {
      name: string;
    }[];
  }

  try {
    const {
      data: {
        data: { isEE, features, flags },
      },
    } = await get<{ data: ProjectType }>('/admin/project-type');

    window.balerion.isEE = isEE;
    window.balerion.flags = flags;
    window.balerion.features = {
      ...window.balerion.features,
      isEnabled: (featureName) => features.some((feature) => feature.name === featureName),
    };
    window.balerion.projectType = isEE ? 'Enterprise' : 'Community';
  } catch (err) {
    /**
     * If this fails, we simply don't activate any EE features.
     * Should we warn clearer in the UI?
     */
    console.error(err);
  }

  const app = new BalerionApp({
    config: customisations?.config,
    appPlugins: plugins,
  });

  await app.register(customisations?.register);
  await app.bootstrap(customisations?.bootstrap);
  await app.loadTrads(customisations?.config?.translations);

  createRoot(mountNode).render(app.render());

  if (
    typeof module !== 'undefined' &&
    module &&
    'hot' in module &&
    typeof module.hot === 'object' &&
    module.hot !== null &&
    'accept' in module.hot &&
    typeof module.hot.accept === 'function'
  ) {
    module.hot.accept();
  }

  if (typeof import.meta.hot?.accept === 'function') {
    import.meta.hot.accept();
  }
};

export { renderAdmin };
export type { RenderAdminArgs };
