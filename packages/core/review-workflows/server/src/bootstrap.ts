import { getAdminService, getService } from './utils';
import actions from './config/actions';

import defaultStages from './constants/default-stages.json';
import defaultWorkflow from './constants/default-workflow.json';
import webhookEvents from './constants/webhook-events';

/**
 * Initialize the default workflow if there is no workflow in the database
 */

async function initDefaultWorkflow() {
  const workflowsService = getService('workflows', { balerion });
  const stagesService = getService('stages', { balerion });

  const wfCount = await workflowsService.count();
  const stagesCount = await stagesService.count();

  // Check if there is nothing about review-workflow in DB
  // If any, the feature has already been initialized with a workflow and stages
  if (wfCount === 0 && stagesCount === 0) {
    const workflow = {
      ...defaultWorkflow,
      contentTypes: [],
      stages: defaultStages,
    };

    await workflowsService.create({ data: workflow });
  }
}

/**
 * Webhook store limits the events that can be triggered,
 * this function extends it with the events review workflows can trigger
 */
const registerWebhookEvents = async () =>
  Object.entries(webhookEvents).forEach(([eventKey, event]) =>
    balerion.get('webhookStore').addAllowedEvent(eventKey, event)
  );

export default async (args: any) => {
  // Permissions
  const { actionProvider } = getAdminService('permission');
  await actionProvider.registerMany(actions.reviewWorkflows);

  // Webhooks and events
  await registerWebhookEvents();
  await getService('workflow-weekly-metrics').registerCron();

  // Data initialization
  await initDefaultWorkflow();

  // Document service middleware
  const docsMiddlewares = getService('document-service-middlewares');
  balerion.documents.use(docsMiddlewares.assignStageOnCreate);
  balerion.documents.use(docsMiddlewares.handleStageOnUpdate);
  balerion.documents.use(docsMiddlewares.checkStageBeforePublish);
};
