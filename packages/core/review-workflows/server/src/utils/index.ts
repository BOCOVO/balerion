import type { Core } from '@balerion/types';

export const getAdminService = (
  name: string,
  { balerion }: { balerion: Core.Balerion } = { balerion: global.balerion }
) => {
  return balerion.service(`admin::${name}`);
};

export const getService = (name: string, { balerion } = { balerion: global.balerion }) => {
  return balerion.plugin('review-workflows').service(name);
};

export default {
  getAdminService,
  getService,
};
