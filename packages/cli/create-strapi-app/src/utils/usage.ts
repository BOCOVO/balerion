import os from 'os';
import _ from 'lodash';

import { Scope, StderrError } from '../types';

type TrackError = Error | string | StderrError;

// Add properties from the package.json balerion key in the metadata
function addPackageJsonBalerionMetadata(metadata: Record<string, unknown>, scope: Scope) {
  const { packageJsonBalerion = {} } = scope;

  return _.defaults(metadata, packageJsonBalerion);
}

const boolToString = (value: boolean | undefined) => (value === true).toString();

const getProperties = (scope: Scope, error?: TrackError) => {
  const eventProperties = {
    error: typeof error === 'string' ? error : error && error.message,
  };

  const userProperties = {
    os: os.type(),
    osPlatform: os.platform(),
    osArch: os.arch(),
    osRelease: os.release(),
    nodeVersion: process.versions.node,
  };

  const groupProperties = {
    version: scope.balerionVersion,
    docker: scope.docker,
    useYarn: scope.packageManager === 'yarn',
    packageManager: scope.packageManager,
    /** @deprecated */
    useTypescriptOnServer: boolToString(scope.useTypescript),
    /** @deprecated */
    useTypescriptOnAdmin: boolToString(scope.useTypescript),
    useTypescript: boolToString(scope.useTypescript),
    isHostedOnBalerionCloud: process.env.BALERION_HOSTING === 'balerion.cloud',
    noRun: boolToString(scope.runApp),
    projectId: scope.uuid,
    useExample: boolToString(scope.useExample),
    gitInit: boolToString(scope.gitInit),
    installDependencies: boolToString(scope.installDependencies),
  };

  return {
    eventProperties,
    userProperties,
    groupProperties: addPackageJsonBalerionMetadata(groupProperties, scope),
  };
};

function trackEvent(event: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    return fetch('https://analytics.balerion.io/api/v2/track', {
      method: 'POST',
      body: JSON.stringify({
        event,
        ...payload,
      }),
      signal: AbortSignal.timeout(1000),
      headers: {
        'Content-Type': 'application/json',
        'X-Balerion-Event': event,
      },
    }).catch(() => {});
  } catch (err) {
    /** ignore errors */
    return Promise.resolve();
  }
}

export async function trackError({ scope, error }: { scope: Scope; error?: TrackError }) {
  const properties = getProperties(scope, error);

  try {
    return await trackEvent('didNotCreateProject', {
      deviceId: scope.deviceId,
      ...properties,
    });
  } catch (err) {
    /** ignore errors */
    return Promise.resolve();
  }
}

export async function trackUsage({
  event,
  scope,
  error,
}: {
  event: string;
  scope: Scope;
  error?: TrackError;
}) {
  const properties = getProperties(scope, error);

  try {
    return await trackEvent(event, {
      deviceId: scope.deviceId,
      ...properties,
    });
  } catch (err) {
    /** ignore errors */
    return Promise.resolve();
  }
}
