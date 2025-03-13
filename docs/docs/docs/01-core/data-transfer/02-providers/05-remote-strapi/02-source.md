---
title: Source
tags:
  - providers
  - data-transfer
  - experimental
---

# Balerion Remote Source Provider

The Balerion remote source provider connects to a remote Balerion websocket server and sends messages to move between stages and pull data.

## Provider Options

The remote source provider accepts `url`, `auth`, and `retryMessageOptions` described below.

```typescript
interface ITransferTokenAuth {
  type: 'token';
  token: string;
}

export interface IRemoteBalerionDestinationProviderOptions
  extends Pick<ILocalBalerionDestinationProviderOptions, 'restore' | 'strategy'> {
  url: URL;
  auth?: ITransferTokenAuth;
  retryMessageOptions?: {
    retryMessageTimeout: number; // milliseconds to wait for a response from a message
    retryMessageMaxRetries: number; // max number of retries for a message before aborting transfer
  };
}
```

Note: `url` must include the protocol `https` or `http` which will then be converted to `wss` or `ws` to make the connection. A secure connection is strongly recommended, especially given the high access level that the transfer token provides.
