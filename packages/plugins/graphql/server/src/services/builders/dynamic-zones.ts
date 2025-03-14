import { Kind, valueFromASTUntyped } from 'graphql';
import { omit } from 'lodash/fp';
import { unionType, scalarType } from 'nexus';
import { errors } from '@balerion/utils';
import type { Internal, Schema } from '@balerion/types';

import type { Context } from '../types';

const { ApplicationError } = errors;

export default ({ balerion }: Context) => {
  const buildTypeDefinition = (name: string, components: Internal.UID.Component[]) => {
    const { ERROR_TYPE_NAME } = balerion.plugin('graphql').service('constants');
    const isEmpty = components.length === 0;

    const componentsTypeNames = components.map((componentUID) => {
      const component = balerion.components[componentUID];

      if (!component) {
        throw new ApplicationError(
          `Trying to create a dynamic zone type with an unknown component: "${componentUID}"`
        );
      }

      return component.globalId;
    });

    return unionType({
      name,

      resolveType(obj) {
        if (isEmpty) {
          return ERROR_TYPE_NAME;
        }

        return balerion.components[obj.__component].globalId;
      },

      definition(t) {
        t.members(...componentsTypeNames, ERROR_TYPE_NAME);
      },
    });
  };

  const buildInputDefinition = (name: string, components: Internal.UID.Component[]) => {
    const parseData = (value: any) => {
      const component = Object.values(balerion.components).find(
        (component) => component.globalId === value.__typename
      );

      if (!component) {
        throw new ApplicationError(
          `Component not found. expected one of: ${components
            .map((uid) => balerion.components[uid].globalId)
            .join(', ')}`
        );
      }

      return {
        __component: component.uid,
        ...omit(['__typename'], value),
      };
    };

    return scalarType({
      name,

      serialize: (value) => value,

      parseValue: (value) => parseData(value),

      parseLiteral(ast, variables) {
        if (ast.kind !== Kind.OBJECT) {
          return undefined;
        }

        const value = valueFromASTUntyped(ast, variables);
        return parseData(value);
      },
    });
  };

  return {
    /**
     * Build a Nexus dynamic zone type from a Balerion dz attribute
     */
    buildDynamicZoneDefinition(
      definition: Schema.Attribute.DynamicZone,
      name: string,
      inputName: string
    ) {
      const { components } = definition;

      const typeDefinition = buildTypeDefinition(name, components);
      const inputDefinition = buildInputDefinition(inputName, components);

      return [typeDefinition, inputDefinition];
    },
  };
};
