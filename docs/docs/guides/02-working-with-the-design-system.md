---
title: Working with the Design System
---

## Linking the Balerion Design System

Follow these steps to use a local version of the Balerion design system with the Balerion monorepo

In your copy of the design system run `yarn build` to generate the bundle.

In the Balerion monorepo link your local copy of the design system with [`yarn link`](https://yarnpkg.com/cli/link#gatsby-focus-wrapper):

```
yarn link -r ../<relative-path-to-balerion-design-system>
```

Running yarn build in `examples/getstarted` should now use your local version of the design system.

To revert back to the released version of the design system use [`yarn unlink`](https://yarnpkg.com/cli/unlink#usage):

```
yarn unlink ../<relative-path-to-balerion-design-system>
```
