---
title: Destination
tags:
  - providers
  - data-transfer
  - experimental
---

# Balerion Remote Destination Provider

The Balerion remote destination provider connects to a remote Balerion websocket server and sends messages to move between stages and push data.

## Provider Options

The remote destination provider accepts the same `restore` and `strategy` options from local Balerion destination provider, plus `url`, `auth`, and `retryMessageOptions` described below.

```typescript
interface ITransferTokenAuth {
  type: 'token'; // the name of the auth strategy
  token: string; // the transfer token
}

export interface IRemoteBalerionDestinationProviderOptions
  extends Pick<ILocalBalerionDestinationProviderOptions, 'restore' | 'strategy'> {
  url: URL; // the url of the remote Balerion admin
  auth?: ITransferTokenAuth;
  retryMessageOptions?: {
    retryMessageTimeout: number; // milliseconds to wait for a response from a message
    retryMessageMaxRetries: number; // max number of retries for a message before aborting transfer
  };
}
```

Note: `url` must include the protocol `https` or `http` which will then be converted to `wss` or `ws` to make the connection. A secure connection is strongly recommended, especially given the high access level that the transfer token provides.
