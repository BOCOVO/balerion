import type { Modules } from '@balerion/types';

export interface I18nBaseQuery {
  plugins?: {
    i18n?: {
      locale?: string;
      relatedEntityId?: Modules.Documents.ID;
    };
  };
}
