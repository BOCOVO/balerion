import { adminApi } from '@balerion/admin/balerion-admin';

const contentManagerApi = adminApi.enhanceEndpoints({
  addTagTypes: [
    'ComponentConfiguration',
    'ContentTypesConfiguration',
    'ContentTypeSettings',
    'Document',
    'InitialData',
    'HistoryVersion',
    'Relations',
    'UidAvailability',
    'RecentDocumentList',
  ],
});

export { contentManagerApi };
