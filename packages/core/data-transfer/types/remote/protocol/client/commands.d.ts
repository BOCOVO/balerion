import type { ILocalBalerionDestinationProviderOptions } from '../../../../balerion/providers';
import type { TransferMethod } from '../../../../balerion/remote/constants';

export type CommandMessage = { type: 'command' } & (InitCommand | EndCommand | StatusCommand);

export type Command = CommandMessage['command'];

export type GetCommandParams<T extends Command> = {
  [key in Command]: { command: key } & CommandMessage;
}[T] extends { params: infer U }
  ? U
  : never;

export type InitCommand = CreateCommand<
  'init',
  {
    options: Pick<ILocalBalerionDestinationProviderOptions, 'strategy' | 'restore'>;
    transfer: TransferMethod;
  }
>;
export type TransferKind = InitCommand['params']['transfer'];

export type EndCommand = CreateCommand<'end', { transferID: string }>;

export type StatusCommand = CreateCommand<'status'>;

type CreateCommand<T extends string, U extends Record<string, unknown> = never> = {
  type: 'command';
  command: T;
} & ([U] extends [never] ? unknown : { params: U });
