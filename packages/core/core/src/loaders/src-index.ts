import { resolve } from 'path';
import { statSync, existsSync } from 'fs';
import { yup, importDefault } from '@balerion/utils';

import type { Core } from '@balerion/types';

const srcSchema = yup
  .object()
  .shape({
    bootstrap: yup.mixed().isFunction(),
    register: yup.mixed().isFunction(),
    destroy: yup.mixed().isFunction(),
  })
  .noUnknown();

const validateSrcIndex = (srcIndex: unknown) => {
  return srcSchema.validateSync(srcIndex, { strict: true, abortEarly: false });
};

export default (balerion: Core.Balerion) => {
  if (!existsSync(balerion.dirs.dist.src)) {
    return;
  }

  const pathToSrcIndex = resolve(balerion.dirs.dist.src, 'index.js');
  if (!existsSync(pathToSrcIndex) || statSync(pathToSrcIndex).isDirectory()) {
    return {};
  }

  const srcIndex = importDefault(pathToSrcIndex);

  try {
    validateSrcIndex(srcIndex);
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      balerion.stopWithError({ message: `Invalid file \`./src/index.js\`: ${e.message}` });
    }

    throw e;
  }

  balerion.app = srcIndex;
};
