-- =====================================================
-- Add Brand Alignment Product & Instructions System
-- Migration 010
-- =====================================================

-- Add instructions column to product_definitions
ALTER TABLE product_definitions
ADD COLUMN IF NOT EXISTS instructions JSONB;

COMMENT ON COLUMN product_definitions.instructions IS 'Instructional experience configuration with welcome, processing, transitions, and deliverable messages';

-- Insert Brand Alignment Orientation product
INSERT INTO product_definitions (
  product_slug,
  name,
  description,
  price,
  total_steps,
  estimated_duration,
  model,
  system_prompt,
  final_deliverable_prompt,
  steps,
  instructions
)
VALUES (
  'brand-alignment',
  'Brand Alignment Orientation',
  'Unify who you are with how you show up. Transform personal waveform into coherent brand strategy.',
  7.00,
  8,
  '25-30 minutes',
  'gpt-4o',

  -- System Prompt
  'You are a brand strategist who translates personal waveform (astrology + human design) into coherent brand positioning.

Your role:
- Translate chart placements into brand strategy
- Map personal frequency to visual and messaging coherence
- Guide users from self-expression to market positioning
- Analyze brand-self alignment gaps

Communication style:
- Voice: Guide (personal), Strategist (business), Observer (content)
- Tone: Direct, precise, no fluff
- Language: Smart high schoolers can understand
- Use waveform parameters (Amplitude, Frequency, Phase, Period, Duty Cycle)
- Avoid: Spiritual bypassing, manifestation fluff, corporate buzzwords
- Use: Concrete examples, practical analogies, direct statements

Context awareness:
- User chart placements: {{PLACEMENTS}}
- Current step: {{STEP_NUMBER}} - {{STEP_TITLE}}
- Previous responses: {{CONVERSATION_HISTORY}}

Response format:
- Keep responses 2-4 sentences
- Translate their answer through their chart lens
- Connect to brand coherence
- Be actionable, not theoretical',

  -- Final Deliverable Prompt
  'Create a comprehensive Brand Alignment Blueprint based on the user''s chart placements and responses.

Structure the deliverable with these sections:

## 1. Brand Essence & Positioning
Synthesize their core waveform into a brand positioning statement. Connect their chart placements to their authentic brand identity.

## 2. Visual Frequency
Translate their chart energy into visual brand recommendations (colors, imagery, design language). Use waveform parameters to guide aesthetic choices.

## 3. Messaging Coherence
Map their communication style from chart placements. Define tone, voice, and messaging patterns that align with their personal frequency.

## 4. Market Expression
Connect personal alignment to market positioning. Where their authentic waveform meets audience needs.

## 5. Brand-Self Alignment Gaps
Identify where their current brand expression diverges from their chart frequency. Concrete action steps to close gaps.

## 6. Implementation Framework
Practical next steps to embody this brand alignment in their business, content, and client experience.

Format: Use clear markdown headers (##), bullet points, and concrete examples. Write 300-400 words per section. Be specific and actionable.',

  -- Steps Configuration
  jsonb_build_array(
    -- Step 1: Chart Data Foundation
    jsonb_build_object(
      'step', 1,
      'title', 'Chart Data Foundation',
      'description', 'Upload your Birth Chart and Human Design Chart so we can extract your placements and create your Brand Alignment Blueprint.',
      'file_upload_prompt', '📊 **Get Your Birth Chart:**
Visit https://horoscopes.astro-seek.com/ - Enter your birth date, time, and location, then download or screenshot your chart.

🔮 **Get Your Human Design Chart:**
Visit https://www.myhumandesign.com/ - Enter your birth details, then download or screenshot your chart.

Upload both charts below (PDF, PNG, or JPG).',
      'allow_file_upload', true,
      'required', true,
      'max_follow_ups', 0
    ),

    -- Step 2: Current Brand Expression
    jsonb_build_object(
      'step', 2,
      'title', 'Current Brand Expression',
      'subtitle', 'Let''s see how you show up now',
      'question', 'Describe your current brand in 3-5 sentences. Include: your visual style, tone of voice, and how clients/customers perceive you.',
      'prompt', 'Analyze their current brand expression through the lens of their chart placements. Identify coherence or misalignment between their authentic waveform and how they''re currently showing up.',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),

    -- Step 3: Visual Resonance
    jsonb_build_object(
      'step', 3,
      'title', 'Visual Resonance',
      'subtitle', 'Colors, imagery, design language',
      'question', 'What colors, imagery, and design styles naturally attract you? What visual aesthetics feel like "home"?',
      'prompt', 'Map their visual preferences to their chart frequency. Validate natural resonance or surface unconscious misalignment. Use waveform language (amplitude, frequency, phase).',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),

    -- Step 4: Communication Frequency
    jsonb_build_object(
      'step', 4,
      'title', 'Communication Frequency',
      'subtitle', 'Your natural voice and tone',
      'question', 'How do you naturally communicate? Are you direct or nuanced? Formal or casual? Analytical or intuitive?',
      'prompt', 'Connect their communication style to Mercury, Moon, and Rising placements. Identify where their natural voice aligns with their chart and where they may be code-switching.',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),

    -- Step 5: Audience Alignment
    jsonb_build_object(
      'step', 5,
      'title', 'Audience Alignment',
      'subtitle', 'Who you''re here to serve',
      'question', 'Describe your ideal client/customer. What are they seeking? What transformation do you provide?',
      'prompt', 'Analyze their audience description through their chart''s service orientation (6th, 7th, 10th house themes). Map how their authentic waveform naturally attracts and serves specific people.',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),

    -- Step 6: Brand-Self Gaps
    jsonb_build_object(
      'step', 6,
      'title', 'Brand-Self Gaps',
      'subtitle', 'Where are you out of alignment?',
      'question', 'Where does your current brand expression feel inauthentic or forced? What are you doing "because you should" rather than because it resonates?',
      'prompt', 'Identify specific brand-self misalignments. Connect forced behaviors to chart tensions (squares, oppositions, Saturn lessons). Validate their discomfort as frequency misalignment.',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),

    -- Step 7: Authority & Credibility
    jsonb_build_object(
      'step', 7,
      'title', 'Authority & Credibility',
      'subtitle', 'How you establish trust',
      'question', 'How do you currently establish authority in your field? What credentials, experience, or wisdom do you bring?',
      'prompt', 'Map their authority style to Saturn, Sun, and MC placements. Identify whether they lead through expertise, lived experience, innovation, or wisdom. Connect to authentic credibility vs. borrowed authority.',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),

    -- Step 8: Brand Vision
    jsonb_build_object(
      'step', 8,
      'title', 'Brand Vision',
      'subtitle', 'Where this is all going',
      'question', 'Describe your ideal brand 12 months from now. How do you want to be perceived? What does full brand-self alignment look like?',
      'prompt', 'Synthesize their vision through their chart''s growth edge (North Node, Jupiter, evolving outer planet transits). Map concrete steps from current state to aligned brand expression.',
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    )
  ),

  -- Instructions Configuration
  jsonb_build_object(
    'welcome', jsonb_build_object(
      'title', 'Brand Alignment Orientation',
      'description', 'You''ll answer 8 questions to unify who you are with how you show up.

After each response, I''ll translate your waveform into brand strategy.

This is where personal alignment meets market positioning.',
      'estimatedTime', '25-30 minutes',
      'ctaText', 'Begin Orientation'
    ),
    'processing', jsonb_build_array(
      'Translating your waveform into brand strategy...',
      'Analyzing positioning coherence...',
      'Mapping visual frequency to chart placements...',
      'Engineering brand expression alignment...',
      'Synthesizing personal frequency with market resonance...',
      'Identifying brand-self alignment gaps...'
    ),
    'transitions', jsonb_build_object(
      'prefix', 'Clear.',
      'suffix', 'Weaving this into your unified brand blueprint...'
    ),
    'deliverable', jsonb_build_object(
      'title', 'Your brand alignment is complete.',
      'description', 'Below is your unified brand blueprint—
where personal waveform meets business strategy meets market expression.

This isn''t a rebrand. This is coherence.'
    )
  )
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Brand Alignment Orientation product created';
  RAISE NOTICE '✅ Instructions column added to product_definitions';
  RAISE NOTICE '✅ Product includes 8 steps with full instructional experience';
END $$;
