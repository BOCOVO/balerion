import type { Core, Modules } from '@balerion/types';

const createCustomFields = (balerion: Core.Balerion): Modules.CustomFields.CustomFields => {
  return {
    register(customField) {
      balerion.get('custom-fields').add(customField);
    },
  };
};

export default createCustomFields;
