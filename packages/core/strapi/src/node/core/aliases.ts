import path from 'node:path';
import { BalerionMonorepo } from './monorepo';

/**
 * The path mappings/aliases used by various tools in the monorepo to map imported modules to
 * source files in order to speed up rebuilding and avoid having a separate watcher process to build
 * from `src` to `lib`.
 *
 * This file is currently read by:
 * - Webpack when running the dev server (only when running in this monorepo)
 */
const devAliases: Record<string, string> = {
  '@balerion/admin/balerion-admin': './packages/core/admin/admin/src',
  '@balerion/content-manager/balerion-admin': './packages/core/content-manager/admin/src',
  '@balerion/content-type-builder/balerion-admin': './packages/core/content-type-builder/admin/src',
  '@balerion/email/balerion-admin': './packages/core/email/admin/src',
  '@balerion/upload/balerion-admin': './packages/core/upload/admin/src',
  '@balerion/plugin-color-picker/balerion-admin': './packages/plugins/color-picker/admin/src',
  '@balerion/plugin-documentation/balerion-admin': './packages/plugins/documentation/admin/src',
  '@balerion/plugin-graphql/balerion-admin': './packages/plugins/graphql/admin/src',
  '@balerion/i18n/balerion-admin': './packages/plugins/i18n/admin/src',
  '@balerion/plugin-sentry/balerion-admin': './packages/plugins/sentry/admin/src',
  '@balerion/plugin-users-permissions/balerion-admin': './packages/plugins/users-permissions/admin/src',
};

const getMonorepoAliases = ({ monorepo }: { monorepo?: BalerionMonorepo }) => {
  if (!monorepo?.path) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(devAliases).map(([key, modulePath]) => {
      return [key, path.join(monorepo.path, modulePath)];
    })
  );
};

export { getMonorepoAliases };
