import { ExtendableContext } from 'koa';

import type { Balerion } from '.';

export type PolicyContext = Omit<ExtendableContext, 'is'> & {
  type: string;
  is(name: string): boolean;
};

export type PolicyHandler<TConfig = unknown> = (
  ctx: PolicyContext,
  cfg: TConfig,
  opts: { balerion: Balerion }
) => boolean | undefined;

export type Policy<TConfig = unknown> =
  | {
      name: string;
      validator?: (config: unknown) => boolean;
      handler: PolicyHandler<TConfig>;
    }
  | PolicyHandler<TConfig>;
