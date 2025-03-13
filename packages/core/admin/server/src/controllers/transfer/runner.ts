import { Context } from 'koa';

import { balerion as dataTransferBalerion } from '@balerion/data-transfer';
import { errors } from '@balerion/utils';
import dataTransferAuthStrategy from '../../strategies/data-transfer';

const {
  remote: {
    handlers: { createPushController, createPullController },
  },
} = dataTransferBalerion;

const { UnauthorizedError } = errors;

/**
 * @param ctx the koa context
 * @param scope the scope to verify
 */
const verify = async (ctx: Context, scope?: dataTransferBalerion.remote.constants.TransferMethod) => {
  const { auth } = ctx.state;

  if (!auth) {
    throw new UnauthorizedError();
  }

  await dataTransferAuthStrategy.verify(auth, { scope });
};

export const push = createPushController({ verify });
export const pull = createPullController({ verify });

export default {
  push,
  pull,
};
