import type { Core } from '@balerion/types';

export default (balerion: Core.Balerion) => {
  balerion.get('validators').set('content-api', { input: [], query: [] });
};
