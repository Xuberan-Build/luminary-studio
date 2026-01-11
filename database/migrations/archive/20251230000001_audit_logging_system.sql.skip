-- Migration: 009_audit_logging_system
-- Description: Create comprehensive audit logging for troubleshooting and user activity tracking
-- Date: 2025-12-30

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User tracking
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  session_id TEXT, -- Browser session ID or auth session ID

  -- Event information
  event_type TEXT NOT NULL, -- 'api_request', 'auth', 'affiliate', 'product', 'error', etc.
  event_action TEXT NOT NULL, -- 'login', 'signup', 'enroll', 'purchase', 'access_product', etc.
  event_status TEXT NOT NULL, -- 'success', 'error', 'pending'

  -- Request details
  ip_address TEXT,
  user_agent TEXT,
  request_method TEXT, -- GET, POST, etc.
  request_path TEXT,
  request_body JSONB,

  -- Response details
  response_status INTEGER,
  response_body JSONB,

  -- Error tracking
  error_message TEXT,
  error_stack TEXT,
  error_code TEXT,

  -- Context and metadata
  metadata JSONB, -- Flexible field for additional context

  -- Performance tracking
  duration_ms INTEGER, -- How long the operation took

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_status ON audit_logs(event_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type_status ON audit_logs(event_type, event_status);

-- =====================================================
-- AUTOMATIC LOGGING TRIGGERS
-- =====================================================

-- Trigger function to log user creation
CREATE OR REPLACE FUNCTION log_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    event_type,
    event_action,
    event_status,
    metadata
  ) VALUES (
    NEW.id,
    NEW.email,
    'system',
    'user_created',
    'success',
    jsonb_build_object(
      'email', NEW.email,
      'name', COALESCE(NEW.full_name, NEW.name)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to users table
DROP TRIGGER IF EXISTS trigger_log_user_creation ON users;
CREATE TRIGGER trigger_log_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_creation();

-- Trigger function to log product access grants
CREATE OR REPLACE FUNCTION log_product_access_grant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    event_type,
    event_action,
    event_status,
    metadata
  ) VALUES (
    NEW.user_id,
    'product',
    'access_granted',
    'success',
    jsonb_build_object(
      'product_slug', NEW.product_slug,
      'granted_at', NEW.granted_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to product_access table
DROP TRIGGER IF EXISTS trigger_log_product_access ON product_access;
CREATE TRIGGER trigger_log_product_access
  AFTER INSERT ON product_access
  FOR EACH ROW
  EXECUTE FUNCTION log_product_access_grant();

-- Trigger function to log affiliate enrollments
CREATE OR REPLACE FUNCTION log_affiliate_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  user_email_value TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email_value
  FROM users
  WHERE id = NEW.affiliate_id;

  INSERT INTO audit_logs (
    user_id,
    user_email,
    event_type,
    event_action,
    event_status,
    metadata
  ) VALUES (
    NEW.affiliate_id,
    user_email_value,
    'affiliate',
    'enrolled',
    'success',
    jsonb_build_object(
      'referral_code', NEW.referral_code,
      'referred_by_id', NEW.referred_by_id,
      'current_track', NEW.current_track
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to referral_hierarchy table
DROP TRIGGER IF EXISTS trigger_log_affiliate_enrollment ON referral_hierarchy;
CREATE TRIGGER trigger_log_affiliate_enrollment
  AFTER INSERT ON referral_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION log_affiliate_enrollment();

-- =====================================================
-- CONVENIENCE VIEWS
-- =====================================================

-- View: Recent errors
CREATE OR REPLACE VIEW error_logs AS
SELECT
  id,
  user_id,
  user_email,
  event_type,
  event_action,
  error_message,
  error_stack,
  error_code,
  request_path,
  metadata,
  created_at
FROM audit_logs
WHERE event_status = 'error'
ORDER BY created_at DESC;

-- View: Recent user activity (last 7 days)
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT
  user_id,
  user_email as email,
  event_type,
  event_action,
  event_status,
  created_at
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================

-- Function to clean up old audit logs (success logs older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  -- Only delete old success logs, keep errors longer
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_status = 'success';

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;

  RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION cleanup_old_audit_logs() SET search_path = public;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Audit logging system installed successfully';
  RAISE NOTICE '  - audit_logs table created';
  RAISE NOTICE '  - Automatic triggers for user creation, product access, affiliate enrollment';
  RAISE NOTICE '  - Views: error_logs, recent_user_activity';
  RAISE NOTICE '  - Cleanup function: cleanup_old_audit_logs()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Apply enhancements migration (010)';
  RAISE NOTICE '  2. View user logs: npx tsx scripts/view-user-logs.ts <email>';
END $$;
