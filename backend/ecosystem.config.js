module.exports = {
  apps: [
    {
      name: 'mess-api',
      script: 'server.js',
      instances: 'max',       // One process per CPU core
      exec_mode: 'cluster',   // Cluster mode for multi-process
      env: {
        NODE_ENV: 'production',
      },
      env_file: '.env',       // Reads from .env automatically
      watch: false,
      max_memory_restart: '500M',
      // With Redis adapter in place, sticky sessions are NOT needed.
      // All Socket.io rooms are synced via Redis pub/sub.
    },
  ],
};
