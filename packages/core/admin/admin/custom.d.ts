/// <reference types="vite/client" />

import { type BalerionTheme } from '@strapi/design-system';

import type { Modules } from '@balerion/types';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends BalerionTheme {}
}

interface BrowserBalerion {
  backendURL: string;
  isEE: boolean;
  future: {
    isEnabled: (name: keyof NonNullable<Modules.Features.FeaturesConfig['future']>) => boolean;
  };
  features: {
    SSO: 'sso';
    AUDIT_LOGS: 'audit-logs';
    isEnabled: (featureName?: string) => boolean;
  };
  flags: {
    promoteEE?: boolean;
    nps?: boolean;
  };
  projectType: 'Community' | 'Enterprise';
  telemetryDisabled: boolean;
}

declare global {
  interface Window {
    balerion: BrowserBalerion;
  }
}
