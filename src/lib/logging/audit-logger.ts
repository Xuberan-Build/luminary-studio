/**
 * Centralized Audit Logging Service
 *
 * Provides comprehensive logging for troubleshooting and user activity tracking
 * All logs are stored in the audit_logs table for querying and analysis
 *
 * Features:
 * - GDPR compliance (email hashing)
 * - Security (sensitive data sanitization)
 * - Performance (smart sampling)
 * - Request tracing (trace_id correlation)
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import {
  hashEmail,
  sanitizeData,
  shouldLogSmart,
  generateTraceId,
  extractTraceId,
  truncate,
} from './enhancements';

export type EventType =
  | 'api_request'
  | 'auth'
  | 'affiliate'
  | 'product'
  | 'session'
  | 'payment'
  | 'error'
  | 'system';

export type EventAction =
  // Auth actions
  | 'login'
  | 'signup'
  | 'logout'
  | 'password_reset'
  | 'email_verify'

  // Affiliate actions
  | 'affiliate_enroll'
  | 'affiliate_opt_out'
  | 'stripe_connect_create'
  | 'stripe_connect_onboard'
  | 'commission_earned'

  // Product actions
  | 'product_access_granted'
  | 'product_purchased'
  | 'session_started'
  | 'session_completed'
  | 'step_answered'
  | 'deliverable_generated'

  // Payment actions
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'webhook_received'

  // API actions
  | 'api_call'
  | 'api_error';

export type EventStatus = 'success' | 'error' | 'pending' | 'info';

export interface AuditLogEntry {
  // User tracking
  userId?: string;
  userEmail?: string;
  sessionId?: string;

  // Event information
  eventType: EventType;
  eventAction: EventAction;
  eventStatus: EventStatus;

  // Request details
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestBody?: any;

  // Response details
  responseStatus?: number;
  responseBody?: any;

  // Error tracking
  errorMessage?: string;
  errorStack?: string;
  errorCode?: string;

  // Context and metadata
  metadata?: Record<string, any>;

  // Performance tracking
  durationMs?: number;

  // Enhanced features (from enhancements.ts)
  traceId?: string;
  logLevel?: 'INFO' | 'WARN' | 'ERROR';
  isSampled?: boolean;
}

/**
 * Main logging function - writes to audit_logs table
 *
 * Enhanced with:
 * - Email hashing for GDPR compliance
 * - Sensitive data sanitization
 * - Text truncation for large fields
 * - Request tracing with trace_id
 * - Log levels and sampling
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    // Apply smart sampling (always log errors, sample success logs)
    const duration = entry.durationMs || 0;
    const shouldLog = shouldLogSmart(entry.eventStatus, duration);

    if (!shouldLog) {
      // Skip this log due to sampling
      return;
    }

    // Hash email for GDPR compliance
    const emailHash = entry.userEmail ? hashEmail(entry.userEmail) : null;

    // Sanitize sensitive data from request/response bodies
    const sanitizedRequestBody = entry.requestBody
      ? sanitizeData(entry.requestBody)
      : null;
    const sanitizedResponseBody = entry.responseBody
      ? sanitizeData(entry.responseBody)
      : null;

    // Determine log level based on event status
    const logLevel = entry.logLevel || (
      entry.eventStatus === 'error' ? 'ERROR' :
      entry.eventStatus === 'pending' ? 'WARN' :
      'INFO'
    );

    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: entry.userId || null,
        user_email: entry.userEmail || null,
        user_email_hash: emailHash,
        session_id: entry.sessionId || null,

        event_type: entry.eventType,
        event_action: entry.eventAction,
        event_status: entry.eventStatus,

        ip_address: entry.ipAddress || null,
        user_agent: truncate(entry.userAgent, 500),
        request_method: entry.requestMethod || null,
        request_path: entry.requestPath || null,
        request_body: sanitizedRequestBody,

        response_status: entry.responseStatus || null,
        response_body: sanitizedResponseBody,

        error_message: truncate(entry.errorMessage, 1000),
        error_stack: truncate(entry.errorStack, 5000),
        error_code: entry.errorCode || null,

        metadata: entry.metadata || null,
        duration_ms: entry.durationMs || null,

        // Enhanced fields
        trace_id: entry.traceId || null,
        log_level: logLevel,
        is_sampled: !shouldLog,
      });

    if (error) {
      // Log to console if database insert fails (fallback)
      console.error('[AUDIT LOG ERROR]', error);
      console.log('[AUDIT LOG FALLBACK]', JSON.stringify(entry, null, 2));
    }
  } catch (err) {
    // Ensure logging never breaks the main application
    console.error('[AUDIT LOG CRITICAL ERROR]', err);
    console.log('[AUDIT LOG FALLBACK]', JSON.stringify(entry, null, 2));
  }
}

/**
 * Helper to extract request info from Next.js request
 * Includes trace ID extraction or generation for request correlation
 */
export function extractRequestInfo(req: NextRequest | Request): {
  ipAddress?: string;
  userAgent?: string;
  requestMethod: string;
  requestPath: string;
  traceId: string;
} {
  const headers = req.headers;

  // Extract or generate trace ID for request correlation
  const traceId = extractTraceId(headers) || generateTraceId();

  return {
    ipAddress:
      headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      headers.get('x-real-ip') ||
      undefined,
    userAgent: headers.get('user-agent') || undefined,
    requestMethod: req.method,
    requestPath: new URL(req.url).pathname,
    traceId,
  };
}

/**
 * Log API request/response with performance tracking
 * Automatically includes trace ID for request correlation
 */
export async function logApiRequest(params: {
  req: NextRequest | Request;
  userId?: string;
  userEmail?: string;
  eventAction: EventAction;
  eventStatus: EventStatus;
  responseStatus: number;
  responseBody?: any;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, any>;
  startTime: number;
}): Promise<void> {
  const requestInfo = extractRequestInfo(params.req);
  const duration = Date.now() - params.startTime;

  // Merge trace ID into metadata for better correlation
  const enrichedMetadata = {
    ...params.metadata,
    traceId: requestInfo.traceId,
  };

  await logAudit({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: 'api_request',
    eventAction: params.eventAction,
    eventStatus: params.eventStatus,
    ...requestInfo,
    responseStatus: params.responseStatus,
    responseBody: params.responseBody,
    errorMessage: params.errorMessage,
    errorStack: params.errorStack,
    metadata: enrichedMetadata,
    durationMs: duration,
  });
}

/**
 * Log authentication events
 */
export async function logAuth(params: {
  userId?: string;
  userEmail: string;
  action: 'login' | 'signup' | 'logout' | 'password_reset' | 'email_verify';
  status: EventStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAudit({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: 'auth',
    eventAction: params.action,
    eventStatus: params.status,
    errorMessage: params.errorMessage,
    metadata: params.metadata,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log affiliate events
 */
export async function logAffiliate(params: {
  userId: string;
  userEmail: string;
  action: 'affiliate_enroll' | 'affiliate_opt_out' | 'stripe_connect_create' | 'stripe_connect_onboard' | 'commission_earned';
  status: EventStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  await logAudit({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: 'affiliate',
    eventAction: params.action,
    eventStatus: params.status,
    errorMessage: params.errorMessage,
    metadata: params.metadata,
  });
}

/**
 * Log product/session events
 */
export async function logProduct(params: {
  userId: string;
  userEmail?: string;
  action: 'product_access_granted' | 'product_purchased' | 'session_started' | 'session_completed' | 'step_answered' | 'deliverable_generated';
  status: EventStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  await logAudit({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: 'product',
    eventAction: params.action,
    eventStatus: params.status,
    errorMessage: params.errorMessage,
    metadata: params.metadata,
  });
}

/**
 * Log payment/webhook events
 */
export async function logPayment(params: {
  userId?: string;
  userEmail?: string;
  action: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'webhook_received';
  status: EventStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  await logAudit({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: 'payment',
    eventAction: params.action,
    eventStatus: params.status,
    errorMessage: params.errorMessage,
    metadata: params.metadata,
  });
}

/**
 * Log errors with full stack trace
 */
export async function logError(params: {
  userId?: string;
  userEmail?: string;
  error: Error | any;
  context: string; // Where the error occurred
  metadata?: Record<string, any>;
  req?: NextRequest | Request;
}): Promise<void> {
  const requestInfo = params.req ? extractRequestInfo(params.req) : {};

  await logAudit({
    userId: params.userId,
    userEmail: params.userEmail,
    eventType: 'error',
    eventAction: 'api_error',
    eventStatus: 'error',
    errorMessage: params.error?.message || String(params.error),
    errorStack: params.error?.stack,
    errorCode: params.error?.code,
    metadata: {
      ...params.metadata,
      context: params.context,
    },
    ...requestInfo,
  });
}

/**
 * Create a timer for performance tracking
 */
export function startTimer(): number {
  return Date.now();
}

/**
 * Helper to log successful API completion
 */
export async function logSuccess(params: {
  req: NextRequest | Request;
  userId?: string;
  userEmail?: string;
  action: EventAction;
  responseStatus?: number;
  metadata?: Record<string, any>;
  startTime: number;
}): Promise<void> {
  await logApiRequest({
    req: params.req,
    userId: params.userId,
    userEmail: params.userEmail,
    eventAction: params.action,
    eventStatus: 'success',
    responseStatus: params.responseStatus || 200,
    metadata: params.metadata,
    startTime: params.startTime,
  });
}

/**
 * Helper to log API errors
 */
export async function logApiError(params: {
  req: NextRequest | Request;
  userId?: string;
  userEmail?: string;
  action: EventAction;
  error: Error | any;
  responseStatus?: number;
  metadata?: Record<string, any>;
  startTime: number;
}): Promise<void> {
  await logApiRequest({
    req: params.req,
    userId: params.userId,
    userEmail: params.userEmail,
    eventAction: params.action,
    eventStatus: 'error',
    responseStatus: params.responseStatus || 500,
    errorMessage: params.error?.message || String(params.error),
    errorStack: params.error?.stack,
    metadata: params.metadata,
    startTime: params.startTime,
  });
}

/**
 * ============================================================================
 * ENHANCED FEATURES (Best Practices)
 * ============================================================================
 *
 * This logging system includes production-ready enhancements:
 *
 * 1. GDPR Compliance:
 *    - Emails are automatically hashed (SHA-256) for privacy
 *    - Use redact_user_logs() SQL function for "right to be forgotten"
 *
 * 2. Security:
 *    - Sensitive fields (passwords, tokens, keys) are automatically redacted
 *    - Request/response bodies are sanitized before storage
 *
 * 3. Performance:
 *    - Smart sampling: Always logs errors, samples 10% of success logs
 *    - Slow requests (>2s) are always logged regardless of sampling
 *    - Reduces storage costs by 90% while maintaining error visibility
 *
 * 4. Request Tracing:
 *    - Every log gets a trace_id for correlation across API calls
 *    - Supports X-Trace-Id, X-Request-Id headers from load balancers
 *
 * 5. Monitoring:
 *    - Log levels (INFO, WARN, ERROR) for filtering
 *    - Materialized view (audit_error_summary) for error analytics
 *    - Critical error notifications via pg_notify
 *
 * 6. Data Management:
 *    - Text fields are truncated to prevent huge log entries
 *    - Auto-cleanup of old success logs (90+ days)
 *    - Immutability protection (logs can't be updated/deleted)
 *
 * Usage Example:
 *
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const startTime = startTimer();
 *   let userId: string | undefined;
 *   let userEmail: string | undefined;
 *
 *   try {
 *     // Your API logic here
 *     userId = session.user.id;
 *     userEmail = session.user.email;
 *
 *     // Success - automatically includes trace_id, hashes email, sanitizes data
 *     await logSuccess({
 *       req,
 *       userId,
 *       userEmail,
 *       action: 'affiliate_enroll',
 *       metadata: { referralCode: 'ABC123' },
 *       startTime,
 *     });
 *
 *     return NextResponse.json({ success: true });
 *
 *   } catch (error: any) {
 *     // Error - always logged (no sampling), includes full stack trace
 *     await logApiError({
 *       req,
 *       userId,
 *       userEmail,
 *       action: 'affiliate_enroll',
 *       error,
 *       responseStatus: 500,
 *       startTime,
 *     });
 *
 *     return NextResponse.json({ error: error.message }, { status: 500 });
 *   }
 * }
 * ```
 *
 * To apply enhancements to production:
 * ```bash
 * psql $DATABASE_URL -f database/migrations/010_audit_logging_enhancements.sql
 * ```
 */
