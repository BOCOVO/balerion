import type { Core } from '@balerion/types';

import loadSrcIndex from './src-index';
import loadAPIs from './apis';
import loadMiddlewares from './middlewares';
import loadComponents from './components';
import loadPolicies from './policies';
import loadPlugins from './plugins';
import loadSanitizers from './sanitizers';
import loadValidators from './validators';

export async function loadApplicationContext(balerion: Core.Balerion) {
  await Promise.all([
    loadSrcIndex(balerion),
    loadSanitizers(balerion),
    loadValidators(balerion),
    loadPlugins(balerion),
    loadAPIs(balerion),
    loadComponents(balerion),
    loadMiddlewares(balerion),
    loadPolicies(balerion),
  ]);
}
