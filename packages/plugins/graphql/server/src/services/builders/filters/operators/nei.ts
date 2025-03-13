import type * as Nexus from 'nexus';

const NEI_FIELD_NAME = 'nei';

export default () => ({
  fieldName: NEI_FIELD_NAME,

  balerionOperator: '$nei',

  add(t: Nexus.blocks.ObjectDefinitionBlock<string>, type: string) {
    t.field(NEI_FIELD_NAME, { type });
  },
});
