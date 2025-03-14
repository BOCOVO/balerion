/**
 *
 * App.js
 *
 */
import { Suspense, useEffect } from 'react';

import { Outlet } from 'react-router-dom';

import { Page } from './components/PageHelpers';
import { Providers } from './components/Providers';
import { LANGUAGE_LOCAL_STORAGE_KEY } from './reducer';

import type { Store } from './core/store/configure';
import type { BalerionApp } from './BalerionApp';

interface AppProps {
  balerion: BalerionApp;
  store: Store;
}

const App = ({ balerion, store }: AppProps) => {
  useEffect(() => {
    const language = localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY) || 'en';

    if (language) {
      document.documentElement.lang = language;
    }
  }, []);

  return (
    <Providers balerion={balerion} store={store}>
      <Suspense fallback={<Page.Loading />}>
        <Outlet />
      </Suspense>
    </Providers>
  );
};

export { App };
export type { AppProps };
