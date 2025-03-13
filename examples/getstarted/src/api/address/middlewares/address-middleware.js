module.exports = (options) => {
  return (ctx, next) => {
    ctx.set('X-Balerion-Test', 'Address Middleware');
    return next();
  };
};
