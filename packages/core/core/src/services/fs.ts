import path from 'path';
import fse from 'fs-extra';

import type { Core } from '@balerion/types';

interface BalerionFS {
  writeAppFile(optPath: string | string[], data: string): Promise<void>;
  writePluginFile(plugin: string, optPath: string | string[], data: string): Promise<void>;
  removeAppFile(optPath: string | string[]): Promise<void>;
  appendFile(optPath: string | string[], data: string): void;
}

/**
 * create balerion fs layer
 */
export default (balerion: Core.Balerion) => {
  function normalizePath(optPath: string | string[]) {
    const filePath = Array.isArray(optPath) ? optPath.join('/') : optPath;

    const normalizedPath = path.normalize(filePath).replace(/^\/?(\.\/|\.\.\/)+/, '');

    return path.resolve(balerion.dirs.app.root, normalizedPath);
  }

  const balerionFS: BalerionFS = {
    /**
     * Writes a file in a balerion app
     * @param {Array|string} optPath - file path
     * @param {string} data - content
     */
    writeAppFile(optPath, data) {
      const writePath = normalizePath(optPath);
      return fse.ensureFile(writePath).then(() => fse.writeFile(writePath, data));
    },

    /**
     * Writes a file in a plugin extensions folder
     * @param {string} plugin - plugin name
     * @param {Array|string} optPath - path to file
     * @param {string} data - content
     */
    writePluginFile(plugin, optPath, data) {
      const newPath = ['extensions', plugin].concat(optPath).join('/');
      return balerionFS.writeAppFile(newPath, data);
    },

    /**
     * Removes a file in balerion app
     */
    removeAppFile(optPath) {
      const removePath = normalizePath(optPath);
      return fse.remove(removePath);
    },

    /**
     * Appends a file in balerion app
     */
    appendFile(optPath, data) {
      const writePath = normalizePath(optPath);
      return fse.appendFileSync(writePath, data);
    },
  };

  return balerionFS;
};
