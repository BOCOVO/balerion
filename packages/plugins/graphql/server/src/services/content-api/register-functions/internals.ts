import type { Context } from '../../types';

const registerInternals = ({ registry, balerion }: Context) => {
  const { buildInternalTypes } = balerion.plugin('graphql').service('internals');

  const internalTypes = buildInternalTypes({ balerion });

  for (const [kind, definitions] of Object.entries(internalTypes)) {
    registry.registerMany(Object.entries(definitions as any), { kind });
  }
};

export { registerInternals };
