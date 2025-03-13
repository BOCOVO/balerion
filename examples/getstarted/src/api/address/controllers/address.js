const { createCoreController } = require('@balerion/balerion').factories;

module.exports = createCoreController('api::address.address', {
  async find(ctx) {
    const { results } = await balerion.service('api::address.address').find();

    ctx.body = await this.sanitizeOutput(results, ctx);
  },
});
