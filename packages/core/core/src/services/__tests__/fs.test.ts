import path from 'path';
import fse from 'fs-extra';
import fs from '../fs';

jest.mock('fs-extra', () => ({
  ensureFile: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
}));

describe('Balerion fs utils', () => {
  const balerion = {
    dirs: { dist: { root: '/tmp' }, app: { root: '/tmp' } },
  };

  test('Provides new functions', () => {
    const balerionFS = fs(balerion);

    expect(balerionFS.writeAppFile).toBeInstanceOf(Function);
    expect(balerionFS.writePluginFile).toBeInstanceOf(Function);
  });

  describe('Write App File', () => {
    test('Makes sure the path exists and writes', async () => {
      const balerionFS = fs(balerion);

      const content = '';

      await balerionFS.writeAppFile('test', content);

      expect(fse.ensureFile).toHaveBeenCalledWith(path.join('/', 'tmp', 'test'));
      expect(fse.writeFile).toHaveBeenCalledWith(path.join('/', 'tmp', 'test'), content);
    });

    test('Normalize the path to avoid relative access to folders in parent directories', async () => {
      const balerionFS = fs(balerion);

      const content = '';

      await balerionFS.writeAppFile('../../test', content);

      expect(fse.ensureFile).toHaveBeenCalledWith(path.join('/', 'tmp', 'test'));
      expect(fse.writeFile).toHaveBeenCalledWith(path.join('/', 'tmp', 'test'), content);
    });

    test('Works with array path', async () => {
      const balerionFS = fs(balerion);

      const content = '';

      await balerionFS.writeAppFile(['test', 'sub', 'path'], content);

      expect(fse.ensureFile).toHaveBeenCalledWith(path.join('/', 'tmp', 'test', 'sub', 'path'));
      expect(fse.writeFile).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'test', 'sub', 'path'),
        content
      );
    });
  });

  describe('Write Plugin File', () => {
    test('Scopes the writes in the extensions folder', async () => {
      const balerionFS = fs(balerion);

      const content = '';

      balerionFS.writeAppFile = jest.fn(() => Promise.resolve());

      await balerionFS.writePluginFile('users-permissions', ['test', 'sub', 'path'], content);

      expect(balerionFS.writeAppFile).toHaveBeenCalledWith(
        'extensions/users-permissions/test/sub/path',
        content
      );
    });
  });
});
