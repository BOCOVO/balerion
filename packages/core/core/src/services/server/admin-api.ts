import type { Core } from '@balerion/types';
import { createAPI } from './api';

const createAdminAPI = (balerion: Core.Balerion) => {
  const opts = {
    prefix: '', // '/admin';
    type: 'admin',
  };

  return createAPI(balerion, opts);
};

export { createAdminAPI };
