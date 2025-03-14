import type * as UID from '../../../uid';
import type * as Utils from '../../../utils';
import type * as AttributeUtils from './attributes';

/**
 * Represents the input data for a given content-type UID.
 *
 * This type evaluates the schema based on the given content-type UID, and extracts the attribute values
 * accordingly.
 *
 * It combines optional and required attributes, while excluding certain relational attributes
 * that don't target specific schemas like polymorphic relations.
 *
 * @template TSchemaUID - A unique identifier for a schema, extending {@link UID.Schema}.
 *
 * @remark
 * The attributes' values are customized to allow additional input formats that are going to be
 * transformed in the document service methods.
 *
 * For example, relational attributes can use the re-ordering API.
 *
 * @example
 * Defining input for a content type schema:
 *
 * ```typescript
 * import type { UID } from '@balerion/types';
 *
 * // Assume there's a schema with a UID of 'api::article.article'
 * type ArticleInput = Input<'api::article.article'>;
 *
 * // Example usage of ArticleInput with typed attributes
 * const articleData: ArticleInput = {
 *   title: 'My Article', // Required title property
 *   content: 'Content of the article', // Required content property
 * };
 * ```
 *
 * @example
 * Handling component schema with optional and required attributes:
 *
 * ```typescript
 * import type { UID } from '@balerion/types';
 *
 * // Assume there's a component with a UID of 'default.comment'
 * type CommentInput = Input<'default.comment'>;
 *
 * const commentData: CommentInput = {
 *   text: 'Great article!', // Required text property
 *   author: 'John Doe',     // Optional author property
 * };
 * ```
 */
export type Input<TSchemaUID extends UID.Schema> = AttributeUtils.GetValues<TSchemaUID>;

/**
 * Conditionally applies partial types to schema input data based on the extension status of schema registries.
 *
 * This type evaluates whether the schema registries have been extended.
 *
 * If so, it returns a partial version of `Input<TSchemaUID>`, otherwise it returns the default `Input` type.
 *
 * @template TSchemaUID - Represents a unique identifier for a schema, either content-type or component, extending {@link UID.Schema}.
 *
 * @remark
 * This type is particularly useful for ensuring backward compatibility within input data structures,
 * enabling flexibility during schema transitions or extensions without breaking existing data contracts.
 */
export type PartialInput<TSchemaUID extends UID.Schema> = Utils.If<
  Utils.Constants.AreSchemaRegistriesExtended,
  Partial<Input<TSchemaUID>>,
  Input<TSchemaUID>
>;
