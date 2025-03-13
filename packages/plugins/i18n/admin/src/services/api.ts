import { adminApi } from '@balerion/admin/balerion-admin';

const i18nApi = adminApi.enhanceEndpoints({
  addTagTypes: ['Locale'],
});

export { i18nApi };
