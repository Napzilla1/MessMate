const Redis = require('ioredis');

/**
 * Rate limiter using Redis sorted sets.
 * Tracks message timestamps per socket ID to enforce rate limits.
 * All config is dynamic from environment variables.
 */
const createRateLimiter = (redisClient) => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '5000', 10);
  const maxMessages = parseInt(process.env.RATE_LIMIT_MAX_MESSAGES || '10', 10);

  /**
   * Check if a socket is allowed to send a message.
   * @param {string} socketId - The socket ID to check
   * @returns {{ allowed: boolean, retryAfter: number }} 
   */
  const checkRateLimit = async (socketId) => {
    const key = `rate:${socketId}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove expired entries
    await redisClient.zremrangebyscore(key, 0, windowStart);

    // Count messages in the current window
    const count = await redisClient.zcount(key, windowStart, now);

    if (count >= maxMessages) {
      // Calculate when the oldest message in the window expires
      const oldest = await redisClient.zrangebyscore(key, windowStart, now, 'LIMIT', 0, 1);
      const retryAfter = oldest.length > 0 
        ? Math.ceil((parseInt(oldest[0], 10) + windowMs - now) / 1000) 
        : Math.ceil(windowMs / 1000);

      return { allowed: false, retryAfter };
    }

    // Add the current timestamp as both score and member
    await redisClient.zadd(key, now, `${now}`);
    
    // Set expiry on the key so it auto-cleans if socket disconnects
    await redisClient.expire(key, Math.ceil(windowMs / 1000) + 1);

    return { allowed: true, retryAfter: 0 };
  };

  /**
   * Clean up rate limit data for a disconnected socket.
   * @param {string} socketId
   */
  const cleanup = async (socketId) => {
    await redisClient.del(`rate:${socketId}`);
  };

  return { checkRateLimit, cleanup };
};

module.exports = createRateLimiter;
