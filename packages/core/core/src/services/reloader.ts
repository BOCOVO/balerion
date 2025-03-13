import type { Core } from '@balerion/types';

export const createReloader = (balerion: Core.Balerion) => {
  const state = {
    shouldReload: 0,
    isWatching: true,
  };

  function reload() {
    if (state.shouldReload > 0) {
      // Reset the reloading state
      state.shouldReload -= 1;
      reload.isReloading = false;
      return;
    }

    if (balerion.config.get('autoReload')) {
      process.send?.('reload');
    }
  }

  Object.defineProperty(reload, 'isWatching', {
    configurable: true,
    enumerable: true,
    set(value) {
      // Special state when the reloader is disabled temporarly (see GraphQL plugin example).
      if (state.isWatching === false && value === true) {
        state.shouldReload += 1;
      }
      state.isWatching = value;
    },
    get() {
      return state.isWatching;
    },
  });

  reload.isReloading = false;
  reload.isWatching = true;

  return reload;
};
