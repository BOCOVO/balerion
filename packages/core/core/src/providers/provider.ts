import type { Core } from '@balerion/types';

export type Provider = {
  init?: (balerion: Core.Balerion) => void;
  register?: (balerion: Core.Balerion) => Promise<void>;
  bootstrap?: (balerion: Core.Balerion) => Promise<void>;
  destroy?: (balerion: Core.Balerion) => Promise<void>;
};

export const defineProvider = (provider: Provider) => provider;
