import { createContext } from '../components/Context';
import { RBAC } from '../core/apis/rbac';
import { Router } from '../core/apis/router';

import type { BalerionApp } from '../BalerionApp';

/* -------------------------------------------------------------------------------------------------
 * BalerionApp
 * -----------------------------------------------------------------------------------------------*/
interface BalerionAppContextValue
  extends Pick<
      BalerionApp,
      | 'customFields'
      | 'getPlugin'
      | 'getAdminInjectedComponents'
      | 'plugins'
      | 'runHookParallel'
      | 'runHookSeries'
    >,
    Pick<Router, 'menu' | 'settings'> {
  components: BalerionApp['library']['components'];
  fields: BalerionApp['library']['fields'];
  rbac: RBAC;
  runHookWaterfall: <TData>(
    name: Parameters<BalerionApp['runHookWaterfall']>[0],
    initialValue: TData
  ) => TData;
}

const [BalerionAppProvider, useBalerionApp] = createContext<BalerionAppContextValue>('BalerionApp');

export { BalerionAppProvider, useBalerionApp };
export type { BalerionAppContextValue };
