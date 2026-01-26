-- Improve Core Transformation section in perception-rite-scan-3 deliverable
-- Issue: Section felt abstract, didn't explain what it is or why it matters
-- Fix: Rewrite to make it more accessible and valuable

UPDATE product_definitions
SET final_deliverable_prompt = $$Generate a Boundary & Burnout Scan Report.

# OUTPUT STRUCTURE (5 pages)

PAGE 1: DUTY CYCLE ANALYSIS
- 24-hour map summary
- Green/yellow/red/black ratios
- Pattern type and burnout risk

PAGE 2: BOUNDARY STRENGTH
- Time, energy, identity, permission ratings
- Violation signs
- Weakest boundary

PAGE 3: THE REAL PROBLEM (Core Transformation)
Start with: "Most people think the issue is [their surface complaint about being always-on]. But that's not the real problem."

Then explain:
- What the always-on pattern is actually protecting them from (the fear)
- What deeper state they're trying to create by staying vigilant (security, peace, worthiness, etc.)
- The paradox: "You think staying on creates [desired state], but it's actually preventing it"
- The reversal: "The path to [desired state] requires turning OFF, not staying on"

Use their specific language from their responses. Make this concrete, not abstract.

PAGE 4: RESTORATION PROTOCOL
- One hard boundary (from their step 9 response)
- One recovery activity (from their step 9 response)
- One drain removed (from their step 9 response)
- 30-day implementation plan with specific weekly milestones

PAGE 5: 90-DAY ENERGY REDESIGN
- Time boundary redesign: Specific actions to protect time
- Energy boundary redesign: Specific actions to conserve energy
- Identity boundary redesign: Who you stop being
- Permission boundary redesign: What you allow yourself
- Daily reflection prompts
- Next scan recommendation: Value Pattern Decoder (if not done) or Money Signal

Use the user's language. Be specific and actionable. Keep the Core Transformation section grounded in their actual responses.$$
WHERE product_slug = 'perception-rite-scan-3';
