import type { Core } from '@balerion/types';

export default (balerion: Core.Balerion) => {
  balerion.get('sanitizers').set('content-api', { input: [], output: [], query: [] });
};
