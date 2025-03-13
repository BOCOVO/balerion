import type { Core } from '@balerion/types';
import { createAPI } from './api';

const createContentAPI = (balerion: Core.Balerion) => {
  const opts = {
    prefix: balerion.config.get('api.rest.prefix', '/api'),
    type: 'content-api',
  };

  return createAPI(balerion, opts);
};

export { createContentAPI };
