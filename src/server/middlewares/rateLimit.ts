import type { Handler } from "../types";

// In-memory limiter: fine for one Node process (Hostinger). Counts requests per IP per window.
const hits = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (name: string, max: number, windowMs: number): Handler => (req, res, next) => {
  const key = `${name}:${req.ip}`;
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    if (hits.size > 5000) hits.forEach((v, k) => v.resetAt < now && hits.delete(k)); // keep memory bounded
    return next();
  }
  if (++entry.count > max) {
    return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
  }
  next();
};

export const loginLimit = rateLimit("login", 10, 15 * 60 * 1000); // 10 tries / 15 min
export const formLimit = rateLimit("form", 20, 60 * 60 * 1000); // contact, reviews, orders: 20 / hour
export const guestLimit = rateLimit("guest", 60, 60 * 60 * 1000);
