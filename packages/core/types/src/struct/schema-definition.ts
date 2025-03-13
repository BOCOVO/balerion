import type { Schema } from './schema';

/**
 * Represents a generic Schema before being loaded by Balerion (e.g. app or user defined schemas)
 *
 * @internal
 */
export type SchemaDefinition = Omit<Schema, 'uid' | 'attributes'> & {
  attributes: Record<string, Record<string, unknown>>;
};
