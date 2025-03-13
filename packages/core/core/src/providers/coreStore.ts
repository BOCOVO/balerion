import { defineProvider } from './provider';
import { createCoreStore, coreStoreModel } from '../services/core-store';

export default defineProvider({
  init(balerion) {
    balerion.get('models').add(coreStoreModel);
    balerion.add('coreStore', () => createCoreStore({ db: balerion.db }));
  },
});
