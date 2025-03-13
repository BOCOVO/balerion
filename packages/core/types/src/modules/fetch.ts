import type { ProxyAgent } from 'undici';

/**
 * balerion.fetch interface is currently an identical wrapper for Node fetch()
 * See createBalerionFetch in balerion/utils
 * However, we want to retain the ability to extend it in the future.
 * */

export interface Fetch {
  (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>;
  dispatcher?: ProxyAgent;
}
