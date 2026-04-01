/**
 * Rate limiting system to prevent abuse of generation API
 * Tracks generations per user per minute
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60000; // Clean up old entries every minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, CLEANUP_INTERVAL);

/**
 * Check if user has exceeded rate limit
 * @param userId User ID
 * @param maxPerMinute Maximum generations per minute (default: 5)
 * @returns Object with allowed status and remaining count
 */
export function checkGenerationRateLimit(
  userId: string,
  maxPerMinute: number = 5
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = `generation:${userId}`;
  
  let entry = rateLimitStore.get(key);
  
  // Reset if time window has passed
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + 60000, // 1 minute window
    };
    rateLimitStore.set(key, entry);
  }
  
  const allowed = entry.count < maxPerMinute;
  const remaining = Math.max(0, maxPerMinute - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);
  
  // Increment count if allowed
  if (allowed) {
    entry.count++;
  }
  
  return { allowed, remaining, resetIn };
}

/**
 * Check if user has exceeded credit purchase rate limit
 * Prevents rapid multiple purchases in short time
 * @param userId User ID
 * @param maxPerHour Maximum purchases per hour (default: 10)
 * @returns Object with allowed status
 */
export function checkPurchaseRateLimit(
  userId: string,
  maxPerHour: number = 10
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = `purchase:${userId}`;
  
  let entry = rateLimitStore.get(key);
  
  // Reset if time window has passed
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + 3600000, // 1 hour window
    };
    rateLimitStore.set(key, entry);
  }
  
  const allowed = entry.count < maxPerHour;
  const remaining = Math.max(0, maxPerHour - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);
  
  // Increment count if allowed
  if (allowed) {
    entry.count++;
  }
  
  return { allowed, remaining, resetIn };
}

/**
 * Reset rate limit for a user (admin only)
 * @param userId User ID
 * @param type Type of rate limit to reset
 */
export function resetRateLimit(userId: string, type: "generation" | "purchase" = "generation"): void {
  const prefix = type === "generation" ? "generation:" : "purchase:";
  const key = `${prefix}${userId}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a user
 * @param userId User ID
 * @returns Current rate limit status
 */
export function getRateLimitStatus(userId: string): Record<string, any> {
  const generationKey = `generation:${userId}`;
  const purchaseKey = `purchase:${userId}`;
  
  const generationEntry = rateLimitStore.get(generationKey);
  const purchaseEntry = rateLimitStore.get(purchaseKey);
  
  return {
    generation: generationEntry ? {
      count: generationEntry.count,
      resetIn: Math.max(0, generationEntry.resetTime - Date.now()),
    } : null,
    purchase: purchaseEntry ? {
      count: purchaseEntry.count,
      resetIn: Math.max(0, purchaseEntry.resetTime - Date.now()),
    } : null,
  };
}
