import type { UID, Modules } from '@balerion/types';

export type RepositoryFactoryMethod = <TContentTypeUID extends UID.ContentType>(
  uid: TContentTypeUID,
  entityValidator: Modules.EntityValidator.EntityValidator
) => Modules.Documents.ServiceInstance<TContentTypeUID>;

export const wrapInTransaction = (fn: (...args: any) => any) => {
  return (...args: any[]) => balerion.db.transaction?.(() => fn(...args));
};
