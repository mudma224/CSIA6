if (typeof window !== "undefined") {
  throw new Error("This module is server-only and must never run in the browser.");
}

/**
 * Minimal in-memory rate limiter for the demo BFF (no auth provider yet, C02 pending).
 * Sliding window per IP; the map is bounded to avoid unbounded growth.
 * Not a security boundary — an honest demo-policy control documented in decisions.md.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_ENTRIES = 5_000;

const hits = new Map<string, number[]>();

export function rateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (hits.size > MAX_ENTRIES) {
    hits.clear();
  }
  const window = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (window.length >= MAX_REQUESTS) {
    const oldest = Math.min(...window);
    return { allowed: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }
  window.push(now);
  hits.set(key, window);
  return { allowed: true, retryAfterSec: 0 };
}
