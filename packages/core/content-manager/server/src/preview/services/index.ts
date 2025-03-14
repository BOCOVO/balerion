import type { Plugin } from '@balerion/types';

import { createPreviewService } from './preview';
import { createPreviewConfigService } from './preview-config';

export const services = {
  preview: createPreviewService,
  'preview-config': createPreviewConfigService,
} satisfies Plugin.LoadedPlugin['services'];
