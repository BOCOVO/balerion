import crypto from 'crypto';
import type { Core } from '@balerion/types';

/**
 * Generate an admin user hash
 */
const generateAdminUserHash = (balerion: Core.Balerion) => {
  const ctx = balerion?.requestContext?.get();
  if (!ctx?.state?.user?.email) {
    return '';
  }
  return crypto.createHash('sha256').update(ctx.state.user.email).digest('hex');
};

export { generateAdminUserHash };
