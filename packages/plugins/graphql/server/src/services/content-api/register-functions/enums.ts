import type { Core, Struct } from '@balerion/types';
import type { TypeRegistry } from '../../type-registry';

const registerEnumsDefinition = (
  contentType: Struct.Schema,
  {
    registry,
    balerion,
    builders,
  }: {
    registry: TypeRegistry;
    balerion: Core.Balerion;
    builders: any;
  }
) => {
  const { service: getService } = balerion.plugin('graphql');

  const {
    naming,
    attributes: { isEnumeration },
  } = getService('utils');
  const { KINDS } = getService('constants');

  const { attributes } = contentType;

  const enumAttributes = Object.keys(attributes).filter((attributeName) =>
    isEnumeration(attributes[attributeName])
  );

  for (const attributeName of enumAttributes) {
    const attribute = attributes[attributeName];

    const enumName = naming.getEnumName(contentType, attributeName);
    const enumDefinition = builders.buildEnumTypeDefinition(attribute, enumName);

    registry.register(enumName, enumDefinition, {
      kind: KINDS.enum,
      contentType,
      attributeName,
      attribute,
    });
  }
};

export { registerEnumsDefinition };
