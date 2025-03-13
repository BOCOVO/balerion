import { env } from '@balerion/utils';
import { getService } from '../../utils';

/**
 * A valid transfer token salt must be a non-empty string defined in the Balerion config
 */
const hasValidTokenSalt = (): boolean => {
  const salt = balerion.config.get('admin.transfer.token.salt', null) as string | null;

  return typeof salt === 'string' && salt.length > 0;
};

/**
 * Checks whether data transfer features are enabled
 */
const isRemoteTransferEnabled = (): boolean => {
  const { utils } = getService('transfer');

  // TODO v6: Remove this warning
  if (env.bool('BALERION_DISABLE_REMOTE_DATA_TRANSFER') !== undefined) {
    balerion.log.warn(
      'BALERION_DISABLE_REMOTE_DATA_TRANSFER is no longer supported. Instead, set transfer.remote.enabled to false in your server configuration'
    );
  }

  return utils.hasValidTokenSalt() && balerion.config.get('server.transfer.remote.enabled');
};

export { isRemoteTransferEnabled, hasValidTokenSalt };
