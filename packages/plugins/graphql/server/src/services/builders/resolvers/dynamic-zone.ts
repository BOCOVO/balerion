import type { Internal } from '@balerion/types';

import type { Context } from '../../types';

export default ({ balerion }: Context) => ({
  buildDynamicZoneResolver({
    contentTypeUID,
    attributeName,
  }: {
    contentTypeUID: Internal.UID.ContentType;
    attributeName: string;
  }) {
    return async (parent: any) => {
      return balerion.db?.query(contentTypeUID).load(parent, attributeName);
    };
  },
});
