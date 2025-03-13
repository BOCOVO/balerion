---
title: Source
tags:
  - providers
  - data-transfer
  - experimental
---

# Local Balerion Source Provider

This provider will retrieve data from an initialized `balerion` instance using its Entity Service and Query Engine.

## Provider Options

The accepted options are defined in `ILocalFileSourceProviderOptions`.

```typescript
  getBalerion(): Balerion.Balerion | Promise<Balerion.Balerion>; // return an initialized instance of Balerion

  autoDestroy?: boolean; // shut down the instance returned by getBalerion() at the end of the transfer
```
