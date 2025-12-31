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
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_event_action ON audit_logs(event_action);
CREATE INDEX idx_audit_logs_event_status ON audit_logs(event_status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- Composite index for user activity timeline
CREATE INDEX idx_audit_logs_user_timeline ON audit_logs(user_id, event_type, created_at DESC);

-- =====================================================
-- USER SESSIONS TABLE (Enhanced tracking)
-- =====================================================

-- Add audit columns to existing user_sessions table if they don't exist
DO $$
BEGIN
  -- Add IP address tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN ip_address TEXT;
  END IF;

  -- Add user agent tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN user_agent TEXT;
  END IF;

  -- Add last activity timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create index for session activity tracking
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity
  ON user_sessions(user_id, last_activity_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log events easily from triggers or functions
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_action TEXT,
  p_event_status TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    event_type,
    event_action,
    event_status,
    metadata,
    error_message
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_action,
    p_event_status,
    p_metadata,
    p_error_message
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search path for security
ALTER FUNCTION log_audit_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT) SET search_path = public;

-- =====================================================
-- AUTO-LOGGING TRIGGERS
-- =====================================================

-- Log user creation
CREATE OR REPLACE FUNCTION log_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.id,
    'auth',
    'user_created',
    'success',
    jsonb_build_object(
      'email', NEW.email,
      'full_name', NEW.full_name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_creation();

-- Log product access grants
CREATE OR REPLACE FUNCTION log_product_access_grant()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.user_id,
    'product',
    'access_granted',
    CASE WHEN NEW.access_granted THEN 'success' ELSE 'pending' END,
    jsonb_build_object(
      'product_slug', NEW.product_slug,
      'amount_paid', NEW.amount_paid,
      'stripe_session_id', NEW.stripe_session_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_product_access
  AFTER INSERT ON product_access
  FOR EACH ROW
  EXECUTE FUNCTION log_product_access_grant();

-- Log affiliate enrollment
CREATE OR REPLACE FUNCTION log_affiliate_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.affiliate_id,
    'affiliate',
    'enrolled',
    'success',
    jsonb_build_object(
      'referral_code', NEW.referral_code,
      'current_track', NEW.current_track,
      'referred_by_id', NEW.referred_by_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_affiliate_enrollment
  AFTER INSERT ON referral_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION log_affiliate_enrollment();

-- Log session creation
CREATE OR REPLACE FUNCTION log_session_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.user_id,
    'product',
    'session_started',
    'success',
    jsonb_build_object(
      'session_id', NEW.id,
      'product_slug', NEW.product_slug,
      'parent_session_id', NEW.parent_session_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_session_creation
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_session_creation();

-- =====================================================
-- CLEANUP POLICY (Optional - keep logs for 90 days)
-- =====================================================

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_status = 'success'; -- Keep errors longer

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Set search path for security
ALTER FUNCTION cleanup_old_audit_logs() SET search_path = public;

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- View for recent user activity
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT
  al.user_id,
  u.email,
  u.full_name,
  al.event_type,
  al.event_action,
  al.event_status,
  al.error_message,
  al.metadata,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;

-- View for error tracking
CREATE OR REPLACE VIEW error_logs AS
SELECT
  al.user_id,
  u.email,
  al.event_type,
  al.event_action,
  al.error_message,
  al.error_stack,
  al.error_code,
  al.request_path,
  al.metadata,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.event_status = 'error'
ORDER BY al.created_at DESC;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Audit logging system created successfully';
  RAISE NOTICE '  - audit_logs table created';
  RAISE NOTICE '  - Auto-logging triggers installed';
  RAISE NOTICE '  - Helper functions created';
  RAISE NOTICE '  - Useful views created';
END $$;
