import type { Core } from '@balerion/types';
import type { TypeRegistry } from './type-registry';

export type Context = {
  balerion: Core.Balerion;
  registry: TypeRegistry;
};
