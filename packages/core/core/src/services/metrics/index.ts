/**
 * Balerion telemetry package.
 * You can learn more at https://docs.balerion.io/developer-docs/latest/getting-started/usage-information.html
 */

import { Job, scheduleJob } from 'node-schedule';
import type { Core } from '@balerion/types';

import wrapWithRateLimit from './rate-limiter';
import createSender from './sender';
import createMiddleware from './middleware';
import isTruthy from './is-truthy';

const LIMITED_EVENTS = [
  'didSaveMediaWithAlternativeText',
  'didSaveMediaWithCaption',
  'didDisableResponsiveDimensions',
  'didEnableResponsiveDimensions',
  'didInitializePluginUpload',
];

const createTelemetryInstance = (balerion: Core.Balerion) => {
  const uuid = balerion.config.get('uuid');
  const telemetryDisabled = balerion.config.get('packageJsonBalerion.telemetryDisabled');
  const isDisabled =
    !uuid || isTruthy(process.env.BALERION_TELEMETRY_DISABLED) || isTruthy(telemetryDisabled);

  const crons: Job[] = [];
  const sender = createSender(balerion);
  const sendEvent = wrapWithRateLimit(sender, { limitedEvents: LIMITED_EVENTS });

  return {
    get isDisabled() {
      return isDisabled;
    },

    register() {
      if (!isDisabled) {
        const pingCron = scheduleJob('0 0 12 * * *', () => sendEvent('ping'));
        crons.push(pingCron);

        balerion.server.use(createMiddleware({ sendEvent }));
      }
    },

    bootstrap() {},

    destroy() {
      // Clear open handles
      crons.forEach((cron) => cron.cancel());
    },

    async send(event: string, payload: Record<string, unknown> = {}) {
      if (isDisabled) return true;
      return sendEvent(event, payload);
    },
  };
};

export default createTelemetryInstance;
