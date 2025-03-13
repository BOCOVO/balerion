import type { Core } from '@balerion/types';
import { getService } from '../utils';

const sendDidInviteUser = async () => {
  const numberOfUsers = await getService('user').count();
  const numberOfRoles = await getService('role').count();
  balerion.telemetry.send('didInviteUser', {
    groupProperties: { numberOfRoles, numberOfUsers },
  });
};

const sendDidUpdateRolePermissions = async () => {
  balerion.telemetry.send('didUpdateRolePermissions');
};

const sendDidChangeInterfaceLanguage = async () => {
  const languagesInUse = await getService('user').getLanguagesInUse();
  // This event is anonymous
  balerion.telemetry.send('didChangeInterfaceLanguage', { userProperties: { languagesInUse } });
};

const sendUpdateProjectInformation = async (balerion: Core.Balerion) => {
  const numberOfActiveAdminUsers = await getService('user').count({ isActive: true });
  const numberOfAdminUsers = await getService('user').count();

  balerion.telemetry.send('didUpdateProjectInformation', {
    groupProperties: { numberOfActiveAdminUsers, numberOfAdminUsers },
  });
};

const startCron = (balerion: Core.Balerion) => {
  balerion.cron.add({
    sendProjectInformation: {
      task: () => sendUpdateProjectInformation(balerion),
      options: '0 0 0 * * *',
    },
  });
};

export default {
  sendDidInviteUser,
  sendDidUpdateRolePermissions,
  sendDidChangeInterfaceLanguage,
  sendUpdateProjectInformation,
  startCron,
};
