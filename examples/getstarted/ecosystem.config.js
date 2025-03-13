module.exports = {
  apps: [
    {
      name: 'balerion-getstarted',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
