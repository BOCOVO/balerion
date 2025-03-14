import { Readable } from 'stream';
import type { Core } from '@balerion/types';

import type { ILink } from '../../../../types';
import { createLinkQuery } from '../../queries/link';

/**
 * Create a Readable which will stream all the links from a Balerion instance
 */
export const createLinksStream = (balerion: Core.Balerion): Readable => {
  const uids = [...Object.keys(balerion.contentTypes), ...Object.keys(balerion.components)] as string[];

  // Async generator stream that returns every link from a Balerion instance
  return Readable.from(
    (async function* linkGenerator(): AsyncGenerator<ILink> {
      const query = createLinkQuery(balerion);

      for (const uid of uids) {
        const generator = query().generateAll(uid);

        for await (const link of generator) {
          yield link;
        }
      }
    })()
  );
};
