/**
 * Logging Enhancements - Best Practices
 * Add these to improve the audit logging system
 */

import crypto from 'crypto';

/**
 * Hash email for GDPR compliance
 * Use this instead of storing plaintext emails
 */
export function hashEmail(email: string): string {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
}

/**
 * Sanitize sensitive data before logging
 * Prevents passwords, tokens, keys from being logged
 */
export function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitive = [
    'password',
    'token',
    'secret',
    'api_key',
    'apikey',
    'credit_card',
    'creditcard',
    'ssn',
    'private_key',
    'privatekey',
  ];

  const sanitized = JSON.parse(JSON.stringify(data));

  function redact(obj: any) {
    for (const key in obj) {
      const keyLower = key.toLowerCase();

      if (sensitive.some((s) => keyLower.includes(s))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redact(obj[key]);
      }
    }
  }

  redact(sanitized);
  return sanitized;
}

/**
 * Sample logs to reduce storage costs
 * Always logs errors, samples success based on rate
 */
export function shouldLog(
  eventStatus: 'success' | 'error' | 'pending',
  sampleRate: number = 0.1
): boolean {
  // Always log errors and pending
  if (eventStatus !== 'success') return true;

  // Sample success logs
  return Math.random() < sampleRate;
}

/**
 * Smart sampling - always log slow requests
 */
export function shouldLogSmart(
  eventStatus: 'success' | 'error' | 'pending',
  durationMs: number,
  sampleRate: number = 0.1
): boolean {
  // Always log errors
  if (eventStatus !== 'success') return true;

  // Always log slow requests (>2s)
  if (durationMs > 2000) return true;

  // Sample normal success logs
  return Math.random() < sampleRate;
}

/**
 * Generate trace ID for request correlation
 * Use this at API boundaries to track requests
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * Truncate large strings to prevent huge log entries
 */
export function truncate(str: string | null | undefined, maxLength: number = 1000): string | null {
  if (!str) return null;
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '... [truncated]';
}

/**
 * Extract trace ID from request headers (if exists)
 * Supports X-Trace-Id, X-Request-Id, etc.
 */
export function extractTraceId(headers: Headers): string | null {
  return (
    headers.get('x-trace-id') ||
    headers.get('x-request-id') ||
    headers.get('x-correlation-id') ||
    null
  );
}

/**
 * Create structured metadata for common use cases
 */
export function createMetadata(data: {
  traceId?: string;
  userId?: string;
  sessionId?: string;
  productSlug?: string;
  errorCode?: string;
  [key: string]: any;
}): Record<string, any> {
  return {
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };
}

/**
 * Rate limit logging for high-volume endpoints
 * Prevents log spam from automated requests
 */
const logRateLimits = new Map<string, number>();

export function rateLimitLog(
  key: string,
  maxPerMinute: number = 60
): boolean {
  const now = Date.now();
  const lastLog = logRateLimits.get(key) || 0;
  const timeSinceLastLog = now - lastLog;
  const minInterval = 60000 / maxPerMinute; // Convert to ms

  if (timeSinceLastLog < minInterval) {
    return false; // Skip this log
  }

  logRateLimits.set(key, now);
  return true;
}

/**
 * Clean up rate limit map periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of logRateLimits.entries()) {
    if (now - timestamp > 60000) {
      logRateLimits.delete(key);
    }
  }
}, 60000);
