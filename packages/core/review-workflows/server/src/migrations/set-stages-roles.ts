import { STAGE_TRANSITION_UID, STAGE_MODEL_UID } from '../constants/workflows';
import { getService } from '../utils';

/**
 * Migrate review workflow stages to have RBAC permissions for all roles.
 */
async function migrateReviewWorkflowStagesRoles({ oldContentTypes, contentTypes }: any) {
  const hadRolePermissions = !!oldContentTypes?.[STAGE_MODEL_UID]?.attributes?.permissions;
  const hasRolePermissions = !!contentTypes?.[STAGE_MODEL_UID]?.attributes?.permissions;

  // If the stage content type did not have permissions in the previous version
  // then we set the permissions of every stage to be every current role in the app.
  // This ensures consistent behaviour when upgrading to a balerion version with review workflows RBAC.
  if (!hadRolePermissions && hasRolePermissions) {
    const roleUID = 'admin::role';
    balerion.log.info(
      `Migrating all existing review workflow stages to have RBAC permissions for all ${roleUID}.`
    );

    const stagePermissionsService = getService('stage-permissions');

    const stages = await balerion.db.query(STAGE_MODEL_UID).findMany();
    const roles = await balerion.db.query(roleUID).findMany();

    // Collect the permissions to add and group them by stage id.
    const groupedPermissions = {} as any;
    roles
      .map((role) => role.id)
      .forEach((roleId) => {
        stages
          .map((stage) => stage.id)
          .forEach((stageId) => {
            if (!groupedPermissions[stageId]) {
              groupedPermissions[stageId] = [];
            }

            groupedPermissions[stageId].push({
              roleId,
              fromStage: stageId,
              action: STAGE_TRANSITION_UID,
            });
          });
      });

    for (const [stageId, permissions] of Object.entries(groupedPermissions)) {
      const numericalStageId = Number(stageId);

      if (Number.isNaN(numericalStageId)) {
        balerion.log.warn(
          `Unable to apply ${roleUID} migration for ${STAGE_MODEL_UID} with id ${stageId}. The stage does not have a numerical id.`
        );
        continue;
      }

      // Register the permissions for this stage
      const stagePermissions = await stagePermissionsService.registerMany(permissions);

      // Update the stage with its new permissions
      await balerion.db.query(STAGE_MODEL_UID).update({
        where: { id: numericalStageId },
        data: {
          permissions: stagePermissions.flat().map((permission: any) => permission.id),
        },
      });
    }
  }
}

export default migrateReviewWorkflowStagesRoles;
