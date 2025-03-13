import _ from 'lodash';
import type { Core, Struct } from '@balerion/types';
import { getGlobalId } from '../domain/content-type';

export default async function loadAdmin(balerion: Core.Balerion) {
  // balerion.admin = require('@balerion/admin/balerion-server');

  balerion.get('services').add(`admin::`, balerion.admin?.services);
  balerion.get('controllers').add(`admin::`, balerion.admin?.controllers);
  balerion.get('content-types').add(`admin::`, formatContentTypes(balerion.admin?.contentTypes ?? {}));
  balerion.get('policies').add(`admin::`, balerion.admin?.policies);
  balerion.get('middlewares').add(`admin::`, balerion.admin?.middlewares);

  const userAdminConfig = balerion.config.get('admin');
  balerion.get('config').set('admin', _.merge(balerion.admin?.config, userAdminConfig));
}

const formatContentTypes = (contentTypes: Record<string, { schema: Struct.ContentTypeSchema }>) => {
  Object.values(contentTypes).forEach((definition) => {
    const { schema } = definition;

    Object.assign(schema, {
      plugin: 'admin',
      globalId: getGlobalId(schema, 'admin'),
    });
  });

  return contentTypes;
};
