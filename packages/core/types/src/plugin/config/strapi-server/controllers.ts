import type * as Core from '../../../core';

// TODO Replace when we have WithBalerionCallback accessible
export type Controller = ({ balerion }: { balerion: Core.Balerion }) => Core.Controller;

export interface Controllers {
  [key: string]: Controller;
}
