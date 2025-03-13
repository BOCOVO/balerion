import type { Core, Struct } from '@balerion/types';
import type { TypeRegistry } from '../../type-registry';

const registerComponent = (
  contentType: Struct.ComponentSchema,
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

  const { getComponentName } = getService('utils').naming;
  const { KINDS } = getService('constants');

  const name = getComponentName(contentType);
  const definition = builders.buildTypeDefinition(contentType);

  registry.register(name, definition, { kind: KINDS.component, contentType });
};

export { registerComponent };
