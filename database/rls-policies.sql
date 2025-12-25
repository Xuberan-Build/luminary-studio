-- =====================================================
-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Product definitions are public (read-only for all)
ALTER TABLE product_definitions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Service role can do anything (for webhook operations)
CREATE POLICY "Service role has full access to users"
  ON users
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- PRODUCT ACCESS TABLE POLICIES
-- =====================================================

-- Users can view their own product access
CREATE POLICY "Users can view own product access"
  ON product_access
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Service role can insert/update (for Stripe webhook)
CREATE POLICY "Service role can manage product access"
  ON product_access
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- PRODUCT DEFINITIONS TABLE POLICIES
-- =====================================================

-- Anyone can read active product definitions
CREATE POLICY "Anyone can read active products"
  ON product_definitions
  FOR SELECT
  USING (is_active = true);

-- Only service role can modify
CREATE POLICY "Service role can manage products"
  ON product_definitions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- PRODUCT SESSIONS TABLE POLICIES
-- =====================================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON product_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can create sessions (if they have product access)
CREATE POLICY "Users can create sessions for owned products"
  ON product_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    AND EXISTS (
      SELECT 1 FROM product_access
      WHERE user_id = product_sessions.user_id
        AND product_slug = product_sessions.product_slug
        AND access_granted = true
    )
  );

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON product_sessions
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Service role has full access
CREATE POLICY "Service role can manage sessions"
  ON product_sessions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- CONVERSATIONS TABLE POLICIES
-- =====================================================

-- Users can view conversations for their own sessions
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM product_sessions
      WHERE product_sessions.id = conversations.session_id
        AND product_sessions.user_id::text = auth.uid()::text
    )
  );

-- Users can insert conversations for their own sessions
CREATE POLICY "Users can create conversations for own sessions"
  ON conversations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_sessions
      WHERE product_sessions.id = conversations.session_id
        AND product_sessions.user_id::text = auth.uid()::text
    )
  );

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM product_sessions
      WHERE product_sessions.id = conversations.session_id
        AND product_sessions.user_id::text = auth.uid()::text
    )
  );

-- Service role has full access
CREATE POLICY "Service role can manage conversations"
  ON conversations
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- UPLOADED DOCUMENTS TABLE POLICIES
-- =====================================================

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON uploaded_documents
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can upload for their own sessions
CREATE POLICY "Users can upload for own sessions"
  ON uploaded_documents
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    AND EXISTS (
      SELECT 1 FROM product_sessions
      WHERE product_sessions.id = uploaded_documents.session_id
        AND product_sessions.user_id::text = auth.uid()::text
    )
  );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON uploaded_documents
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Service role has full access
CREATE POLICY "Service role can manage uploads"
  ON uploaded_documents
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
