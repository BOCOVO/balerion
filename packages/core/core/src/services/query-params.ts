import { queryParams } from '@balerion/utils';
import type { Core, UID } from '@balerion/types';

export default (balerion: Core.Balerion) => {
  const { transformQueryParams } = queryParams.createTransformer({
    getModel: (uid: string) => balerion.getModel(uid as UID.Schema),
  });

  return {
    transform: transformQueryParams,
  };
};
