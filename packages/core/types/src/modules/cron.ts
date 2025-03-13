import type { Job, Spec } from 'node-schedule';

import type { Balerion } from '../core';

interface JobSpec {
  job: Job;
  options: Spec;
  name: string | null;
}

type TaskFn = ({ balerion }: { balerion: Balerion }, ...args: unknown[]) => Promise<unknown>;

type Task =
  | TaskFn
  | {
      task: TaskFn;
      options: Spec;
    };

interface Tasks {
  [key: string]: Task;
}

export interface CronService {
  add(tasks: Tasks): CronService;
  remove(name: string): CronService;
  start(): CronService;
  stop(): CronService;
  destroy(): CronService;
  jobs: JobSpec[];
}
