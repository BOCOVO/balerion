import type { Core } from '@balerion/types';

type InputAttributes = {
  [key: string]: {
    type: string;
    customField?: string;
  };
};

export const convertCustomFieldType = (balerion: Core.Balerion) => {
  const allContentTypeSchemaAttributes = Object.values(balerion.contentTypes).map(
    (schema) => schema.attributes
  );

  const allComponentSchemaAttributes = Object.values(balerion.components).map(
    (schema) => schema.attributes
  );
  const allSchemasAttributes: InputAttributes[] = [
    ...allContentTypeSchemaAttributes,
    ...allComponentSchemaAttributes,
  ];

  for (const schemaAttrbutes of allSchemasAttributes) {
    for (const attribute of Object.values(schemaAttrbutes)) {
      if (attribute.type === 'customField') {
        const customField = balerion.get('custom-fields').get(attribute.customField);
        attribute.type = customField.type;
      }
    }
  }
};
