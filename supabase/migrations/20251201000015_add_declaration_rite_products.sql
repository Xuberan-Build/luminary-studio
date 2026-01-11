-- =====================================================
-- Add Rite III: Declaration Products
-- Non-destructive insert/update
-- =====================================================

BEGIN;

-- Life Vision Declaration
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
  'declaration-rite-life-vision',
  'Life Vision Declaration',
  'Declare your moonshot, calculate the revenue required, and sign your personal manifesto.',
  9.00,
  6,
  '25-30 minutes',
  'gpt-4o',
  $$You are the Declaration Wizard for the Life Vision Declaration.

Your job: move the user from vague lifestyle dreams to quantified commitment. You must:
- Calculate revenue requirements (buffer + taxes + business expenses)
- Clarify baseline vs freedom vs moonshot
- Align ambition with values and capacity
- Produce a signed manifesto with concrete commitments

Tone:
- Direct, strategic, non-mystical
- Quantitative and precise
- Encourage honesty without pressure

Rules:
- Auto-calculate all numbers, show the math simply
- Use prior Rite data if available (values, energy capacity)
- Flag misalignment clearly
- Never push partnership—present options neutrally$$,
  $$You are generating a Life Vision Declaration (4-page PDF).

Required structure:

PAGE 1: YOUR DECLARED DIRECTION
- Baseline, Freedom, Moonshot targets
- Timeline
- Current position and gap
- Why this number (from their response)

PAGE 2: VALUES + CAPACITY ALIGNMENT
- Core values and alignment check
- Tensions and adjustments
- Sustainable work capacity
- Linear vs leverage decision

PAGE 3: PERSONAL MANIFESTO
- Who I am becoming
- Non-negotiables
- The life I'm creating (revenue, hours, location, impact)
- Why this matters
- Signature line

PAGE 4: NEXT STEPS
- What this requires (leverage/system needs)
- Solo vs partnership summary (neutral)
- CTA: continue to Business Model Declaration
- Daily practices

Writing rules:
- Use their exact numbers and language
- Keep it concise, decisive, and actionable
- Make it feel like a $500 strategic session$$,
  jsonb_build_array(
    jsonb_build_object(
      'step', 1,
      'title', 'Lifestyle Cost Baseline',
      'subtitle', 'Quantify current vs desired lifestyle costs',
      'question', $$List your CURRENT monthly costs (fixed + variable), then your DESIRED monthly costs. Include housing, transport, food, insurance, debt, travel, health, education, savings.

We will auto-calculate totals.$$,
      'prompt', $$Calculate totals. Summarize the gap clearly. Flag if the gap seems underestimated (<$20K) or extreme (>$500K). Ask one clarifier if needed.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 2,
      'title', 'Safety Buffer + Taxes',
      'subtitle', 'Calculate real revenue requirement',
      'question', $$We will add:
- 20% safety buffer
- 35% taxes
- 15% business expenses

Confirm your desired annual lifestyle cost (from Step 1) and proceed.$$,
      'prompt', $$Compute: desired * 1.20 / 0.65 / 0.85. Present baseline requirement as the floor. Keep it simple and decisive.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 1
    ),
    jsonb_build_object(
      'step', 3,
      'title', 'Ambition Calibration',
      'subtitle', 'Baseline vs Freedom vs Moonshot',
      'question', $$Declare your moonshot revenue target and timeline.

Answer:
- Why this number?
- What becomes possible at this level (personal, family, impact, legacy)?
- What are you willing to trade to get there?
- Timeline to moonshot (12/24/36/60+ months) and why.$$,
      'prompt', $$Clarify baseline vs freedom vs moonshot. If moonshot < 2x baseline, challenge it. If timeline is aggressive vs target, flag it. Keep tone direct and non-judgmental.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 4,
      'title', 'Values Alignment',
      'subtitle', 'Stress-test the moonshot against core values',
      'question', $$Compare your moonshot to your top 3 values.

For each value, answer:
- Does this moonshot honor or violate it?
- If tension exists, what must change (model or timeline)?$$,
      'prompt', $$Cross-check values. Flag misalignment clearly. Suggest adjusting model or timeline if needed.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 5,
      'title', 'Capacity Reality Check',
      'subtitle', 'Can this be achieved linearly?',
      'question', $$Based on your sustainable weekly capacity, can you reach your target by trading time? If not, what leverage is required (systems, team, products, partners)?$$,
      'prompt', $$Calculate required hourly rate if linear. If unrealistic, name leverage needs. Keep it factual.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 6,
      'title', 'Personal Manifesto',
      'subtitle', 'Sign the declaration',
      'question', $$Complete:
- Who I am becoming
- What I value above all (3 non-negotiables)
- The life I'm creating (revenue, hours, location, impact)
- Why this matters
- What I'm committed to this week
- What I'm releasing

Then confirm: I sign this declaration.$$,
      'prompt', $$Synthesize into a manifesto. If they hesitate to sign, name what needs adjustment. End with a clear commitment line.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    )
  ),
  jsonb_build_object(
    'welcome', jsonb_build_object(
      'title', 'Life Vision Declaration',
      'description', E'In the next 25-30 minutes, you will:\n\n• Quantify your desired lifestyle\n• Calculate your real revenue requirement\n• Declare a moonshot target and timeline\n• Sign your personal manifesto',
      'estimatedTime', '25-30 minutes',
      'ctaText', 'Begin Declaration'
    ),
    'processing', jsonb_build_array(
      'Calculating your baseline requirements...',
      'Stress-testing ambition against values...',
      'Mapping capacity constraints...',
      'Generating your Life Vision Declaration...'
    )
  )
)
ON CONFLICT (product_slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_steps = EXCLUDED.total_steps,
  estimated_duration = EXCLUDED.estimated_duration,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  final_deliverable_prompt = EXCLUDED.final_deliverable_prompt,
  steps = EXCLUDED.steps,
  instructions = EXCLUDED.instructions,
  updated_at = NOW();

-- Business Model Declaration
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
  'declaration-rite-business-model',
  'Business Model Declaration',
  'Map your business as a system and design the ecosystem required to scale.',
  9.00,
  8,
  '30-35 minutes',
  'gpt-4o',
  $$You are the Declaration Wizard for the Business Model Declaration.

Your job: map the business as a system, identify the constraint, and design the ecosystem required to reach the moonshot.

Rules:
- Use clear system language (inputs, throughput, outputs)
- Identify the primary constraint and feedback loops
- Build a 4-pillar ecosystem (creation, delivery, capture, governance)
- Quantify build requirements and compare solo vs partnership economics
- Be neutral about partnership, data-driven in recommendations$$,
  $$You are generating a Business Model Declaration (8-page PDF).

Required structure:
- Current system + unit economics
- Moonshot target and gap
- Target ecosystem (4 pillars)
- System architecture map
- Build requirements + timelines
- Resilience analysis
- Partnership model comparison
- Final declaration + next step

Writing rules:
- Use their numbers and language
- Keep it concise and strategic
- Make it feel execution-ready$$,
  jsonb_build_array(
    jsonb_build_object(
      'step', 1,
      'title', 'Current Business Model',
      'subtitle', 'Unit economics and offers',
      'question', $$List your current offers with price, delivery hours, cost to deliver, sales per month, and total revenue. Include total monthly hours worked and CAC/LTV if known.$$,
      'prompt', $$Compute unit economics (revenue, margins, LTV:CAC). Identify the revenue gap to the moonshot. Flag unrealistic linear scaling.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 2,
      'title', 'System Architecture',
      'subtitle', 'Inputs, throughput, outputs',
      'question', $$Map your system: inputs (time, team, capital, leads), throughput (marketing, sales, delivery, support), outputs (customers, revenue, profit, outcomes).$$,
      'prompt', $$Summarize the system map. Identify weak links in throughput.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 3,
      'title', 'Constraint Identification',
      'subtitle', 'Primary bottleneck',
      'question', $$Identify the #1 constraint (lead gen, conversion, delivery capacity, time, team, capital, know-how). Build a constraint chain (what becomes next if removed).$$,
      'prompt', $$Name the primary constraint and the likely next constraints. Ask whether they can solve alone or need help.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 4,
      'title', 'Feedback Loops + Leverage',
      'subtitle', 'Virtuous/vicious cycles',
      'question', $$Describe your strongest positive loop and negative loop. Where are you intervening today (low/medium/high leverage)?$$,
      'prompt', $$Map loops clearly. Identify leverage points and what must shift at the system level.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 5,
      'title', 'Ecosystem Design',
      'subtitle', '4-pillar model',
      'question', $$Design your target ecosystem:
- Value Creation
- Value Delivery
- Value Capture (4 streams)
- Governance

Ensure the revenue architecture adds to your moonshot.$$,
      'prompt', $$Translate their design into a cohesive ecosystem. Check revenue totals and diversification risk.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 6,
      'title', 'Resilience + Risk',
      'subtitle', 'Single points of failure',
      'question', $$Identify single points of failure and redundancy gaps (channels, revenue streams, delivery, team). Rate resilience 1-10.$$,
      'prompt', $$Name resilience gaps and how to close them. Require at least 3 channels and 3-4 streams for resilience.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 7,
      'title', 'Build Requirements',
      'subtitle', 'What must be built',
      'question', $$List required infrastructure for marketing, sales, delivery, operations, governance, and offers. Estimate time and cost if possible.$$,
      'prompt', $$Quantify build components, solo timeline, and opportunity cost. Keep it realistic.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 8,
      'title', 'Partnership Models',
      'subtitle', 'Compare paths',
      'question', $$Compare solo vs partnership. Select preferred model: revenue share, fixed fee, or hybrid alliance. Explain why.$$,
      'prompt', $$Present model comparison neutrally. Recommend based on revenue and constraints, but respect their choice.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    )
  ),
  jsonb_build_object(
    'welcome', jsonb_build_object(
      'title', 'Business Model Declaration',
      'description', E'In the next 30-35 minutes, you will:\n\n• Map your business as a system\n• Identify the primary constraint\n• Design a 4-pillar ecosystem\n• Quantify build requirements',
      'estimatedTime', '30-35 minutes',
      'ctaText', 'Begin Declaration'
    ),
    'processing', jsonb_build_array(
      'Mapping your current system...',
      'Identifying constraints and loops...',
      'Designing the target ecosystem...',
      'Generating your Business Model Declaration...'
    )
  )
)
ON CONFLICT (product_slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_steps = EXCLUDED.total_steps,
  estimated_duration = EXCLUDED.estimated_duration,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  final_deliverable_prompt = EXCLUDED.final_deliverable_prompt,
  steps = EXCLUDED.steps,
  instructions = EXCLUDED.instructions,
  updated_at = NOW();

-- Strategic Path Declaration
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
  'declaration-rite-strategic-path',
  'Strategic Path Declaration',
  'Integrate the plan and choose the execution path.',
  9.00,
  6,
  '30-35 minutes',
  'gpt-4o',
  $$You are the Declaration Wizard for the Strategic Path Declaration.

Your job: integrate all prior work into a unified plan, compare solo vs partnership paths, and force a clear decision.

Rules:
- Synthesize across Perception, Orientation, and previous Declarations
- Build a 12-month roadmap with phases
- Compare economics, feasibility, and values alignment
- Force a final decision with commitment and next step$$,
  $$You are generating a Strategic Path Declaration (12-15 page PDF).

Required structure:
- Executive summary
- Personal foundation
- Business foundation
- Execution roadmap
- Financial projections
- Decision + commitment
- Next actions
- Signature page

Writing rules:
- Use exact numbers and language
- Keep it decisive and execution-ready
- Celebrate the chosen path$$,
  jsonb_build_array(
    jsonb_build_object(
      'step', 1,
      'title', 'Unified Vision Check',
      'subtitle', 'Life + business alignment',
      'question', $$Compare life vision targets to business model outputs. Identify alignment gaps in revenue, time, values, energy, and competence.$$,
      'prompt', $$Calculate alignment score and name the gap. Ask for adjustments if needed.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 2,
      'title', '12-Month Roadmap',
      'subtitle', 'Foundation, Scale, Optimize',
      'question', $$Define Phase 1 (months 1-3), Phase 2 (months 4-9), Phase 3 (months 10-12). Include milestones and who builds what.$$,
      'prompt', $$Translate into a phased roadmap. Flag if solo execution is unrealistic in 12 months.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 3,
      'title', 'Solo vs Partnership Economics',
      'subtitle', 'ROI and timeline comparison',
      'question', $$Compare solo vs partnership economics (costs, opportunity cost, timeline, success rate). Which path makes more sense economically?$$,
      'prompt', $$Calculate ROI and summarize the comparison neutrally.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 4,
      'title', 'Values-Based Decision',
      'subtitle', 'Which path honors your values?',
      'question', $$Compare solo vs partnership against your core values, control preference, learning preference, and risk tolerance.$$,
      'prompt', $$Summarize values alignment for each path. Identify the better fit.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 5,
      'title', 'Decision Framework',
      'subtitle', 'Weighted criteria + gut check',
      'question', $$Score solo vs partnership by feasibility, desirability, economics, values, life impact. Then declare your decision and why.$$,
      'prompt', $$Compute weighted scores and ask for the final decision. Capture commitment language.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    ),
    jsonb_build_object(
      'step', 6,
      'title', 'Commitment + Next Steps',
      'subtitle', 'Lock the path',
      'question', $$State your first action, accountability, and 30-day milestone. If partnership, note readiness for an Alliance Design Call.$$,
      'prompt', $$Summarize the commitment and set the next step clearly.$$,
      'allow_file_upload', false,
      'required', true,
      'max_follow_ups', 2
    )
  ),
  jsonb_build_object(
    'welcome', jsonb_build_object(
      'title', 'Strategic Path Declaration',
      'description', E'In the next 30-35 minutes, you will:\n\n• Integrate your life and business plan\n• Build a 12-month roadmap\n• Compare solo vs partnership\n• Declare your final path',
      'estimatedTime', '30-35 minutes',
      'ctaText', 'Begin Declaration'
    ),
    'processing', jsonb_build_array(
      'Integrating your prior work...',
      'Building your 12-month roadmap...',
      'Comparing solo vs partnership paths...',
      'Generating your Strategic Path Declaration...'
    )
  )
)
ON CONFLICT (product_slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_steps = EXCLUDED.total_steps,
  estimated_duration = EXCLUDED.estimated_duration,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  final_deliverable_prompt = EXCLUDED.final_deliverable_prompt,
  steps = EXCLUDED.steps,
  instructions = EXCLUDED.instructions,
  updated_at = NOW();

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '✅ Rite III Declaration products added/updated';
END $$;
