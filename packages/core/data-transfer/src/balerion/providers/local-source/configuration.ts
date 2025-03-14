import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { set } from 'lodash/fp';
import type { Core } from '@balerion/types';

import type { IConfiguration } from '../../../../types';

/**
 * Create a readable stream that export the Balerion app configuration
 */
export const createConfigurationStream = (balerion: Core.Balerion): Readable => {
  return Readable.from(
    (async function* configurationGenerator(): AsyncGenerator<IConfiguration> {
      // Core Store
      const coreStoreStream = chain([
        balerion.db.queryBuilder('balerion::core-store').stream(),
        (data) => set('value', JSON.parse(data.value), data),
        wrapConfigurationItem('core-store'),
      ]);

      // Webhook
      const webhooksStream = chain([
        balerion.db.queryBuilder('balerion::webhook').stream(),
        wrapConfigurationItem('webhook'),
      ]);

      const streams = [coreStoreStream, webhooksStream];

      for (const stream of streams) {
        for await (const item of stream) {
          yield item;
        }
      }
    })()
  );
};

const wrapConfigurationItem = (type: 'core-store' | 'webhook') => (value: unknown) => ({
  type,
  value,
});
