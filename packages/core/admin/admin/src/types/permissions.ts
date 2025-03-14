import type { Permission } from '../features/Auth';

type SettingsPermissions =
  | 'api-tokens'
  | 'project-settings'
  | 'roles'
  | 'transfer-tokens'
  | 'users'
  | 'webhooks';

type CRUDPermissions = {
  main?: Permission[];
  read: Permission[];
  create?: Permission[];
  update: Permission[];
  delete?: Permission[];
} & { [key: string]: Permission[] };

interface PermissionMap {
  contentManager: {
    main: Permission[];
    collectionTypesConfigurations: Permission[];
    singleTypesConfigurations: Permission[];
    componentsConfigurations: Permission[];
  };
  marketplace: Pick<CRUDPermissions, 'main' | 'read'>;
  settings: Record<SettingsPermissions, CRUDPermissions> & {
    plugins: Pick<CRUDPermissions, 'read' | 'main'>;
  };
}

export { PermissionMap };
