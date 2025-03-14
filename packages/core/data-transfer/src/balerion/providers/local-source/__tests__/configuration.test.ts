import { Readable } from 'stream';

import {
  collect,
  createMockedQueryBuilder,
  getBalerionFactory,
} from '../../../../__tests__/test-utils';
import { createConfigurationStream } from '../configuration';

describe('Configuration', () => {
  test('Should return configuration from multiple data sources, wrapped in the same data format', async () => {
    const queryBuilder = createMockedQueryBuilder({
      'balerion::core-store': [
        // Values must be stringified JSON for the core-store
        { id: 1, key: 'foo', value: '{}' },
        { id: 2, key: 'bar', value: '{}' },
      ],
      'balerion::webhook': [
        { id: 1, url: '/foo', headers: {}, events: [], enabled: false },
        { id: 2, url: '/bar', headers: {}, events: [], enabled: true },
        { id: 3, url: '/foobar', headers: {}, events: [], enabled: true },
      ],
    });

    const balerion = getBalerionFactory({ db: { queryBuilder } })();

    const stream = createConfigurationStream(balerion);

    expect(stream).toBeInstanceOf(Readable);

    const results = await collect(stream);

    expect(results).toHaveLength(5);

    results.forEach((result) => {
      expect(result).toMatchObject(
        expect.objectContaining({
          type: expect.stringMatching(/^(core-store|webhook)$/),
          value: expect.any(Object),
        })
      );
    });
  });
});
