/**
 * PM2 Ecosystem Configuration — Multi-Port for Nginx Load Balancing
 *
 * Instead of using PM2's built-in cluster mode on a single port,
 * we launch 3 separate instances on ports 5001, 5002, and 5003.
 * Nginx distributes incoming traffic across these ports using
 * ip_hash for sticky session support (important for WebSockets).
 *
 * The Redis adapter still syncs Socket.IO rooms across all instances.
 */
module.exports = {
  apps: [
    {
      name: 'mess-api-1',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      env_file: '.env',
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'mess-api-2',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5002,
      },
      env_file: '.env',
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'mess-api-3',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5003,
      },
      env_file: '.env',
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
