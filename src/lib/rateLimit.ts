type RateLimitRecord = {
  count: number;
  resetAt: number;
};

class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();

  check(key: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number; resetInMs: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, limit, remaining: limit - 1, resetInMs: windowMs };
    }

    if (record.count >= limit) {
      return { success: false, limit, remaining: 0, resetInMs: Math.max(0, record.resetAt - now) };
    }

    record.count += 1;
    this.store.set(key, record);
    return { success: true, limit, remaining: limit - record.count, resetInMs: Math.max(0, record.resetAt - now) };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

const globalLimiter = new RateLimiter();

// Perform cleanup periodically
if (typeof window === 'undefined') {
  setInterval(() => globalLimiter.cleanup(), 5 * 60 * 1000);
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  return globalLimiter.check(key, limit, windowMs);
}
