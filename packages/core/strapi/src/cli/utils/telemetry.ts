import { machineID } from '@balerion/utils';

export const sendEvent = async (event: string, uuid: string) => {
  try {
    await fetch('https://analytics.balerion.io/api/v2/track', {
      method: 'POST',
      body: JSON.stringify({
        event,
        deviceId: machineID(),
        groupProperties: { projectId: uuid },
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Balerion-Event': event,
      },
    });
  } catch (e) {
    // ...
  }
};
