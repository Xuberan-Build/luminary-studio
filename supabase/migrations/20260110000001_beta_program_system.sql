-- =====================================================
-- BETA PROGRAM SYSTEM
-- Three Rites Beta Program Infrastructure
-- Self-service enrollment, feedback tracking, conversion optimization
-- =====================================================

-- =====================================================
-- TABLE: beta_participants
-- Master table tracking all beta participants (unlimited enrollment)
-- =====================================================
CREATE TABLE IF NOT EXISTS beta_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Enrollment tracking
  cohort_name TEXT NOT NULL DEFAULT 'Beta Cohort', -- Can segment by date ranges later
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  program_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  program_end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 weeks'),

  -- Application info (from landing page form)
  application_why_participate TEXT, -- "Why do you want to participate?"

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, withdrawn
  current_rite TEXT DEFAULT 'perception', -- perception, orientation, declaration, complete

  -- Progress counters (auto-updated via triggers)
  perception_completed_count INTEGER DEFAULT 0, -- Out of 5
  orientation_completed_count INTEGER DEFAULT 0, -- Out of 3
  declaration_completed_count INTEGER DEFAULT 0, -- Out of 3
  total_completion_percentage DECIMAL(5,2) DEFAULT 0.00, -- Out of 100

  -- Feedback tracking (auto-updated via triggers)
  micro_feedback_count INTEGER DEFAULT 0, -- Scans + blueprints + declarations feedback
  consolidation_feedback_count INTEGER DEFAULT 0, -- Rite I + Rite II consolidations
  complete_journey_submitted BOOLEAN DEFAULT FALSE,
  feedback_completion_rate DECIMAL(5,2) DEFAULT 0.00, -- % submitted vs products completed

  -- Conversion tracking
  total_amount_paid_before_offer DECIMAL(10,2) DEFAULT 0.00, -- Sum of à la carte purchases
  summary_pdf_generated BOOLEAN DEFAULT FALSE,
  summary_pdf_url TEXT,
  conversion_offer_presented_at TIMESTAMPTZ,
  discount_code_generated TEXT, -- Personalized Stripe discount code
  remaining_balance_offered DECIMAL(10,2), -- $60 - total_amount_paid
  conversion_decision TEXT, -- purchased, declined, pending
  conversion_decision_at TIMESTAMPTZ,
  conversion_amount DECIMAL(10,2),
  conversion_stripe_session_id TEXT,

  -- Communication tracking
  welcome_email_sent_at TIMESTAMPTZ,
  week_1_checkin_sent_at TIMESTAMPTZ,
  week_2_checkin_sent_at TIMESTAMPTZ,
  week_4_checkin_sent_at TIMESTAMPTZ,
  rite_one_celebration_sent_at TIMESTAMPTZ,
  rite_two_celebration_sent_at TIMESTAMPTZ,
  rite_three_celebration_sent_at TIMESTAMPTZ,
  completion_email_sent_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT, -- Admin notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id), -- One beta participation per user (can adjust if needed)
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'withdrawn')),
  CONSTRAINT valid_rite CHECK (current_rite IN ('perception', 'orientation', 'declaration', 'complete')),
  CONSTRAINT valid_conversion CHECK (conversion_decision IN ('purchased', 'declined', 'pending'))
);

-- Indexes for performance
CREATE INDEX idx_beta_participants_user ON beta_participants(user_id);
CREATE INDEX idx_beta_participants_cohort ON beta_participants(cohort_name);
CREATE INDEX idx_beta_participants_status ON beta_participants(status);
CREATE INDEX idx_beta_participants_enrollment_date ON beta_participants(enrollment_date);
CREATE INDEX idx_beta_participants_current_rite ON beta_participants(current_rite);

-- =====================================================
-- TABLE: scan_feedback
-- Micro-feedback after each Perception scan (5 scans)
-- =====================================================
CREATE TABLE IF NOT EXISTS scan_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL, -- perception-rite-scan-1, etc.
  session_id UUID REFERENCES product_sessions(id) ON DELETE SET NULL,

  -- Survey responses (1-5 scale)
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5), -- How clear was the insight?
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5), -- How relevant to your situation?
  actionability_score INTEGER CHECK (actionability_score BETWEEN 1 AND 5), -- Can you act on this?
  surprise_level INTEGER CHECK (surprise_level BETWEEN 1 AND 5), -- How surprising was this insight?

  -- Open-ended responses
  biggest_aha TEXT, -- "What was your biggest 'aha' moment?"
  implementation_plan TEXT, -- "What will you do differently based on this scan?"
  confusion_points TEXT, -- "What was confusing or unclear?"

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  survey_duration_seconds INTEGER, -- Time to complete

  UNIQUE(beta_participant_id, product_slug)
);

CREATE INDEX idx_scan_feedback_participant ON scan_feedback(beta_participant_id);
CREATE INDEX idx_scan_feedback_product ON scan_feedback(product_slug);
CREATE INDEX idx_scan_feedback_submitted ON scan_feedback(submitted_at);

-- =====================================================
-- TABLE: rite_one_consolidation
-- After completing all 5 Perception scans
-- =====================================================
CREATE TABLE IF NOT EXISTS rite_one_consolidation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL UNIQUE REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Consolidated perception scores
  overall_value_score INTEGER CHECK (overall_value_score BETWEEN 1 AND 10),
  completion_time_weeks DECIMAL(3,1), -- How long to complete all 5 scans

  -- Mini NPS for Rite isolation
  rite_one_nps INTEGER CHECK (rite_one_nps BETWEEN 0 AND 10), -- "Would you recommend just the Perception scans?"

  -- Rankings
  most_valuable_scan TEXT, -- Which scan was most valuable?
  least_valuable_scan TEXT, -- Which scan was least valuable?

  -- Synthesis questions
  key_transformation TEXT, -- "What's the biggest shift in how you see yourself?"
  integration_challenge TEXT, -- "What's hardest about integrating these insights?"
  breakthrough_moment TEXT, -- "Describe your biggest breakthrough"

  -- Value assessment
  perceived_value_vs_price TEXT CHECK (
    perceived_value_vs_price IN ('much_less', 'less', 'equal', 'more', 'much_more')
  ), -- vs $12
  would_recommend BOOLEAN,
  testimonial_consent BOOLEAN DEFAULT FALSE,
  testimonial_text TEXT,

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  survey_duration_seconds INTEGER,
  reminded_at TIMESTAMPTZ -- If they clicked "Remind me in 24 hours"
);

CREATE INDEX idx_rite_one_consolidation_participant ON rite_one_consolidation(beta_participant_id);
CREATE INDEX idx_rite_one_consolidation_nps ON rite_one_consolidation(rite_one_nps);

-- =====================================================
-- TABLE: blueprint_feedback
-- After each Orientation blueprint (3 blueprints)
-- =====================================================
CREATE TABLE IF NOT EXISTS blueprint_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL, -- personal-alignment, business-alignment, brand-alignment
  session_id UUID REFERENCES product_sessions(id) ON DELETE SET NULL,

  -- Quality scores (1-5 scale)
  insight_depth_score INTEGER CHECK (insight_depth_score BETWEEN 1 AND 5),
  personalization_score INTEGER CHECK (personalization_score BETWEEN 1 AND 5),
  actionability_score INTEGER CHECK (actionability_score BETWEEN 1 AND 5),

  -- Application
  immediate_action TEXT, -- "What's the first thing you'll implement?"
  biggest_gap_revealed TEXT, -- "What gap did this reveal in your current approach?"
  integration_with_perception TEXT, -- "How does this build on your Perception insights?"

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  survey_duration_seconds INTEGER,

  UNIQUE(beta_participant_id, product_slug)
);

CREATE INDEX idx_blueprint_feedback_participant ON blueprint_feedback(beta_participant_id);
CREATE INDEX idx_blueprint_feedback_product ON blueprint_feedback(product_slug);

-- =====================================================
-- TABLE: rite_two_consolidation
-- After completing all 3 Orientation blueprints
-- =====================================================
CREATE TABLE IF NOT EXISTS rite_two_consolidation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL UNIQUE REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Consolidated orientation scores
  overall_value_score INTEGER CHECK (overall_value_score BETWEEN 1 AND 10),
  completion_time_weeks DECIMAL(3,1),

  -- Mini NPS for Rite isolation
  rite_two_nps INTEGER CHECK (rite_two_nps BETWEEN 0 AND 10), -- "Would you recommend the Orientation blueprints?"

  -- Rankings
  most_valuable_blueprint TEXT,
  least_valuable_blueprint TEXT,

  -- Strategic clarity
  strategic_clarity_before INTEGER CHECK (strategic_clarity_before BETWEEN 1 AND 10),
  strategic_clarity_after INTEGER CHECK (strategic_clarity_after BETWEEN 1 AND 10),
  business_model_confidence TEXT, -- "How confident are you in your business model now?"

  -- Value assessment
  perceived_value_vs_price TEXT CHECK (
    perceived_value_vs_price IN ('much_less', 'less', 'equal', 'more', 'much_more')
  ), -- vs $21
  would_recommend BOOLEAN,
  testimonial_consent BOOLEAN DEFAULT FALSE,
  testimonial_text TEXT,

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  survey_duration_seconds INTEGER,
  reminded_at TIMESTAMPTZ
);

CREATE INDEX idx_rite_two_consolidation_participant ON rite_two_consolidation(beta_participant_id);
CREATE INDEX idx_rite_two_consolidation_nps ON rite_two_consolidation(rite_two_nps);

-- =====================================================
-- TABLE: declaration_feedback
-- After each Declaration product (3 declarations)
-- =====================================================
CREATE TABLE IF NOT EXISTS declaration_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL, -- declaration-rite-life-vision, etc.
  session_id UUID REFERENCES product_sessions(id) ON DELETE SET NULL,

  -- Commitment scores (1-5 scale)
  commitment_clarity_score INTEGER CHECK (commitment_clarity_score BETWEEN 1 AND 5),
  execution_confidence_score INTEGER CHECK (execution_confidence_score BETWEEN 1 AND 5),
  alignment_score INTEGER CHECK (alignment_score BETWEEN 1 AND 5), -- Aligned with earlier work?

  -- Decision making
  decision_made TEXT, -- "What decision did you make based on this?"
  commitment_level INTEGER CHECK (commitment_level BETWEEN 1 AND 10), -- "How committed are you to this path?"
  support_needed TEXT, -- "What support do you need to execute?"

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  survey_duration_seconds INTEGER,

  UNIQUE(beta_participant_id, product_slug)
);

CREATE INDEX idx_declaration_feedback_participant ON declaration_feedback(beta_participant_id);
CREATE INDEX idx_declaration_feedback_product ON declaration_feedback(product_slug);

-- =====================================================
-- TABLE: complete_journey_feedback
-- CRITICAL: Primary conversion metric after all 11 products
-- =====================================================
CREATE TABLE IF NOT EXISTS complete_journey_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL UNIQUE REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Overall transformation assessment
  transformation_score INTEGER CHECK (transformation_score BETWEEN 1 AND 10),
  clarity_gained INTEGER CHECK (clarity_gained BETWEEN 1 AND 10),
  confidence_gained INTEGER CHECK (confidence_gained BETWEEN 1 AND 10),
  direction_clarity INTEGER CHECK (direction_clarity BETWEEN 1 AND 10),

  -- Journey coherence
  journey_coherence_score INTEGER CHECK (journey_coherence_score BETWEEN 1 AND 10), -- Did it flow well?
  rite_integration_score INTEGER CHECK (rite_integration_score BETWEEN 1 AND 10), -- Did Rites build on each other?

  -- Most/least valuable
  most_valuable_rite TEXT CHECK (most_valuable_rite IN ('perception', 'orientation', 'declaration')),
  most_valuable_product_overall TEXT, -- Specific product slug
  least_valuable_product_overall TEXT,

  -- Comprehensive transformation
  before_journey_state TEXT, -- "Describe where you were before starting"
  after_journey_state TEXT, -- "Describe where you are now"
  biggest_breakthrough TEXT,
  unexpected_insight TEXT,

  -- CONVERSION SIGNALS (CRITICAL)
  perceived_total_value_vs_60 TEXT CHECK (
    perceived_total_value_vs_60 IN ('much_less', 'less', 'equal', 'more', 'much_more')
  ), -- How does value compare to $60?
  willingness_to_pay_amount DECIMAL(10,2), -- "What would you pay for this complete journey?"
  purchase_timeline TEXT CHECK (
    purchase_timeline IN ('immediate', '1_month', '3_months', 'no')
  ),

  -- 🎯 CRITICAL QUESTION: Real-time objection data
  what_would_make_you_say_yes TEXT, -- "What would make you say yes to $60 right now?"

  -- NPS and referral
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10), -- "How likely to recommend?" (0-10)
  would_refer_others BOOLEAN,
  referral_commitment_count INTEGER DEFAULT 0, -- "How many people would you refer?"

  -- Founding member interest
  founding_member_interest TEXT CHECK (
    founding_member_interest IN ('definitely', 'probably', 'maybe', 'probably_not', 'definitely_not')
  ),
  founding_member_decision_factors TEXT, -- "What would influence your decision?"

  -- Testimonial
  testimonial_consent BOOLEAN DEFAULT FALSE,
  testimonial_text TEXT,
  video_testimonial_interest BOOLEAN DEFAULT FALSE,

  -- Open feedback
  what_worked_best TEXT,
  what_needs_improvement TEXT,
  missing_elements TEXT,
  additional_support_needed TEXT,

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  survey_duration_seconds INTEGER
);

CREATE INDEX idx_complete_journey_participant ON complete_journey_feedback(beta_participant_id);
CREATE INDEX idx_complete_journey_nps ON complete_journey_feedback(nps_score);
CREATE INDEX idx_complete_journey_founding ON complete_journey_feedback(founding_member_interest);
CREATE INDEX idx_complete_journey_timeline ON complete_journey_feedback(purchase_timeline);

-- =====================================================
-- TABLE: beta_conversion_results
-- Final conversion tracking with à la carte context
-- =====================================================
CREATE TABLE IF NOT EXISTS beta_conversion_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_participant_id UUID NOT NULL UNIQUE REFERENCES beta_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Offer details
  offer_presented_at TIMESTAMPTZ NOT NULL,
  offer_amount DECIMAL(10,2) NOT NULL, -- Could be $60 or less if already purchased some
  offer_type TEXT NOT NULL DEFAULT 'founding_member',

  -- À la carte purchase tracking
  total_paid_before_offer DECIMAL(10,2) DEFAULT 0.00, -- Sum of individual purchases
  discount_code_offered TEXT, -- Personalized Stripe discount code
  discount_amount DECIMAL(10,2), -- $60 - total_paid_before_offer

  -- Purchase stage (when did they convert?)
  purchased_at_stage TEXT CHECK (
    purchased_at_stage IN ('during_rite_one', 'during_rite_two', 'during_rite_three', 'after_completion', 'never')
  ),

  -- Decision
  decision TEXT NOT NULL CHECK (decision IN ('purchased', 'declined', 'pending')),
  decision_made_at TIMESTAMPTZ,

  -- Purchase details (if purchased)
  purchased_at TIMESTAMPTZ,
  stripe_session_id TEXT,
  amount_paid DECIMAL(10,2),
  final_total_investment DECIMAL(10,2), -- total_paid_before_offer + amount_paid
  payment_plan TEXT, -- full, installment_2, installment_3

  -- Decline details (if declined)
  decline_reason TEXT,
  decline_feedback TEXT,
  future_interest BOOLEAN,

  -- Follow-up
  follow_up_scheduled BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_beta_conversion_participant ON beta_conversion_results(beta_participant_id);
CREATE INDEX idx_beta_conversion_decision ON beta_conversion_results(decision);
CREATE INDEX idx_beta_conversion_stage ON beta_conversion_results(purchased_at_stage);
CREATE INDEX idx_beta_conversion_date ON beta_conversion_results(decision_made_at);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all beta tables
ALTER TABLE beta_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE rite_one_consolidation ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE rite_two_consolidation ENABLE ROW LEVEL SECURITY;
ALTER TABLE declaration_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE complete_journey_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_conversion_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own beta data
CREATE POLICY "Users view own beta participation"
  ON beta_participants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own scan feedback"
  ON scan_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own rite one consolidation"
  ON rite_one_consolidation FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own blueprint feedback"
  ON blueprint_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own rite two consolidation"
  ON rite_two_consolidation FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own declaration feedback"
  ON declaration_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own journey feedback"
  ON complete_journey_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own conversion results"
  ON beta_conversion_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access for admin operations and triggers
CREATE POLICY "Service role full access beta participants"
  ON beta_participants FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access scan feedback"
  ON scan_feedback FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access rite one consolidation"
  ON rite_one_consolidation FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access blueprint feedback"
  ON blueprint_feedback FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access rite two consolidation"
  ON rite_two_consolidation FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access declaration feedback"
  ON declaration_feedback FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access journey feedback"
  ON complete_journey_feedback FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access conversion results"
  ON beta_conversion_results FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTION: enroll_beta_participant
-- Self-service enrollment for beta landing page
-- =====================================================
CREATE OR REPLACE FUNCTION enroll_beta_participant(
  p_user_email TEXT,
  p_why_participate TEXT DEFAULT NULL,
  p_cohort_name TEXT DEFAULT 'Beta Cohort'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_participant_id UUID;
  product_record RECORD;
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Get or create user
  SELECT id INTO v_user_id FROM users WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    INSERT INTO users (email, name)
    VALUES (p_user_email, split_part(p_user_email, '@', 1))
    RETURNING id INTO v_user_id;
  END IF;

  -- Check if already enrolled
  SELECT id INTO v_participant_id
  FROM beta_participants
  WHERE user_id = v_user_id;

  IF v_participant_id IS NOT NULL THEN
    -- Already enrolled, return existing ID
    RETURN v_participant_id;
  END IF;

  v_start_date := NOW();

  -- Create beta participant record
  INSERT INTO beta_participants (
    user_id,
    cohort_name,
    program_start_date,
    program_end_date,
    application_why_participate
  ) VALUES (
    v_user_id,
    p_cohort_name,
    v_start_date,
    v_start_date + INTERVAL '6 weeks',
    p_why_participate
  )
  RETURNING id INTO v_participant_id;

  -- Grant access to all 11 products (5 Perception + 3 Orientation + 3 Declaration)
  FOR product_record IN
    SELECT product_slug, name
    FROM product_definitions
    WHERE product_slug IN (
      'perception-rite-scan-1',
      'perception-rite-scan-2',
      'perception-rite-scan-3',
      'perception-rite-scan-4',
      'perception-rite-scan-5',
      'personal-alignment',
      'business-alignment',
      'brand-alignment',
      'declaration-rite-life-vision',
      'declaration-rite-business-model',
      'declaration-rite-strategic-path'
    )
  LOOP
    INSERT INTO product_access (
      user_id,
      product_slug,
      access_granted,
      purchase_date,
      stripe_session_id,
      amount_paid,
      purchase_source
    ) VALUES (
      v_user_id,
      product_record.product_slug,
      true,
      NOW(),
      'beta_program',
      0,
      'beta_enrollment'
    )
    ON CONFLICT (user_id, product_slug)
    DO UPDATE SET
      access_granted = true,
      purchase_source = 'beta_enrollment';

    RAISE NOTICE 'Granted access to: %', product_record.name;
  END LOOP;

  RAISE NOTICE 'Beta participant enrolled: % (ID: %)', p_user_email, v_participant_id;

  RETURN v_participant_id;
END;
$$;

-- =====================================================
-- TRIGGER FUNCTIONS: Auto-update progress counters
-- =====================================================

-- Update beta participant progress when products are completed
CREATE OR REPLACE FUNCTION update_beta_participant_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_record RECORD;
  perception_count INTEGER;
  orientation_count INTEGER;
  declaration_count INTEGER;
  total_products INTEGER;
  total_feedback INTEGER;
  feedback_rate DECIMAL(5,2);
BEGIN
  -- Check if user is a beta participant
  SELECT * INTO participant_record
  FROM beta_participants
  WHERE user_id = NEW.user_id;

  IF participant_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count completed products by rite
  SELECT COUNT(*) INTO perception_count
  FROM product_access
  WHERE user_id = NEW.user_id
    AND product_slug SIMILAR TO 'perception-rite-scan-[1-5]'
    AND completed_at IS NOT NULL;

  SELECT COUNT(*) INTO orientation_count
  FROM product_access
  WHERE user_id = NEW.user_id
    AND product_slug IN ('personal-alignment', 'business-alignment', 'brand-alignment')
    AND completed_at IS NOT NULL;

  SELECT COUNT(*) INTO declaration_count
  FROM product_access
  WHERE user_id = NEW.user_id
    AND product_slug SIMILAR TO 'declaration-rite-%'
    AND completed_at IS NOT NULL;

  total_products := perception_count + orientation_count + declaration_count;

  -- Calculate feedback completion rate
  SELECT COUNT(*) INTO total_feedback
  FROM (
    SELECT id FROM scan_feedback WHERE beta_participant_id = participant_record.id
    UNION ALL
    SELECT id FROM blueprint_feedback WHERE beta_participant_id = participant_record.id
    UNION ALL
    SELECT id FROM declaration_feedback WHERE beta_participant_id = participant_record.id
    UNION ALL
    SELECT id FROM rite_one_consolidation WHERE beta_participant_id = participant_record.id
    UNION ALL
    SELECT id FROM rite_two_consolidation WHERE beta_participant_id = participant_record.id
    UNION ALL
    SELECT id FROM complete_journey_feedback WHERE beta_participant_id = participant_record.id
  ) AS all_feedback;

  IF total_products > 0 THEN
    feedback_rate := (total_feedback::DECIMAL / total_products::DECIMAL) * 100;
  ELSE
    feedback_rate := 0;
  END IF;

  -- Update beta participant record
  UPDATE beta_participants
  SET
    perception_completed_count = perception_count,
    orientation_completed_count = orientation_count,
    declaration_completed_count = declaration_count,
    total_completion_percentage = ((perception_count + orientation_count + declaration_count) / 11.0) * 100,
    feedback_completion_rate = feedback_rate,
    current_rite = CASE
      WHEN perception_count < 5 THEN 'perception'
      WHEN orientation_count < 3 THEN 'orientation'
      WHEN declaration_count < 3 THEN 'declaration'
      ELSE 'complete'
    END,
    updated_at = NOW()
  WHERE id = participant_record.id;

  RETURN NEW;
END;
$$;

-- Trigger on product_access completion
DROP TRIGGER IF EXISTS trigger_update_beta_progress ON product_access;
CREATE TRIGGER trigger_update_beta_progress
  AFTER UPDATE OF completed_at ON product_access
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
  EXECUTE FUNCTION update_beta_participant_progress();

-- Update feedback counts when surveys are submitted
CREATE OR REPLACE FUNCTION update_beta_feedback_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  micro_count INTEGER;
  consolidation_count INTEGER;
  journey_submitted BOOLEAN;
  total_products INTEGER;
  total_feedback INTEGER;
  feedback_rate DECIMAL(5,2);
BEGIN
  -- Count all feedback types
  SELECT COUNT(*) INTO micro_count
  FROM (
    SELECT id FROM scan_feedback WHERE beta_participant_id = NEW.beta_participant_id
    UNION ALL
    SELECT id FROM blueprint_feedback WHERE beta_participant_id = NEW.beta_participant_id
    UNION ALL
    SELECT id FROM declaration_feedback WHERE beta_participant_id = NEW.beta_participant_id
  ) AS micro_feedback;

  SELECT COUNT(*) INTO consolidation_count
  FROM (
    SELECT id FROM rite_one_consolidation WHERE beta_participant_id = NEW.beta_participant_id
    UNION ALL
    SELECT id FROM rite_two_consolidation WHERE beta_participant_id = NEW.beta_participant_id
  ) AS consolidations;

  SELECT EXISTS(
    SELECT 1 FROM complete_journey_feedback WHERE beta_participant_id = NEW.beta_participant_id
  ) INTO journey_submitted;

  -- Get total products completed
  SELECT
    perception_completed_count + orientation_completed_count + declaration_completed_count
  INTO total_products
  FROM beta_participants
  WHERE id = NEW.beta_participant_id;

  total_feedback := micro_count + consolidation_count + (CASE WHEN journey_submitted THEN 1 ELSE 0 END);

  IF total_products > 0 THEN
    feedback_rate := (total_feedback::DECIMAL / total_products::DECIMAL) * 100;
  ELSE
    feedback_rate := 0;
  END IF;

  -- Update beta participant
  UPDATE beta_participants
  SET
    micro_feedback_count = micro_count,
    consolidation_feedback_count = consolidation_count,
    complete_journey_submitted = journey_submitted,
    feedback_completion_rate = feedback_rate,
    updated_at = NOW()
  WHERE id = NEW.beta_participant_id;

  RETURN NEW;
END;
$$;

-- Triggers on all feedback tables
DROP TRIGGER IF EXISTS trigger_update_scan_feedback_count ON scan_feedback;
CREATE TRIGGER trigger_update_scan_feedback_count
  AFTER INSERT ON scan_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_counts();

DROP TRIGGER IF EXISTS trigger_update_blueprint_feedback_count ON blueprint_feedback;
CREATE TRIGGER trigger_update_blueprint_feedback_count
  AFTER INSERT ON blueprint_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_counts();

DROP TRIGGER IF EXISTS trigger_update_declaration_feedback_count ON declaration_feedback;
CREATE TRIGGER trigger_update_declaration_feedback_count
  AFTER INSERT ON declaration_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_counts();

DROP TRIGGER IF EXISTS trigger_update_rite_one_consolidation_count ON rite_one_consolidation;
CREATE TRIGGER trigger_update_rite_one_consolidation_count
  AFTER INSERT ON rite_one_consolidation
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_counts();

DROP TRIGGER IF EXISTS trigger_update_rite_two_consolidation_count ON rite_two_consolidation;
CREATE TRIGGER trigger_update_rite_two_consolidation_count
  AFTER INSERT ON rite_two_consolidation
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_counts();

DROP TRIGGER IF EXISTS trigger_update_journey_feedback_count ON complete_journey_feedback;
CREATE TRIGGER trigger_update_journey_feedback_count
  AFTER INSERT ON complete_journey_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_counts();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Beta Program System Created Successfully';
  RAISE NOTICE '✅ 8 tables: beta_participants + 6 feedback tables + conversion_results';
  RAISE NOTICE '✅ RLS policies: Users view own, service_role full access';
  RAISE NOTICE '✅ Enrollment function: enroll_beta_participant(email, why_participate)';
  RAISE NOTICE '✅ Auto-update triggers: Progress counters + feedback tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create beta landing page at /beta';
  RAISE NOTICE '2. Build feedback form components';
  RAISE NOTICE '3. Test enrollment with your account';
  RAISE NOTICE '';
END $$;
