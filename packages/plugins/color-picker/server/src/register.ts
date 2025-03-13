export const register = ({ balerion }: any) => {
  balerion.customFields.register({
    name: 'color',
    plugin: 'color-picker',
    type: 'string',
  });
};
