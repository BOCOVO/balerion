import type { Core, Modules } from '@balerion/types';
import { ProxyAgent } from 'undici';

// TODO: once core Node exposes a stable way to create a ProxyAgent we will use that instead of undici

// Create a wrapper for Node's Fetch API that applies a global proxy
export const createBalerionFetch = (balerion: Core.Balerion): Modules.Fetch.Fetch => {
  function balerionFetch(url: RequestInfo | URL, options?: RequestInit) {
    const fetchOptions = {
      ...(balerionFetch.dispatcher ? { dispatcher: balerionFetch.dispatcher } : {}),
      ...options,
    };
    balerion.log.debug(`Making request for ${url}`);
    return fetch(url, fetchOptions);
  }

  const proxy =
    balerion.config.get<ConstructorParameters<typeof ProxyAgent>[0]>('server.proxy.fetch') ||
    balerion.config.get<string>('server.proxy.global');

  if (proxy) {
    balerion.log.info(`Using proxy for Fetch requests: ${proxy}`);
    balerionFetch.dispatcher = new ProxyAgent(proxy);
  }

  return balerionFetch;
};

export type Fetch = Modules.Fetch.Fetch;
