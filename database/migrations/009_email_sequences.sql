-- Migration: Email Sequences System
-- Purpose: Enable automated email sequences for affiliate onboarding
-- Related PRD: Affiliate Email Sequence System
-- Created: 2025-12-27

-- ============================================================================
-- 1. Create email_sequences table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Sequence metadata
  sequence_type TEXT NOT NULL, -- e.g., 'affiliate_invitation'
  trigger_event TEXT NOT NULL, -- e.g., 'deliverable_completed'
  trigger_timestamp TIMESTAMPTZ NOT NULL, -- When the trigger event occurred

  -- Scheduling
  scheduled_send_at TIMESTAMPTZ NOT NULL, -- When to send this email
  delay_minutes INTEGER NOT NULL DEFAULT 30, -- Delay from trigger to send

  -- Delivery status
  email_status TEXT NOT NULL DEFAULT 'scheduled',
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- Email content (stored for audit trail)
  email_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {
  --   product_name: string,
  --   product_slug: string,
  --   deliverable_preview: string,
  --   user_first_name: string,
  --   user_email: string
  -- }

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email_status CHECK (
    email_status IN ('scheduled', 'sent', 'failed', 'cancelled')
  ),
  CONSTRAINT valid_sequence_type CHECK (
    sequence_type IN ('affiliate_invitation')
  ),
  CONSTRAINT valid_delay CHECK (delay_minutes >= 0),
  CONSTRAINT unique_user_sequence UNIQUE(user_id, sequence_type)
);

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================

-- Index for cron job to find emails ready to send
CREATE INDEX idx_email_sequences_scheduled ON public.email_sequences(scheduled_send_at, email_status)
WHERE email_status = 'scheduled';

-- Index for user lookup
CREATE INDEX idx_email_sequences_user_id ON public.email_sequences(user_id);

-- Index for analytics queries
CREATE INDEX idx_email_sequences_sent_at ON public.email_sequences(sent_at)
WHERE sent_at IS NOT NULL;

-- ============================================================================
-- 3. Enable Row Level Security
-- ============================================================================

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- Users can only view their own email sequences
CREATE POLICY "Users can view own email sequences"
  ON public.email_sequences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access (for cron jobs and webhooks)
CREATE POLICY "Service role full access to email sequences"
  ON public.email_sequences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 4. Create updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_email_sequences_updated_at
  BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_sequences_updated_at();

-- ============================================================================
-- 5. Create helper function to cancel pending emails
-- ============================================================================

CREATE OR REPLACE FUNCTION cancel_user_pending_emails(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cancelled_count INTEGER;
BEGIN
  -- Cancel all scheduled emails for user
  UPDATE email_sequences
  SET
    email_status = 'cancelled',
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND email_status = 'scheduled';

  GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;

  RETURN v_cancelled_count;
END;
$$;

-- ============================================================================
-- 6. Create function to clean up old emails (retention policy)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_email_sequences(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete emails older than retention period
  DELETE FROM email_sequences
  WHERE
    created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND email_status IN ('sent', 'failed', 'cancelled');

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- 7. Grant permissions
-- ============================================================================

-- Grant permissions to authenticated users (read only their own)
GRANT SELECT ON public.email_sequences TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON public.email_sequences TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION cancel_user_pending_emails(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_email_sequences(INTEGER) TO service_role;

-- ============================================================================
-- Migration complete
-- ============================================================================

-- Verification query (run manually to verify)
-- SELECT
--   tablename,
--   rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'email_sequences';
--
-- SELECT * FROM pg_policies WHERE tablename = 'email_sequences';
