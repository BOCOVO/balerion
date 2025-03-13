import type { Internal, Schema } from '@balerion/types';

import type { Context } from '../../types';

export default ({ balerion }: Context) => ({
  buildComponentResolver({
    contentTypeUID,
    attributeName,
  }: {
    contentTypeUID: Internal.UID.ContentType;
    attributeName: string;
  }) {
    const { transformArgs } = balerion.plugin('graphql').service('builders').utils;

    return async (parent: any, args: any, ctx: any) => {
      const contentType = balerion.getModel(contentTypeUID);

      const { component: componentName } = contentType.attributes[
        attributeName
      ] as Schema.Attribute.Component;

      const component = balerion.getModel(componentName);

      const transformedArgs = transformArgs(args, { contentType: component, usePagination: true });
      await balerion.contentAPI.validate.query(transformedArgs, component, {
        auth: ctx?.state?.auth,
      });

      const sanitizedQuery = await balerion.contentAPI.sanitize.query(transformedArgs, component, {
        auth: ctx?.state?.auth,
      });

      const dbQuery = balerion.get('query-params').transform(component.uid, sanitizedQuery);

      return balerion.db?.query(contentTypeUID).load(parent, attributeName, dbQuery);
    };
  },
});
