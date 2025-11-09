/**
 * Client-side rate limiting utility
 * Stores submission timestamps in localStorage
 * Automatically cleans up old entries
 */

interface RateLimitConfig {
  key: string;
  maxAttempts: number;
  windowMs: number;
}

interface TimestampEntry {
  timestamp: number;
}

const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if rate limit is exceeded for a given key
 * @param config - Rate limit configuration
 * @returns true if request is allowed, false if rate limit exceeded
 */
export function checkRateLimit(config: RateLimitConfig): boolean {
  const { key, maxAttempts, windowMs } = config;
  const storageKey = `rateLimit_${key}`;
  
  try {
    // Get existing timestamps
    const stored = localStorage.getItem(storageKey);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    
    // Get current time
    const now = Date.now();
    
    // Filter out timestamps outside the rate limit window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );
    
    // Check if rate limit is exceeded
    if (validTimestamps.length >= maxAttempts) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // If localStorage fails, allow the request (fail open)
    return true;
  }
}

/**
 * Record a submission attempt
 * @param key - Unique identifier for the form/action
 */
export function recordSubmission(key: string): void {
  const storageKey = `rateLimit_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    
    // Add current timestamp
    timestamps.push(Date.now());
    
    // Save back to storage
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
    
    // Trigger cleanup
    cleanupOldEntries();
  } catch (error) {
    console.error('Record submission error:', error);
  }
}

/**
 * Get time remaining until rate limit resets
 * @param config - Rate limit configuration
 * @returns milliseconds until reset, or 0 if not rate limited
 */
export function getTimeUntilReset(config: RateLimitConfig): number {
  const { key, windowMs } = config;
  const storageKey = `rateLimit_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;
    
    const timestamps: number[] = JSON.parse(stored);
    if (timestamps.length === 0) return 0;
    
    const now = Date.now();
    const oldestValidTimestamp = Math.min(...timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    ));
    
    const resetTime = oldestValidTimestamp + windowMs;
    return Math.max(0, resetTime - now);
  } catch (error) {
    console.error('Get time until reset error:', error);
    return 0;
  }
}

/**
 * Format time remaining as human-readable string
 * @param ms - Milliseconds
 * @returns Formatted string (e.g., "5 minutes", "30 seconds")
 */
export function formatTimeRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

/**
 * Clean up old rate limit entries from localStorage
 * Removes entries older than 24 hours
 */
function cleanupOldEntries(): void {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage).filter((key) => 
      key.startsWith('rateLimit_')
    );
    
    for (const key of keys) {
      const stored = localStorage.getItem(key);
      if (!stored) continue;
      
      const timestamps: number[] = JSON.parse(stored);
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < CLEANUP_THRESHOLD
      );
      
      if (validTimestamps.length === 0) {
        localStorage.removeItem(key);
      } else if (validTimestamps.length < timestamps.length) {
        localStorage.setItem(key, JSON.stringify(validTimestamps));
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * Clear rate limit for a specific key (useful for testing)
 * @param key - Rate limit key to clear
 */
export function clearRateLimit(key: string): void {
  const storageKey = `rateLimit_${key}`;
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Clear rate limit error:', error);
  }
}
