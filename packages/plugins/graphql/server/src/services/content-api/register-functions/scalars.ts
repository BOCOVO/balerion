import type { Context } from '../../types';

const registerScalars = ({ registry, balerion }: Context) => {
  const { service: getService } = balerion.plugin('graphql');

  const { scalars } = getService('internals');
  const { KINDS } = getService('constants');

  Object.entries(scalars).forEach(([name, definition]) => {
    registry.register(name, definition, { kind: KINDS.scalar });
  });
};

export { registerScalars };
