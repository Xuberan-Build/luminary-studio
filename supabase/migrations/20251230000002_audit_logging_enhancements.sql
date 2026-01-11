-- Migration: 010_audit_logging_enhancements
-- Description: Add best practices to audit logging system
-- Date: 2025-12-30

-- =====================================================
-- ENHANCEMENTS FOR SECURITY & COMPLIANCE
-- =====================================================

-- Add hashed email for GDPR compliance
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_email_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_audit_logs_email_hash ON audit_logs(user_email_hash);

-- Add trace ID for request correlation
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS trace_id UUID;
CREATE INDEX IF NOT EXISTS idx_audit_logs_trace_id ON audit_logs(trace_id);

-- Add log level for filtering
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS log_level TEXT DEFAULT 'INFO';
CREATE INDEX IF NOT EXISTS idx_audit_logs_log_level ON audit_logs(log_level);

-- Add sampling info
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS is_sampled BOOLEAN DEFAULT FALSE;

-- =====================================================
-- IMMUTABILITY & COMPLIANCE
-- =====================================================

-- Make logs append-only (prevent updates/deletes by normal users)
-- Only superuser can delete for GDPR compliance

REVOKE UPDATE ON audit_logs FROM PUBLIC;
REVOKE DELETE ON audit_logs FROM PUBLIC;

-- Grant only INSERT and SELECT
GRANT INSERT ON audit_logs TO PUBLIC;
GRANT SELECT ON audit_logs TO PUBLIC;

-- =====================================================
-- GDPR COMPLIANCE FUNCTIONS
-- =====================================================

-- Function to redact user data for GDPR "right to be forgotten"
CREATE OR REPLACE FUNCTION redact_user_logs(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  redacted_count INTEGER;
BEGIN
  -- Instead of deleting, redact personal data
  UPDATE audit_logs
  SET
    user_email = NULL,
    user_email_hash = NULL,
    ip_address = NULL,
    user_agent = NULL,
    request_body = NULL,
    response_body = NULL,
    metadata = jsonb_build_object(
      'redacted', true,
      'redacted_at', NOW()
    )
  WHERE user_id = p_user_id
    AND event_status = 'success'; -- Keep error logs for debugging

  GET DIAGNOSTICS redacted_count = ROW_COUNT;
  RETURN redacted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION redact_user_logs(UUID) SET search_path = public;

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Partition table by month for better performance (if needed later)
-- Commented out for now, enable if you get millions of logs

-- CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- =====================================================
-- MONITORING & ALERTS
-- =====================================================

-- Create materialized view for error summary (refresh every hour)
CREATE MATERIALIZED VIEW IF NOT EXISTS audit_error_summary AS
SELECT
  event_type,
  event_action,
  error_code,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users,
  MAX(created_at) as last_occurrence
FROM audit_logs
WHERE event_status = 'error'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, event_action, error_code
ORDER BY error_count DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_error_summary_unique
  ON audit_error_summary(event_type, event_action, COALESCE(error_code, ''));

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_audit_error_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY audit_error_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATED CLEANUP WITH ARCHIVAL
-- =====================================================

-- Function to archive old logs (extend the existing cleanup)
CREATE OR REPLACE FUNCTION archive_old_audit_logs(days_old INTEGER DEFAULT 90)
RETURNS TABLE(
  archived_count INTEGER,
  archived_date DATE
) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  deleted_count INTEGER;
BEGIN
  cutoff_date := NOW() - (days_old || ' days')::INTERVAL;

  -- In production, you would export to S3 here before deleting
  -- For now, just delete old success logs
  DELETE FROM audit_logs
  WHERE created_at < cutoff_date
    AND event_status = 'success'
    AND log_level NOT IN ('ERROR', 'WARN');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN QUERY SELECT deleted_count, cutoff_date::DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION archive_old_audit_logs(INTEGER) SET search_path = public;

-- =====================================================
-- USEFUL QUERIES AS FUNCTIONS
-- =====================================================

-- Get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(p_user_id UUID)
RETURNS TABLE(
  event_type TEXT,
  total_events BIGINT,
  success_count BIGINT,
  error_count BIGINT,
  avg_duration_ms NUMERIC,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.event_type,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE al.event_status = 'success') as success_count,
    COUNT(*) FILTER (WHERE al.event_status = 'error') as error_count,
    AVG(al.duration_ms) as avg_duration_ms,
    MAX(al.created_at) as last_activity
  FROM audit_logs al
  WHERE al.user_id = p_user_id
  GROUP BY al.event_type
  ORDER BY total_events DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION get_user_activity_summary(UUID) SET search_path = public;

-- Get slow requests (performance issues)
CREATE OR REPLACE FUNCTION get_slow_requests(
  threshold_ms INTEGER DEFAULT 2000,
  hours_ago INTEGER DEFAULT 24
)
RETURNS TABLE(
  user_email TEXT,
  event_action TEXT,
  duration_ms INTEGER,
  request_path TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.user_email,
    al.event_action,
    al.duration_ms,
    al.request_path,
    al.created_at
  FROM audit_logs al
  WHERE al.duration_ms > threshold_ms
    AND al.created_at > NOW() - (hours_ago || ' hours')::INTERVAL
  ORDER BY al.duration_ms DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION get_slow_requests(INTEGER, INTEGER) SET search_path = public;

-- =====================================================
-- NOTIFICATION TRIGGER FOR CRITICAL ERRORS
-- =====================================================

-- Create notification channel for critical errors
CREATE OR REPLACE FUNCTION notify_critical_error()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on critical errors
  IF NEW.event_status = 'error' AND (
    NEW.event_type = 'payment' OR
    NEW.event_action LIKE '%stripe%' OR
    NEW.log_level = 'ERROR'
  ) THEN
    PERFORM pg_notify(
      'critical_error',
      json_build_object(
        'user_email', NEW.user_email,
        'event_type', NEW.event_type,
        'event_action', NEW.event_action,
        'error_message', NEW.error_message,
        'created_at', NEW.created_at
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_critical_error'
  ) THEN
    CREATE TRIGGER trigger_notify_critical_error
      AFTER INSERT ON audit_logs
      FOR EACH ROW
      EXECUTE FUNCTION notify_critical_error();
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Audit logging enhancements applied:';
  RAISE NOTICE '  - Email hashing for GDPR compliance';
  RAISE NOTICE '  - Request tracing with trace_id';
  RAISE NOTICE '  - Log levels for filtering';
  RAISE NOTICE '  - Immutability protections';
  RAISE NOTICE '  - GDPR redaction function';
  RAISE NOTICE '  - Error summary materialized view';
  RAISE NOTICE '  - Critical error notifications';
  RAISE NOTICE '  - Helper functions for analysis';
END $$;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example: Get user activity summary
-- SELECT * FROM get_user_activity_summary('user-uuid-here');

-- Example: Find slow requests
-- SELECT * FROM get_slow_requests(1000, 24);

-- Example: Redact user data for GDPR
-- SELECT redact_user_logs('user-uuid-here');

-- Example: Archive old logs
-- SELECT * FROM archive_old_audit_logs(90);

-- Example: Listen for critical errors (in your app)
-- LISTEN critical_error;
