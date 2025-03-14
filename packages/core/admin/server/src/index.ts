import _ from 'lodash';

import bootstrap from './bootstrap';
import register from './register';
import destroy from './destroy';
import config from './config';
import policies from './policies';
import routes from './routes';
import services from './services';
import controllers from './controllers';
import contentTypes from './content-types';
import middlewares from './middlewares';

// eslint-disable-next-line import/no-mutable-exports
const admin = {
  bootstrap,
  register,
  destroy,
  config,
  policies,
  routes,
  services,
  controllers,
  contentTypes,
  middlewares,
};

export default admin;
