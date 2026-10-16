// In-memory sliding window rate limiter (Zero external dependencies)
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = "Too many requests. Please try again later.",
}) => {
  const hits = new Map();

  // Clean up expired entries every 5 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits.entries()) {
      if (now > data.resetTime) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // Extract client IP (handle proxies & local connections)
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (forwarded ? forwarded.split(",")[0].trim() : null) ||
      req.ip ||
      req.socket.remoteAddress ||
      "unknown-client";

    const now = Date.now();
    const record = hits.get(ip);

    if (!record || now > record.resetTime) {
      hits.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);

      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    next();
  };
};

// Protect against mass account creation bots (Max 5 registrations per 15 minutes per IP)
export const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts from this IP. Please wait 15 minutes before creating another account.",
});

// Protect against brute force password guessing (Max 10 login attempts per 15 minutes per IP)
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

// General API protection (Max 120 requests per minute per IP)
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Too many API requests. Please slow down.",
});
