import type { Core } from '@balerion/balerion';
import initSentryMiddleware from './middlewares/sentry';

export default async ({ balerion }: { balerion: Core.Balerion }) => {
  // Initialize the Sentry service exposed by this plugin
  initSentryMiddleware({ balerion });
};
