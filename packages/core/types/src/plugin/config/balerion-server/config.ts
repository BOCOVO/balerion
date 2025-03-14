import { env } from '@balerion/utils';

export interface Config {
  validator: (config: Record<string, unknown>) => void;
  default: Record<string, unknown> | ((opts: { env: typeof env }) => Record<string, unknown>);
}
