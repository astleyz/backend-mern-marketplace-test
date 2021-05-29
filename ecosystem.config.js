module.exports = {
  apps: [
    {
      name: 'app',
      script: './dist/index.js',
      watch: true,
      instances: 'max',
      exec_mode: 'cluster',
    },
  ],
};
