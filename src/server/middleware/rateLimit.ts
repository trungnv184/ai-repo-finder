import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** Maximum requests per window */
const MAX_REQUESTS = 100;

/** Window duration in milliseconds (1 minute) */
const WINDOW_MS = 60 * 1000;

/** In-memory store for rate limit tracking by IP */
const store = new Map<string, RateLimitEntry>();

/**
 * Periodically cleans up expired entries from the store
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, WINDOW_MS);

/**
 * Rate limiting middleware
 * Limits each IP to 100 requests per minute using an in-memory store.
 * Returns 429 with a Retry-After header when the limit is exceeded.
 */
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let entry = store.get(ip);

  // Reset or create entry if window has expired
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + WINDOW_MS,
    };
    store.set(ip, entry);
  }

  entry.count++;

  // Set rate limit headers on every response
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

  if (entry.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', retryAfterSeconds);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSeconds,
      },
      meta: {
        timestamp: new Date().toISOString(),
        fromCache: false,
      },
    });
    return;
  }

  next();
}
