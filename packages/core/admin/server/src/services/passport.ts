import passport from 'koa-passport';
import type { Strategy } from 'passport-local';
import { isFunction } from 'lodash/fp';

import createLocalStrategy from './passport/local-strategy';

const authEventsMapper = {
  onConnectionSuccess: 'admin.auth.success',
  onConnectionError: 'admin.auth.error',
};

const valueIsFunctionType = ([, value]: [any, any]) => isFunction(value);
const keyIsValidEventName = ([key]: any) => {
  return Object.keys(balerion.service('admin::passport').authEventsMapper).includes(key);
};

const getPassportStrategies = () => [createLocalStrategy(balerion)] as Strategy[];

const registerAuthEvents = () => {
  // @ts-expect-error - TODO: migrate auth service to TS
  const { events = {} } = balerion.config.get('admin.auth', {});
  const { authEventsMapper } = balerion.service('admin::passport');

  const eventList = Object.entries(events).filter(keyIsValidEventName).filter(valueIsFunctionType);

  for (const [eventName, handler] of eventList) {
    // TODO - TS: ensure the handler is an EventHub.Listener
    balerion.eventHub.on(authEventsMapper[eventName], handler as any);
  }
};

const init = () => {
  balerion
    .service('admin::passport')
    .getPassportStrategies()
    .forEach((strategy: Strategy) => passport.use(strategy));

  registerAuthEvents();

  return passport.initialize();
};

export default { init, getPassportStrategies, authEventsMapper };
