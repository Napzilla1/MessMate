/**
 * Redis Sliding-Window Rate Limiter (Express Middleware)
 * 
 * Uses Redis Sorted Sets to track request timestamps per IP + route.
 * Protects authentication endpoints against brute-force attacks.
 * 
 * Usage: router.post('/login', rateLimiter(10, 60), handler)
 *   → Max 10 requests per 60 seconds per IP
 */
const createRateLimiter = (maxAttempts, windowSecs) => {
  return async (req, res, next) => {
    const redisClient = req.app.get('redisClient');

    // If Redis is not available, skip rate limiting
    if (!redisClient) return next();

    try {
      const key = `rate:${req.ip}:${req.path}`;
      const now = Date.now();
      const windowMs = windowSecs * 1000;
      const windowStart = now - windowMs;

      // Remove expired entries outside the window
      await redisClient.zremrangebyscore(key, 0, windowStart);

      // Count requests in the current window
      const count = await redisClient.zcount(key, windowStart, now);

      if (count >= maxAttempts) {
        // Calculate exact retry-after from the oldest entry
        const oldest = await redisClient.zrangebyscore(key, windowStart, now, 'LIMIT', 0, 1);
        const retryAfter = oldest.length > 0
          ? Math.ceil((parseInt(oldest[0], 10) + windowMs - now) / 1000)
          : Math.ceil(windowMs / 1000);

        return res.status(429).json({
          message: `Too many attempts. Try again in ${retryAfter}s.`,
          retryAfter,
        });
      }

      // Record this request
      await redisClient.zadd(key, now, `${now}:${Math.random()}`);
      await redisClient.expire(key, windowSecs + 1);

      next();
    } catch (err) {
      // If Redis errors, don't block the request
      console.error('[RateLimiter] Redis error:', err.message);
      next();
    }
  };
};

module.exports = createRateLimiter;
