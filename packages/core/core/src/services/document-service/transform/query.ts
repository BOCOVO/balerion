import type { UID } from '@balerion/types';

import { curry, assoc } from 'lodash/fp';

const transformParamsToQuery = curry((uid: UID.Schema, params: any) => {
  const query = balerion.get('query-params').transform(uid, params);

  return assoc('where', { ...params?.lookup, ...query.where }, query);
});

export { transformParamsToQuery };
