export const PROJECT_PACKAGE_JSON = 'package.json';

export const PROJECT_APP_ALLOWED_ROOT_PATHS = ['src', 'config', 'public'];

export const PROJECT_PLUGIN_ALLOWED_ROOT_PATHS = ['admin', 'server'];

export const PROJECT_PLUGIN_ROOT_FILES = ['balerion-admin.js', 'balerion-server.js'];

export const PROJECT_CODE_EXTENSIONS = [
  // Source files
  'js',
  'mjs',
  'ts',
  // React files
  'jsx',
  'tsx',
];

export const PROJECT_JSON_EXTENSIONS = ['json'];

export const PROJECT_ALLOWED_EXTENSIONS = [...PROJECT_CODE_EXTENSIONS, ...PROJECT_JSON_EXTENSIONS];

export const SCOPED_BALERION_PACKAGE_PREFIX = '@balerion/';

export const BALERION_DEPENDENCY_NAME = `${SCOPED_BALERION_PACKAGE_PREFIX}balerion`;
