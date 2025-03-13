import type { Core } from '@balerion/types';

import type { Services } from './services';

export const getService = <TName extends keyof Services>(
  name: TName,
  { balerion }: { balerion: Core.Balerion } = { balerion: global.balerion }
): Services[TName] => {
  return balerion.plugin('documentation').service<Services[TName]>(name);
};

export default {
  getService,
};
