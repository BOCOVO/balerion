import type { Core, Struct } from '@balerion/types';
import { type TypeRegistry } from '../../type-registry';

const registerInputsDefinition = (
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

  const { getComponentInputName, getContentTypeInputName } = getService('utils').naming;
  const { KINDS } = getService('constants');

  const { modelType } = contentType;

  const type = (modelType === 'component' ? getComponentInputName : getContentTypeInputName).call(
    null,
    contentType
  );

  const definition = builders.buildInputType(contentType);

  registry.register(type, definition, { kind: KINDS.input, contentType });
};

export { registerInputsDefinition };
