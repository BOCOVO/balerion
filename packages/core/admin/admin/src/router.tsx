/* eslint-disable check-file/filename-naming-convention */

import { RouteObject } from 'react-router-dom';

import { AuthPage } from './pages/Auth/AuthPage';
import { ROUTES_CE } from './pages/Settings/constants';

/**
 * These are routes we don't want to be able to be changed by plugins.
 */
const getImmutableRoutes = (): RouteObject[] => [
  {
    path: 'usecase',
    lazy: async () => {
      const { PrivateUseCasePage } = await import('./pages/UseCasePage');

      return {
        Component: PrivateUseCasePage,
      };
    },
  },
  {
    path: 'auth/:authType',
    element: <AuthPage />,
  },
];

const getInitialRoutes = (): RouteObject[] => [
  {
    index: true,
    lazy: async () => {
      const { HomePageCE } = await import('./pages/Home/HomePage');

      return {
        Component: HomePageCE,
      };
    },
  },
  {
    path: 'me',
    lazy: async () => {
      const { ProfilePage } = await import('./pages/ProfilePage');

      return {
        Component: ProfilePage,
      };
    },
  },
  {
    path: 'marketplace',
    lazy: async () => {
      const { ProtectedMarketplacePage } = await import('./pages/Marketplace/MarketplacePage');

      return {
        Component: ProtectedMarketplacePage,
      };
    },
  },
  {
    path: 'settings/*',
    lazy: async () => {
      const { Layout } = await import('./pages/Settings/Layout');

      return {
        Component: Layout,
      };
    },
    children: [
      {
        path: 'application-infos',
        lazy: async () => {
          const { ApplicationInfoPage } = await import(
            './pages/Settings/pages/ApplicationInfo/ApplicationInfoPage'
          );

          return {
            Component: ApplicationInfoPage,
          };
        },
      },
      // ...Object.values(this.settings).flatMap(({ links }) =>
      //   links.map(({ to, Component }) => ({
      //     path: `${to}/*`,
      //     element: (
      //       <React.Suspense fallback={<Page.Loading />}>
      //         <Component />
      //       </React.Suspense>
      //     ),
      //   }))
      // ),
      ...[...ROUTES_CE].filter(
        (route, index, refArray) => refArray.findIndex((obj) => obj.path === route.path) === index
      ),
    ],
  },
];

export { getImmutableRoutes, getInitialRoutes };
