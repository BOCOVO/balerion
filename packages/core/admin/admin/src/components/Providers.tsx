import * as React from 'react';

import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import { AuthProvider } from '../features/Auth';
import { HistoryProvider } from '../features/BackButton';
import { ConfigurationProvider } from '../features/Configuration';
import { NotificationsProvider } from '../features/Notifications';
import { BalerionAppProvider } from '../features/BalerionApp';
import { TrackingProvider } from '../features/Tracking';

import { GuidedTourProvider } from './GuidedTour/Provider';
import { LanguageProvider } from './LanguageProvider';
import { Theme } from './Theme';

import type { Store } from '../core/store/configure';
import type { BalerionApp } from '../BalerionApp';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
  balerion: BalerionApp;
  store: Store;
}

const Providers = ({ children, balerion, store }: ProvidersProps) => {
  return (
    <BalerionAppProvider
      components={balerion.library.components}
      customFields={balerion.customFields}
      fields={balerion.library.fields}
      menu={balerion.router.menu}
      getAdminInjectedComponents={balerion.getAdminInjectedComponents}
      getPlugin={balerion.getPlugin}
      plugins={balerion.plugins}
      rbac={balerion.rbac}
      runHookParallel={balerion.runHookParallel}
      runHookWaterfall={(name, initialValue) => balerion.runHookWaterfall(name, initialValue, store)}
      runHookSeries={balerion.runHookSeries}
      settings={balerion.router.settings}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HistoryProvider>
              <LanguageProvider messages={balerion.configurations.translations}>
                <Theme themes={balerion.configurations.themes}>
                  <NotificationsProvider>
                    <TrackingProvider>
                      <GuidedTourProvider>
                        <ConfigurationProvider
                          defaultAuthLogo={balerion.configurations.authLogo}
                          defaultMenuLogo={balerion.configurations.menuLogo}
                          showReleaseNotification={balerion.configurations.notifications.releases}
                        >
                          {children}
                        </ConfigurationProvider>
                      </GuidedTourProvider>
                    </TrackingProvider>
                  </NotificationsProvider>
                </Theme>
              </LanguageProvider>
            </HistoryProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </BalerionAppProvider>
  );
};

export { Providers };
