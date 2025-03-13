module.exports = {
  async rateLimitEnable(value) {
    balerion.config.set('admin.rateLimit.enabled', !!value);
  },
  async adminAutoOpenEnable(value) {
    balerion.config.set('admin.autoOpen', !!value);
  },
};
