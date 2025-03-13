import type * as Nexus from 'nexus';

const GTE_FIELD_NAME = 'gte';

export default () => ({
  fieldName: GTE_FIELD_NAME,

  balerionOperator: '$gte',

  add(t: Nexus.blocks.ObjectDefinitionBlock<string>, type: string) {
    t.field(GTE_FIELD_NAME, { type });
  },
});
