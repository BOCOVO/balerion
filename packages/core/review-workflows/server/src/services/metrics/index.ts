import '@balerion/types';

export const sendDidCreateStage = async () => {
  balerion.telemetry.send('didCreateStage', {});
};

export const sendDidEditStage = async () => {
  balerion.telemetry.send('didEditStage', {});
};

export const sendDidDeleteStage = async () => {
  balerion.telemetry.send('didDeleteStage', {});
};

export const sendDidChangeEntryStage = async () => {
  balerion.telemetry.send('didChangeEntryStage', {});
};

export const sendDidCreateWorkflow = async (
  workflowId: string,
  hasRequiredStageToPublish: boolean
) => {
  balerion.telemetry.send('didCreateWorkflow', { workflowId, hasRequiredStageToPublish });
};

export const sendDidEditWorkflow = async (
  workflowId: string,
  hasRequiredStageToPublish: boolean
) => {
  balerion.telemetry.send('didEditWorkflow', { workflowId, hasRequiredStageToPublish });
};

export const sendDidEditAssignee = async (fromId: any, toId: any) => {
  balerion.telemetry.send('didEditAssignee', { from: fromId, to: toId });
};

export const sendDidSendReviewWorkflowPropertiesOnceAWeek = async (
  numberOfActiveWorkflows: number,
  avgStagesCount: number,
  maxStagesCount: number,
  activatedContentTypes: number
) => {
  balerion.telemetry.send('didSendReviewWorkflowPropertiesOnceAWeek', {
    groupProperties: {
      numberOfActiveWorkflows,
      avgStagesCount,
      maxStagesCount,
      activatedContentTypes,
    },
  });
};

export default {
  sendDidCreateStage,
  sendDidEditStage,
  sendDidDeleteStage,
  sendDidChangeEntryStage,
  sendDidCreateWorkflow,
  sendDidEditWorkflow,
  sendDidSendReviewWorkflowPropertiesOnceAWeek,
  sendDidEditAssignee,
};
