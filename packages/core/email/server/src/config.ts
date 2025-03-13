import type { BalerionConfig } from './types';

export const config: BalerionConfig = {
  default: {
    provider: 'sendmail',
    providerOptions: {},
    settings: {
      defaultFrom: 'Balerion <no-reply@balerion.io>',
    },
  },
  validator() {},
};
