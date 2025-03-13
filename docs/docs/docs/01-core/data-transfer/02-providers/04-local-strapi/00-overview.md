---
title: Overview
tags:
  - experimental
  - providers
  - import
  - export
  - data-transfer
---

# Local Balerion Providers

The local Balerion provider allows using the local Balerion instance (the same project that the data transfer engine is being run from) as a data source.

Creating a local Balerion data provider requires passing in an initialized `balerion` server object to interact with that server's Entity Service and Query Engine to manage the data. Therefore if the local Balerion project cannot be started (due to errors), the providers cannot be used.

**Important**: When a transfer completes, the `balerion` object passed in is shut down automatically based on the `autoDestroy` option. If you are running a transfer via an external script, it is recommended to use `autoDestroy: true` to ensure it is shut down properly, but if you are running a transfer within a currently running Balerion instance you should set `autoDestroy: false` or your Balerion instance will be shut down at the end of the transfer.
