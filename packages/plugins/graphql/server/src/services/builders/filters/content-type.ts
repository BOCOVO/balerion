import { inputObjectType } from 'nexus';
import { contentTypes } from '@balerion/utils';
import type * as Nexus from 'nexus';
import type { Struct, Schema } from '@balerion/types';
import type { Context } from '../../types';

export default ({ balerion }: Context) => {
  const rootLevelOperators = () => {
    const { operators } = balerion.plugin('graphql').service('builders').filters;

    return [operators.and, operators.or, operators.not];
  };

  const addScalarAttribute = (
    builder: Nexus.blocks.InputDefinitionBlock<any>,
    attributeName: string,
    attribute: Schema.Attribute.AnyAttribute
  ) => {
    const { naming, mappers } = balerion.plugin('graphql').service('utils');

    const gqlType = mappers.balerionScalarToGraphQLScalar(attribute.type);

    builder.field(attributeName, { type: naming.getScalarFilterInputTypeName(gqlType) });
  };

  const addRelationalAttribute = (
    builder: Nexus.blocks.InputDefinitionBlock<any>,
    attributeName: string,
    attribute: Schema.Attribute.Relation
  ) => {
    const utils = balerion.plugin('graphql').service('utils');
    const extension = balerion.plugin('graphql').service('extension');
    const { getFiltersInputTypeName } = utils.naming;
    const { isMorphRelation } = utils.attributes;

    const model = 'target' in attribute && balerion.getModel(attribute.target);

    // If there is no model corresponding to the attribute configuration
    // or if the attribute is a polymorphic relation, then ignore it
    if (!model || isMorphRelation(attribute)) return;

    // If the target model is disabled, then ignore it too
    if (extension.shadowCRUD(model.uid).isDisabled()) return;

    builder.field(attributeName, { type: getFiltersInputTypeName(model) });
  };

  const addComponentAttribute = (
    builder: Nexus.blocks.InputDefinitionBlock<any>,
    attributeName: string,
    attribute: Schema.Attribute.Component
  ) => {
    const utils = balerion.plugin('graphql').service('utils');
    const extension = balerion.plugin('graphql').service('extension');
    const { getFiltersInputTypeName } = utils.naming;

    const component = balerion.getModel(attribute.component);

    // If there is no component corresponding to the attribute configuration, then ignore it
    if (!component) return;

    // If the component is disabled, then ignore it too
    if (extension.shadowCRUD(component.uid).isDisabled()) return;

    builder.field(attributeName, { type: getFiltersInputTypeName(component) });
  };

  const buildContentTypeFilters = (contentType: Struct.ContentTypeSchema) => {
    const utils = balerion.plugin('graphql').service('utils');
    const extension = balerion.plugin('graphql').service('extension');

    const { getFiltersInputTypeName, getScalarFilterInputTypeName } = utils.naming;
    const { isBalerionScalar, isRelation, isComponent } = utils.attributes;

    const { attributes } = contentType;

    const filtersTypeName = getFiltersInputTypeName(contentType);

    return inputObjectType({
      name: filtersTypeName,

      definition(t) {
        const validAttributes = Object.entries(attributes)
          // Remove private attributes
          .filter(([attributeName]) => !contentTypes.isPrivateAttribute(contentType, attributeName))
          // Remove attributes that have been disabled using the shadow CRUD extension API
          .filter(([attributeName]) =>
            extension.shadowCRUD(contentType.uid).field(attributeName).hasFiltersEnabeld()
          );

        const isIDFilterEnabled = extension
          .shadowCRUD(contentType.uid)
          .field('documentId')
          .hasFiltersEnabeld();

        // Add an ID filter to the collection types
        if (contentType.kind === 'collectionType' && isIDFilterEnabled) {
          t.field('documentId', { type: getScalarFilterInputTypeName('ID') });
        }

        // Add every defined attribute
        for (const [attributeName, attribute] of validAttributes) {
          // Handle scalars
          if (isBalerionScalar(attribute)) {
            addScalarAttribute(t, attributeName, attribute);
          }

          // Handle relations
          else if (isRelation(attribute)) {
            addRelationalAttribute(t, attributeName, attribute as Schema.Attribute.Relation);
          }

          // Handle components
          else if (isComponent(attribute)) {
            addComponentAttribute(t, attributeName, attribute as Schema.Attribute.Component);
          }
        }

        // Conditional clauses
        for (const operator of rootLevelOperators()) {
          operator.add(t, filtersTypeName);
        }
      },
    });
  };

  return {
    buildContentTypeFilters,
  };
};
