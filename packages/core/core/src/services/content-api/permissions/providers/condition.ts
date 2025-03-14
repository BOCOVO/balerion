import { providerFactory } from '@balerion/utils';

export interface Condition {
  name: string;
  [key: string]: unknown;
}

export default (options = {}) => {
  const provider = providerFactory(options);

  return {
    ...provider,

    async register(condition: Condition) {
      if (balerion.isLoaded) {
        throw new Error(`You can't register new conditions outside the bootstrap function.`);
      }

      return provider.register(condition.name, condition);
    },
  };
};
