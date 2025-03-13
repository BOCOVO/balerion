import os from 'os';
import path from 'path';
import _ from 'lodash';
import isDocker from 'is-docker';
import ciEnv from 'ci-info';
import tsUtils from '@balerion/typescript-utils';
import { env, machineID } from '@balerion/utils';
import type { Core } from '@balerion/types';
import { generateAdminUserHash } from './admin-user-hash';

export interface Payload {
  eventProperties?: Record<string, unknown>;
  userProperties?: Record<string, unknown>;
  groupProperties?: Record<string, unknown>;
}

export type Sender = (
  event: string,
  payload?: Payload,
  opts?: Record<string, unknown>
) => Promise<boolean>;

const defaultQueryOpts = {
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' },
};

const ANALYTICS_URI = 'https://analytics.balerion.io';

/**
 * Add properties from the package.json balerion key in the metadata
 */
const addPackageJsonBalerionMetadata = (metadata: Record<string, unknown>, balerion: Core.Balerion) => {
  const { packageJsonBalerion = {} } = balerion.config;

  _.defaults(metadata, packageJsonBalerion);
};

/**
 * Create a send function for event with all the necessary metadata
 */
export default (balerion: Core.Balerion): Sender => {
  const { uuid } = balerion.config;
  const deviceId = machineID();

  const serverRootPath = balerion.dirs.app.root;
  const adminRootPath = path.join(balerion.dirs.app.root, 'src', 'admin');

  const anonymousUserProperties = {
    environment: balerion.config.environment,
    os: os.type(),
    osPlatform: os.platform(),
    osArch: os.arch(),
    osRelease: os.release(),
    nodeVersion: process.versions.node,
  };

  const anonymousGroupProperties = {
    docker: process.env.DOCKER || isDocker(),
    isCI: ciEnv.isCI,
    version: balerion.config.get('info.balerion'),
    useTypescriptOnServer: tsUtils.isUsingTypeScriptSync(serverRootPath),
    useTypescriptOnAdmin: tsUtils.isUsingTypeScriptSync(adminRootPath),
    projectId: uuid,
    isHostedOnBalerionCloud: env('BALERION_HOSTING', null) === 'balerion.cloud',
  };

  addPackageJsonBalerionMetadata(anonymousGroupProperties, balerion);

  return async (event: string, payload: Payload = {}, opts = {}) => {
    const userId = generateAdminUserHash(balerion);

    const reqParams = {
      method: 'POST',
      body: JSON.stringify({
        event,
        userId,
        deviceId,
        eventProperties: payload.eventProperties,
        userProperties: userId ? { ...anonymousUserProperties, ...payload.userProperties } : {},
        groupProperties: {
          ...anonymousGroupProperties,
          projectType: balerion.EE ? 'Enterprise' : 'Community',
          ...payload.groupProperties,
        },
      }),
      ..._.merge({ headers: { 'X-Balerion-Event': event } }, defaultQueryOpts, opts),
    };

    try {
      const res = await balerion.fetch(`${ANALYTICS_URI}/api/v2/track`, reqParams);
      return res.ok;
    } catch (err) {
      return false;
    }
  };
};
