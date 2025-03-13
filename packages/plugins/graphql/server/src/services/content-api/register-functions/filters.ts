import type { Core, Struct } from '@balerion/types';
import type { TypeRegistry } from '../../type-registry';

const registerFiltersDefinition = (
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

  const { getFiltersInputTypeName } = getService('utils').naming;
  const { KINDS } = getService('constants');

  const type = getFiltersInputTypeName(contentType);
  const definition = builders.buildContentTypeFilters(contentType);

  registry.register(type, definition, { kind: KINDS.filtersInput, contentType });
};

export { registerFiltersDefinition };
