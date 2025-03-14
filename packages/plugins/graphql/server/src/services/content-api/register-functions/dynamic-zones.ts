import type { Core, Struct } from '@balerion/types';
import type { TypeRegistry } from '../../type-registry';

const registerDynamicZonesDefinition = (
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
    attributes: { isDynamicZone },
  } = getService('utils');
  const { KINDS } = getService('constants');

  const { attributes } = contentType;

  const dynamicZoneAttributes = Object.keys(attributes).filter((attributeName) =>
    isDynamicZone(attributes[attributeName])
  );

  for (const attributeName of dynamicZoneAttributes) {
    const attribute = attributes[attributeName];
    const dzName = naming.getDynamicZoneName(contentType, attributeName);
    const dzInputName = naming.getDynamicZoneInputName(contentType, attributeName);

    const [type, input] = builders.buildDynamicZoneDefinition(attribute, dzName, dzInputName);

    const baseConfig = {
      contentType,
      attributeName,
      attribute,
    };

    registry.register(dzName, type, { kind: KINDS.dynamicZone, ...baseConfig });
    registry.register(dzInputName, input, { kind: KINDS.input, ...baseConfig });
  }
};

export { registerDynamicZonesDefinition };
