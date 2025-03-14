// import type { Common } from '@balerion/types';

import documentation, { type DocumentationService } from './documentation';
import override, { type OverrideService } from './override';

export default {
  documentation,
  override,
};

export type Services = {
  documentation: DocumentationService;
  override: OverrideService;
};
