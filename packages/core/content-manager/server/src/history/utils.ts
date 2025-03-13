import type { Core } from '@balerion/types';

type HistoryServices = typeof import('./services').services;

function getService<T extends keyof HistoryServices>(balerion: Core.Balerion, name: T) {
  // Cast is needed because the return type of balerion.service is too vague
  return balerion.service(`plugin::content-manager.${name}`) as ReturnType<HistoryServices[T]>;
}

export { getService };
