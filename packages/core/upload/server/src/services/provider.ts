import { isFunction } from 'lodash/fp';
import { file as fileUtils } from '@balerion/utils';
import type { Core } from '@balerion/types';

import { Config, UploadableFile } from '../types';

export default ({ balerion }: { balerion: Core.Balerion }) => ({
  async checkFileSize(file: UploadableFile) {
    const { sizeLimit } = balerion.config.get<Config>('plugin::upload');
    await balerion.plugin('upload').provider.checkFileSize(file, { sizeLimit });
  },

  async upload(file: UploadableFile) {
    if (isFunction(balerion.plugin('upload').provider.uploadStream)) {
      file.stream = file.getStream();
      await balerion.plugin('upload').provider.uploadStream(file);

      delete file.stream;

      if ('filepath' in file) {
        delete file.filepath;
      }
    } else {
      file.buffer = await fileUtils.streamToBuffer(file.getStream());
      await balerion.plugin('upload').provider.upload(file);

      delete file.buffer;

      if ('filepath' in file) {
        delete file.filepath;
      }
    }
  },
});
