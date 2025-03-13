module.exports = {
  rateLimitEnable(ctx) {
    const { value } = ctx.request.body;

    const configService = balerion.service('api::config.config');

    configService.rateLimitEnable(value);

    ctx.send(200);
  },
};
