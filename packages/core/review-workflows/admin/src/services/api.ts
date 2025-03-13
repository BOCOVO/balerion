import { adminApi } from '@balerion/admin/balerion-admin';

const reviewWorkflowsApi = adminApi.enhanceEndpoints({
  addTagTypes: ['ReviewWorkflow', 'ReviewWorkflowStages', 'Document', 'ContentTypeSettings'],
});

export { reviewWorkflowsApi };
