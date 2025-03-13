import { pick } from 'lodash/fp';
import type { UID, Modules } from '@balerion/types';

const pickSelectionParams = <TUID extends UID.ContentType>(
  data: unknown
): Modules.Documents.Params.Pick<TUID, 'fields' | 'populate' | 'status'> => {
  return pick(['fields', 'populate', 'status'], data);
};

export { pickSelectionParams };
