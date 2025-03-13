import type * as Nexus from 'nexus';

const ENDS_WITH_FIELD_NAME = 'endsWith';

export default () => ({
  fieldName: ENDS_WITH_FIELD_NAME,

  balerionOperator: '$endsWith',

  add(t: Nexus.blocks.ObjectDefinitionBlock<string>, type: string) {
    t.field(ENDS_WITH_FIELD_NAME, { type });
  },
});
