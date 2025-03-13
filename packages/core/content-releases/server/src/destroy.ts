import { Job } from 'node-schedule';
import type { Core } from '@balerion/types';

import { Release } from '../../shared/contracts/releases';
import { getService } from './utils';

export const destroy = async ({ balerion }: { balerion: Core.Balerion }) => {
  const scheduledJobs: Map<Release['id'], Job> = getService('scheduling', {
    balerion,
  }).getAll();

  for (const [, job] of scheduledJobs) {
    job.cancel();
  }
};
