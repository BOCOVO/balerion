import type * as Nexus from 'nexus';
import type { Core } from '@balerion/types';

const NOT_FIELD_NAME = 'not';

export default ({ balerion }: { balerion: Core.Balerion }) => ({
  fieldName: NOT_FIELD_NAME,

  balerionOperator: '$not',

  add(t: Nexus.blocks.ObjectDefinitionBlock<string>, type: string) {
    const { naming, attributes } = balerion.plugin('graphql').service('utils');

    if (attributes.isGraphQLScalar({ type })) {
      t.field(NOT_FIELD_NAME, { type: naming.getScalarFilterInputTypeName(type) });
    } else {
      t.field(NOT_FIELD_NAME, { type });
    }
  },
});
