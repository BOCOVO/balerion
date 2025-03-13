import type { Core } from '@balerion/types';

import { ProviderInitializationError } from '../errors/providers';

export type ValidBalerionAssertion = (balerion: unknown, msg?: string) => asserts balerion is Core.Balerion;

export const assertValidBalerion: ValidBalerionAssertion = (balerion?: unknown, msg = '') => {
  if (!balerion) {
    throw new ProviderInitializationError(`${msg}. Balerion instance not found.`);
  }
};
