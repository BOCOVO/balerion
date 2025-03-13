import type * as Nexus from 'nexus';

const EQI_FIELD_NAME = 'eqi';

export default () => ({
  fieldName: EQI_FIELD_NAME,

  balerionOperator: '$eqi',

  add(t: Nexus.blocks.ObjectDefinitionBlock<string>, type: string) {
    t.field(EQI_FIELD_NAME, { type });
  },
});
