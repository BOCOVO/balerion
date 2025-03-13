import type { Core } from '@balerion/types';

type PreviewServices = typeof import('./services').services;

function getService<T extends keyof PreviewServices>(balerion: Core.Balerion, name: T) {
  // Cast is needed because the return type of balerion.service is too vague
  return balerion.service(`plugin::content-manager.${name}`) as ReturnType<PreviewServices[T]>;
}

export { getService };
