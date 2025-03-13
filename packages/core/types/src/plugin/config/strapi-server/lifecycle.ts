import type { Balerion } from '../../../core';

export type LifecycleMethod = ({ balerion }: { balerion: Balerion }) => Promise<unknown> | unknown;

export type Register = LifecycleMethod;
export type Bootstrap = LifecycleMethod;
export type Destroy = LifecycleMethod;
