import type { Core } from '@balerion/types';
import type { EmailConfig, SendOptions } from './types';

interface EmailProvider {
  send: (options: SendOptions) => Promise<any>;
}

interface EmailProviderModule {
  init: (
    options: EmailConfig['providerOptions'],
    settings: EmailConfig['settings']
  ) => EmailProvider;
  name?: string;
  provider?: string;
}

const createProvider = (emailConfig: EmailConfig) => {
  const providerName = emailConfig.provider.toLowerCase();
  let provider: EmailProviderModule;

  let modulePath: string;
  try {
    modulePath = require.resolve(`@balerion/provider-email-${providerName}`);
  } catch (error) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'MODULE_NOT_FOUND'
    ) {
      modulePath = providerName;
    } else {
      throw error;
    }
  }

  try {
    provider = require(modulePath);
  } catch (err) {
    throw new Error(`Could not load email provider "${providerName}".`);
  }

  return provider.init(emailConfig.providerOptions, emailConfig.settings);
};

export const bootstrap = async ({ balerion }: { balerion: Core.Balerion }) => {
  const emailConfig: EmailConfig = balerion.config.get('plugin::email');
  balerion.plugin('email').provider = createProvider(emailConfig);

  // Add permissions
  const actions = [
    {
      section: 'settings',
      category: 'email',
      displayName: 'Access the Email Settings page',
      uid: 'settings.read',
      pluginName: 'email',
    },
  ];

  await balerion.service('admin::permission').actionProvider.registerMany(actions);
};
