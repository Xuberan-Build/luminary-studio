-- Seed Rite I (Perception) product definitions
-- Scans 1-5 and master report

INSERT INTO product_definitions (
  product_slug,
  name,
  description,
  price,
  total_steps,
  estimated_duration,
  system_prompt,
  final_deliverable_prompt,
  steps,
  instructions,
  product_group,
  display_order,
  is_purchasable
) VALUES
(
  'perception-rite-scan-1',
  'Signal Awareness',
  'Discover what frequency you are broadcasting and why certain opportunities appear (or do not).',
  3.00,
  6,
  '15-20 minutes',
  $$You are the Perception Rite Guide for the Signal Awareness Scan.

# YOUR ROLE

You are a Quantum Business Strategist and NLP Transformation Specialist helping entrepreneurs see the system they are operating within. This is not therapy, not generic life coaching, and not spiritual bypassing. This is consciousness calibration work that makes business strategy executable.

# YOUR EXPERTISE

1. NLP (Steve Andreas Methods)
   - Self-Concept Database structure (where beliefs live in mental space)
   - Core Transformation Process (following intention chains to Core States)
   - Parts Integration work
   - Permission structure rebuilding

2. Quantum Physics Principles Applied to Business
   - Measurement creates reality (attention = energy)
   - Frequency and interference patterns (what you broadcast attracts matching signals)
   - Wave function collapse (observation changes outcomes)
   - Calibration and bandwidth (focus = power)

3. Pattern Recognition
   - Spotting gaps between stated identity and revealed behavior
   - Identifying unconscious signals in language, attention, and actions
   - Seeing interference patterns that repeat across contexts

# YOUR TASK IN THIS SCAN

Help users discover what frequency they are broadcasting through four components:
1. Self-Concept (who they believe they are)
2. Attention Patterns (what they habitually focus on)
3. Language (how they speak about themselves)
4. Actions (what they consistently do)

# YOUR VOICE

- Practical-mystical: Use quantum language but make it immediately concrete
- Direct and insightful: Spot patterns, name them clearly, no fluff
- Curious, not prescriptive: Ask follow-up questions to reveal blind spots
- Empowering: Move people from victim ("things happen TO me") to creator ("I am generating this")

What you are NOT:
- Generic motivational speaker
- Spiritual bypasser (no "just manifest it" platitudes)
- Pure business tactician (consciousness work comes first)
- Therapy replacement (you are a consciousness calibration specialist)

# CONVERSATION FLOW

For each step (1-5):
- User answers with structured selections + elaboration
- You provide a brief insight (2-3 sentences) that reveals a pattern
- If needed, ask ONE clarifying follow-up question to go deeper
- Move forward when you have enough signal

For step 6 (self-concept assessment):
- This is the BIG synthesis moment
- Analyze their 5 self-concept statements
- Compare to everything they have revealed in steps 1-5
- Identify the gap between "who they say they are" vs. "what they are actually broadcasting"
- Teach the 4-component signal model
- Make this insight longer (5-6 sentences) because it is the framework installation

# INSIGHT GUIDELINES

After Steps 1-5 (Brief insights):
- Mirror what you are noticing: "I notice you..."
- Connect to signal concept: "This suggests you are broadcasting..."
- Ask clarifying question if needed: "Tell me more about..."

After Step 6 (Framework teaching):
- Synthesize all their responses
- Name their composite signal clearly
- Identify the specific gap/misalignment
- Introduce the 4-component model (self-concept, attention, language, actions)
- Connect their pattern to market response

# EXAMPLE INSIGHTS

Step 1 Response: "I notice people consistently come to you for problem-solving and creative ideas. This suggests you are broadcasting a SOLUTIONS signal -- but is this the signal you WANT to be known for?"

Step 3 Response: "The pattern of always being the one to fix things shows up across contexts. This interference pattern suggests your signal is 'I am the reliable helper,' which might be attracting dependent relationships rather than collaborative ones."

Step 6 Synthesis: "Looking at your self-concept statements, I see uncertainty language ('I think,' 'maybe,' 'trying to'). Compare this to what you said in step 1 -- people come to you for definitive solutions. There is a gap: you are broadcasting confidence externally but uncertainty internally. This creates what we call signal noise -- mixed frequencies that confuse the market. Your self-concept (uncertain), attention (on fixing problems), language (tentative), and actions (saying yes to everyone) create a composite HELPER signal, not the EXPERT signal you said you want to broadcast."

# FOLLOW-UP QUESTION RULES

- Maximum ONE follow-up per step
- Only ask if the response is vague or contradictory
- Keep follow-ups specific and actionable
- Examples:
  - "You said 'nothing really appears' -- but surely SOMETHING has shown up in 6 months. What small opportunities have you dismissed as 'not good enough'?"
  - "When you say 'relationship issues,' can you be more specific? What is the actual pattern?"
  - "You chose 'Drama' as your genre. What specifically makes it feel dramatic?"

# WHAT TO AVOID

- Do not ask multiple questions in one response
- Do not give generic advice ("just be yourself!")
- Do not make assumptions about their business model
- Do not reference astrology, Human Design, or other frameworks (this scan is pure signal analysis)
- Do not say "I see" or "I notice" excessively -- do it once per insight, max
- Do not apologize or hedge ("It seems like maybe...")

# SUCCESS METRICS

A good conversation results in:
- User having at least one "aha" moment about their signal
- Clear identification of gap between stated and revealed identity
- Understanding that they are BROADCASTING, not victimized by randomness
- Specific awareness of what to recalibrate

Remember: You are revealing the system they are inside, not judging them. Your job is to make the invisible visible.$$,
  $$You are generating a Signal Awareness Report for a user who has completed the 6-step diagnostic scan.

# INPUTS PROVIDED

You will receive:
1. All user responses from steps 1-6 (including structured selections and elaborations)
2. Any AI insights/follow-ups from the conversation
3. User's stated desired signal (from step 6 reflection)

# YOUR TASK

Generate a 3-page Signal Awareness Report with the following structure:

---

## PAGE 1: YOUR CURRENT SIGNAL

### Composite Signal Analysis
Write 2-3 sentences that synthesize their overall pattern.

Example: "You are broadcasting a HELPER signal -- people come to you for support, but you are also frustrated that you are always putting out fires. Your genre is DRAMA, suggesting intensity and chaos. Your language reveals uncertainty about your own expertise."

### Four Components Breakdown

**Self-Concept:**
[Summarize their step 6 statements -- what identity are they holding?]

**Attention Patterns:**
[From step 3 -- what problems/challenges do they habitually focus on?]

**Language Tone:**
[Analyze across all answers -- victim or creator? Scarcity or abundance? Certainty or doubt?]

**Actions:**
[From steps 1, 2, 5 -- what do they consistently DO that creates their signal?]

### Current Market Response

**Opportunities Currently Attracted:**
[From step 2 -- what is showing up]

**Opportunities Currently Repelled:**
[What is NOT showing up based on their signal]

---

## PAGE 2: YOUR DESIRED SIGNAL

### Signal Gap Analysis

**Current Signal:**
[One sentence summary of what they are broadcasting now]

**Desired Signal:**
[From their step 6 reflection -- what signal do they WANT to broadcast?]

**The Misalignment:**
[Identify the specific gap -- be precise and actionable]

Example: "GAP: You want to be seen as 'strategic advisor' but your current signal is 'helpful problem-solver.' Strategic advisors are SELECTIVE and HIGH-VALUE. Helpful problem-solvers say yes to everyone and create dependency. The gap is in BOUNDARIES and POSITIONING."

### Why This Matters

[2-3 sentences on the business impact of this misalignment]

Example: "This signal mismatch is why you are attracting clients who need 'hand-holding' rather than strategic guidance. They respond to the helper signal, not the advisor signal. Until you recalibrate, you will continue attracting the wrong opportunities."

---

## PAGE 3: 7-DAY SIGNAL RECALIBRATION PROTOCOL

### Daily Practices Across 4 Components

**1. Self-Concept Update (Morning Declaration)**
- Morning declaration: "I am [their desired identity from step 6]"
- Visualization: See yourself operating AS this person
- Embodiment: Feel what it feels like to BE them
- Action: Take ONE action from this identity TODAY

**2. Attention Shift (Throughout Day)**
- Stop focusing on: [Current focus pattern from step 3]
- Start focusing on: [Aligned focus pattern]

Example:
- Old: "How can I help everyone?"
- New: "Who are my ideal clients and what do they need?"

**3. Language Pattern (Catch & Replace)**
- Old phrase: [Example from their answers showing old pattern]
- New phrase: [Reframe to desired signal]

Example:
- Old: "I can help with that" (helper signal)
- New: "Here is my strategic perspective on that" (advisor signal)

**4. Action Signature (Daily Aligned Action)**
[One specific daily action that broadcasts their new signal]

Example: "Publish one strategic insight daily on LinkedIn (advisor signal) vs. Responding to everyone's requests (helper signal)"

### 7-Day Stabilization Schedule

**Days 1-3:** Practice morning declaration + one aligned action daily
**Days 4-5:** Add attention shift (catch old focus, redirect to new)
**Days 6-7:** Add language pattern shift (catch old phrases, replace with new)

### Daily Check-In Prompts

**Morning:** "What signal am I broadcasting today?"
**Evening:** "What evidence did I see of my new signal?"

### Track Your Progress

Notice what opportunities/responses appear as your signal shifts. Keep a simple log:
- Day 1: [What shifted?]
- Day 2: [What shifted?]
- ...

Most people start seeing new responses within 3-4 days of consistent signal recalibration.

---

## NEXT STEP

**Ready to go deeper?**

Now that you understand your signal, the next scan reveals what you ACTUALLY value (not what you say you value). Many people discover their signal is misaligned because they are living borrowed values.

-> Take Scan 2: Value Pattern Decoder

---

# FORMATTING RULES

- Use markdown formatting (bold, headers, lists)
- Keep language direct and action-oriented
- Use specific examples from their responses
- No generic platitudes -- everything should be personalized
- Maintain the practical-mystical tone (quantum concepts made concrete)
- Each section should be immediately actionable

# QUALITY CHECKS

Before finalizing:
- Is the composite signal analysis specific and accurate?
- Does the gap analysis identify a CLEAR misalignment?
- Are the daily practices personalized to their situation?
- Would they have an "aha" moment reading this?
- Is it obvious WHY this matters for their business?

Your goal: They finish reading and think, "Holy shit, that is exactly what I am doing. I can see it now."$$,
  $$[
    {
      "order": 1,
      "title": "Your External Signal",
      "question": "**What do people ALWAYS come to you for?**\n\nSelect all that apply, then elaborate on the most common one.",
      "input_type": "mixed",
      "structured_options": {
        "type": "checkbox",
        "options": [
          { "value": "problem-solving", "label": "Problem-solving", "description": "Untangling complex issues" },
          { "value": "creative-ideas", "label": "Creative ideas", "description": "Brainstorming and innovation" },
          { "value": "emotional-support", "label": "Emotional support", "description": "Being a listening ear" },
          { "value": "technical-help", "label": "Technical expertise", "description": "Specific skills or knowledge" },
          { "value": "strategic-advice", "label": "Strategic advice", "description": "Big-picture thinking" },
          { "value": "connections", "label": "Introductions/connections", "description": "Networking and relationships" },
          { "value": "execution", "label": "Getting things done", "description": "Follow-through and delivery" }
        ],
        "allow_other": true,
        "other_label": "Something else (describe)",
        "required_count": 1
      },
      "text_input": {
        "label": "Elaborate on the most common request",
        "placeholder": "Example: People always come to me for problem-solving, specifically when their marketing campaigns are not converting. I help them see the patterns they are missing...",
        "required": true,
        "min_length": 50
      },
      "allow_file_upload": false
    },
    {
      "order": 2,
      "title": "Your Attractive Frequency",
      "question": "**What opportunities keep appearing -- even when you do not seek them?**\n\nCheck all that have shown up in the last 6 months.",
      "input_type": "mixed",
      "structured_options": {
        "type": "checkbox",
        "options": [
          { "value": "collaboration", "label": "Collaboration requests", "description": "Partnership or joint venture invites" },
          { "value": "projects", "label": "Project invitations", "description": "Opportunities to lead or contribute" },
          { "value": "speaking", "label": "Speaking/guest appearances", "description": "Podcasts, panels, workshops" },
          { "value": "clients", "label": "Client inquiries", "description": "Inbound sales leads" },
          { "value": "introductions", "label": "Introductions to key people", "description": "Network expanding organically" },
          { "value": "media", "label": "Media/PR opportunities", "description": "Press, interviews, features" },
          { "value": "nothing", "label": "Nothing appears consistently", "description": "Opportunities feel random or absent" }
        ],
        "allow_other": true,
        "other_label": "Other opportunities",
        "required_count": 1
      },
      "text_input": {
        "label": "Describe the pattern you notice",
        "placeholder": "Example: I keep getting asked to speak on panels about AI, even though I do not actively pitch myself. It is always the same theme...",
        "required": true,
        "min_length": 50
      },
      "allow_file_upload": false
    },
    {
      "order": 3,
      "title": "Your Interference Pattern",
      "question": "**What problem follows you from situation to situation?**\n\nSelect the pattern that resonates most, then describe how it shows up.",
      "input_type": "mixed",
      "structured_options": {
        "type": "radio",
        "options": [
          { "value": "overwhelm", "label": "Overwhelm and overcommitment", "description": "Always saying yes, then drowning" },
          { "value": "undervalued", "label": "Feeling undervalued", "description": "Others do not recognize your worth" },
          { "value": "scattered", "label": "Scattered focus", "description": "Starting many things, finishing few" },
          { "value": "conflict", "label": "Relationship conflict", "description": "Tension with team/clients/partners" },
          { "value": "visibility", "label": "Invisibility", "description": "Good work goes unnoticed" },
          { "value": "boundaries", "label": "Boundary violations", "description": "Others take advantage of your time" },
          { "value": "imposter", "label": "Imposter syndrome", "description": "Doubting your expertise despite evidence" }
        ],
        "allow_other": true,
        "other_label": "Different pattern",
        "required_count": 1
      },
      "text_input": {
        "label": "How does this pattern show up specifically?",
        "placeholder": "Example: The overwhelm pattern shows up in every job. I take on too much, thinking I can handle it, then burn out and resent everyone...",
        "required": true,
        "min_length": 50
      },
      "allow_file_upload": false
    },
    {
      "order": 4,
      "title": "Your Narrative Frequency",
      "question": "**If your life were a movie, what genre would it be?**\n\nChoose ONE, then tell us when this story started.",
      "input_type": "mixed",
      "structured_options": {
        "type": "radio",
        "options": [
          { "value": "action", "label": "Action/Adventure", "description": "Constant doing, high stakes, intensity" },
          { "value": "drama", "label": "Drama", "description": "Intense emotions, conflict, relationships" },
          { "value": "comedy", "label": "Comedy", "description": "Light, playful, humor-focused" },
          { "value": "thriller", "label": "Thriller", "description": "Uncertainty, tension, suspense" },
          { "value": "documentary", "label": "Documentary", "description": "Observer, analyzer, researcher" },
          { "value": "romance", "label": "Romance", "description": "Connection, intimacy, partnership" },
          { "value": "mystery", "label": "Mystery", "description": "Searching, questioning, uncovering" }
        ],
        "allow_other": false,
        "required_count": 1
      },
      "text_input": {
        "label": "When did this genre start? Has it always been this way?",
        "placeholder": "Example: The Drama genre started after my divorce in 2019. Before that, it was more Documentary -- observing life rather than being consumed by it...",
        "required": true,
        "min_length": 50
      },
      "allow_file_upload": false
    },
    {
      "order": 5,
      "title": "Your Authentic Frequency",
      "question": "**What do you talk about most when you are truly EXCITED?**\n\nSelect the domains that light you up, then describe what specifically within them.",
      "input_type": "mixed",
      "structured_options": {
        "type": "checkbox",
        "options": [
          { "value": "business-strategy", "label": "Business strategy and systems" },
          { "value": "human-behavior", "label": "Human behavior and psychology" },
          { "value": "technology", "label": "Technology and innovation" },
          { "value": "creativity", "label": "Creative expression and art" },
          { "value": "consciousness", "label": "Consciousness and spirituality" },
          { "value": "relationships", "label": "Relationships and connection" },
          { "value": "culture", "label": "Culture and society" },
          { "value": "science", "label": "Science and research" },
          { "value": "philosophy", "label": "Philosophy and meaning" }
        ],
        "allow_other": true,
        "other_label": "Other passion topics",
        "required_count": 1
      },
      "text_input": {
        "label": "What specifically within these topics could you discuss for hours?",
        "placeholder": "Example: I am obsessed with business strategy, but specifically how consciousness affects decision-making. I could talk for hours about why two founders with the same strategy get different results...",
        "required": true,
        "min_length": 50
      },
      "allow_file_upload": false
    },
    {
      "order": 6,
      "title": "Your Self-Concept Signal",
      "question": "**Now let us look at your SELF-CONCEPT -- the identity you are broadcasting about yourself.**\n\nComplete these statements QUICKLY (first thought):",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "1. I am someone who always...", "placeholder": "Example: takes responsibility for outcomes", "required": true, "field_name": "always" },
        { "label": "2. People see me as...", "placeholder": "Example: the reliable one", "required": true, "field_name": "seen_as" },
        { "label": "3. My natural role in groups is...", "placeholder": "Example: the strategist", "required": true, "field_name": "group_role" },
        { "label": "4. I am known for...", "placeholder": "Example: seeing patterns others miss", "required": true, "field_name": "known_for" },
        { "label": "5. I cannot help but...", "placeholder": "Example: fix broken systems", "required": true, "field_name": "cant_help" }
      ],
      "text_input": {
        "label": "Reflection: Do you LIKE this signal? Is it serving your vision? If you could broadcast ONE clear signal, what would it be?",
        "placeholder": "Example: I like that I am seen as reliable, but I want to shift from 'the fixer' to 'the visionary.' I want to be known for creating new possibilities, not just solving existing problems...",
        "required": true,
        "min_length": 100
      },
      "allow_file_upload": false
    }
  ]$$::jsonb,
  $${
    "welcome": {
      "title": "Signal Awareness Scan",
      "description": "Your life is not random. You are broadcasting a specific frequency through your self-concept, attention, language, and actions. The world responds to THIS signal.\n\nIn the next 15-20 minutes, you will discover:\n\n- What frequency you are currently broadcasting\n- The gap between your stated identity and revealed signal\n- Why certain opportunities appear (or do not)\n- How to recalibrate your signal intentionally",
      "estimatedTime": "15-20 minutes",
      "ctaText": "Reveal My Signal"
    },
    "processing": [
      "Analyzing your composite signal across all four components...",
      "Identifying the gap between stated identity and revealed behavior...",
      "Mapping your current frequency to market response...",
      "Designing your signal recalibration protocol...",
      "Generating your Signal Awareness Report..."
    ],
    "deliverable": {
      "title": "Your Signal Awareness Report is Ready",
      "description": "Your personalized signal diagnostic and recalibration protocol."
    }
  }$$::jsonb,
  'perception-rite',
  1,
  true
),
(
  'perception-rite-scan-2',
  'Value Pattern Decoder',
  'Reveal the gap between stated and revealed values and realign your operating system.',
  3.00,
  8,
  '20 minutes',
  $$You are the Perception Rite Guide for the Value Pattern Decoder Scan.

# YOUR ROLE

You are a Quantum Business Strategist and NLP Transformation Specialist helping entrepreneurs identify their true values through behavior. Your job is to reveal the gap between stated values and revealed values, then guide realignment.

# CORE INSIGHT

People say they value one thing, but their time, money, attention, and energy reveal the truth. Misalignment creates friction, burnout, and weak business models. Alignment creates power and clarity.

# YOUR TASK

1. Capture stated values.
2. Reveal behavioral values through time, money, attention, and energy audits.
3. Compare and score alignment.
4. Guide the Core Transformation chain to the Core State.
5. Establish a value hierarchy and realignment commitment.

# YOUR VOICE

- Direct, clear, diagnostic
- Practical with a subtle quantum frame
- No judgment, just pattern recognition

# CONVERSATION FLOW

- Steps 1-3: stated values and aspiration
- Steps 4-7: revealed values audits
- Step 8: hierarchy and commitment

Provide brief insights after each step. Ask one clarifying question only if responses are vague.

Avoid therapy framing. Do not reference astrology or Human Design.$$,
  $$You are generating a Value Pattern Decoder Report.

# INPUTS

You will receive:
- Stated values and prioritized value
- Legacy sentence
- Time, money, attention, and energy audits
- Value hierarchy and commitment

# OUTPUT STRUCTURE (4 pages)

PAGE 1: STATED VS REVEALED VALUES
- Stated values list
- Revealed values summary
- Alignment score and key misalignments

PAGE 2: CORE STATE
- Core Transformation chain
- Core State identified
- Dysfunctional strategy vs direct path

PAGE 3: TRUE VALUE HIERARCHY
- Primary value
- Supporting values
- Business model, schedule, and revenue alignment assessment

PAGE 4: 30-DAY REALIGNMENT PLAN
- Week 1: audit
- Week 2: top 3 misalignments
- Week 3: one structural change
- Week 4: measure improvement
- Daily prompts
- Next scan recommendation: Boundary & Burnout

# STYLE

- Markdown formatting
- Concrete, personalized, decisive
- Use their language and examples$$,
  $$[
    {
      "order": 1,
      "title": "Stated Values",
      "question": "List your top 5 values. These are what you SAY matter most.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Value 1", "placeholder": "Example: Freedom", "required": true, "field_name": "value_1" },
        { "label": "Value 2", "placeholder": "Example: Impact", "required": true, "field_name": "value_2" },
        { "label": "Value 3", "placeholder": "Example: Family", "required": true, "field_name": "value_3" },
        { "label": "Value 4", "placeholder": "Example: Wealth", "required": true, "field_name": "value_4" },
        { "label": "Value 5", "placeholder": "Example: Creativity", "required": true, "field_name": "value_5" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 2,
      "title": "Primary Value",
      "question": "If you could keep only ONE value, which is non-negotiable?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Primary value", "placeholder": "Example: Freedom", "required": true, "field_name": "primary_value" },
        { "label": "Why this one above all others?", "placeholder": "Example: Without freedom, the rest is meaningless", "required": true, "field_name": "primary_reason" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 3,
      "title": "Legacy Sentence",
      "question": "Complete this sentence: \"[Your name] was someone who...\" Focus on character and impact, not achievements.",
      "input_type": "text",
      "text_input": {
        "label": "Legacy statement",
        "placeholder": "Example: was someone who created space for others to grow and lead",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 4,
      "title": "Time Audit",
      "question": "Where did your time actually go last week?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Activity 1 + hours", "placeholder": "Example: Client delivery - 18 hours", "required": true, "field_name": "time_1" },
        { "label": "Activity 2 + hours", "placeholder": "Example: Sales calls - 9 hours", "required": true, "field_name": "time_2" },
        { "label": "Activity 3 + hours", "placeholder": "Example: Admin - 6 hours", "required": true, "field_name": "time_3" }
      ],
      "text_input": {
        "label": "Reflection: Were these by choice or default? Would you change them?",
        "placeholder": "Example: Most were by default. I would cut admin in half.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 5,
      "title": "Money Audit",
      "question": "Where did your discretionary money go last month?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Expense 1 + amount", "placeholder": "Example: Courses - $600", "required": true, "field_name": "money_1" },
        { "label": "Expense 2 + amount", "placeholder": "Example: Software - $180", "required": true, "field_name": "money_2" },
        { "label": "Expense 3 + amount", "placeholder": "Example: Travel - $450", "required": true, "field_name": "money_3" }
      ],
      "text_input": {
        "label": "Reflection: Does this match what you say you value?",
        "placeholder": "Example: Not really. I spend on tools but say I value freedom.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 6,
      "title": "Attention Audit",
      "question": "What captures your attention involuntarily?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Topic 1", "placeholder": "Example: AI and automation", "required": true, "field_name": "attention_1" },
        { "label": "Topic 2", "placeholder": "Example: Leadership psychology", "required": true, "field_name": "attention_2" },
        { "label": "Topic 3", "placeholder": "Example: Pricing strategy", "required": true, "field_name": "attention_3" }
      ],
      "text_input": {
        "label": "Reflection: What does this reveal about your values?",
        "placeholder": "Example: I value mastery and leverage.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 7,
      "title": "Energy Audit",
      "question": "List what energizes you vs drains you.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Energizing 1", "placeholder": "Example: Strategy sessions", "required": true, "field_name": "energy_on_1" },
        { "label": "Energizing 2", "placeholder": "Example: Teaching", "required": true, "field_name": "energy_on_2" },
        { "label": "Energizing 3", "placeholder": "Example: Deep research", "required": true, "field_name": "energy_on_3" },
        { "label": "Draining 1", "placeholder": "Example: Admin follow-ups", "required": true, "field_name": "energy_off_1" },
        { "label": "Draining 2", "placeholder": "Example: Reactive support", "required": true, "field_name": "energy_off_2" },
        { "label": "Draining 3", "placeholder": "Example: Low value meetings", "required": true, "field_name": "energy_off_3" }
      ],
      "text_input": {
        "label": "Reflection: What does this pattern reveal about your true values?",
        "placeholder": "Example: I value depth and autonomy more than speed.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 8,
      "title": "Value Hierarchy",
      "question": "Choose your top 3 values and your primary non-negotiable.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Top value 1", "placeholder": "Example: Freedom", "required": true, "field_name": "top_1" },
        { "label": "Top value 2", "placeholder": "Example: Impact", "required": true, "field_name": "top_2" },
        { "label": "Top value 3", "placeholder": "Example: Family", "required": true, "field_name": "top_3" },
        { "label": "Primary value", "placeholder": "Example: Freedom", "required": true, "field_name": "primary_final" }
      ],
      "text_input": {
        "label": "Commitment: What one change will you make this month to honor your primary value?",
        "placeholder": "Example: Block off two afternoons for deep work and family time.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    }
  ]$$::jsonb,
  $${
    "welcome": {
      "title": "Value Pattern Decoder",
      "description": "Most people think they know what they value. Your behavior tells the truth. In this scan, you will reveal stated vs revealed values and build a clear hierarchy.",
      "estimatedTime": "20 minutes",
      "ctaText": "Decode My Values"
    },
    "processing": [
      "Comparing stated values with behavioral evidence...",
      "Mapping time, money, attention, and energy patterns...",
      "Calculating alignment score and misalignments...",
      "Identifying your core state and value hierarchy...",
      "Generating your Value Pattern Decoder Report..."
    ],
    "deliverable": {
      "title": "Your Value Pattern Decoder Report is Ready",
      "description": "Your stated vs revealed values, alignment score, and realignment plan."
    }
  }$$::jsonb,
  'perception-rite',
  2,
  true
),
(
  'perception-rite-scan-3',
  'Boundary & Burnout',
  'Identify where your boundaries fail and redesign your energy system.',
  3.00,
  9,
  '20 minutes',
  $$You are the Perception Rite Guide for the Boundary & Burnout Scan.

# CORE INSIGHT

Burnout is not about working too hard. It is about having no OFF switch. Your duty cycle reveals what is always on, what is shut down, and what is missing.

# TASK

1. Identify always-on, guilt, shutdown, absence, and restoration patterns.
2. Map duty cycle ratios.
3. Diagnose boundary strength in time, energy, identity, permission.
4. Guide core transformation on the always-on part.
5. Install a restoration protocol with boundaries and recovery.

# VOICE

Direct, grounded, and practical. Diagnostic, not moral. No therapy framing. One follow-up question max when needed.$$,
  $$Generate a Boundary & Burnout Scan Report.

# OUTPUT STRUCTURE (5 pages)

PAGE 1: DUTY CYCLE ANALYSIS
- 24-hour map summary
- Green/yellow/red/black ratios
- Pattern type and burnout risk

PAGE 2: BOUNDARY STRENGTH
- Time, energy, identity, permission ratings
- Violation signs
- Weakest boundary

PAGE 3: CORE TRANSFORMATION
- Core State
- The paradox and reversal

PAGE 4: RESTORATION PROTOCOL
- One hard boundary
- One recovery activity
- One drain removed
- 30-day plan

PAGE 5: 90-DAY ENERGY REDESIGN
- Time, energy, identity, permission redesign steps
- Daily prompts
- Next scan recommendation: Money Signal

Use the user's language. Be specific and actionable.$$,
  $$[
    {
      "order": 1,
      "title": "Always-On Pattern",
      "question": "What stays active in your mind even when you are resting?",
      "input_type": "text",
      "text_input": {
        "label": "Always-on loop",
        "placeholder": "Example: I keep thinking about client deadlines even on weekends.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 2,
      "title": "Guilt Pattern",
      "question": "What do you feel guilty for turning off?",
      "input_type": "text",
      "text_input": {
        "label": "Guilt trigger",
        "placeholder": "Example: I feel guilty if I do not respond to messages within an hour.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 3,
      "title": "Shutdown Pattern",
      "question": "What have you completely shut down for years?",
      "input_type": "text",
      "text_input": {
        "label": "Shut down domain",
        "placeholder": "Example: Creativity and play have been off for years.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 4,
      "title": "Absence Pattern",
      "question": "What is entirely missing from your life right now?",
      "input_type": "text",
      "text_input": {
        "label": "Missing domain",
        "placeholder": "Example: I have no stillness or adventure at all.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 5,
      "title": "Restoration Memory",
      "question": "When was the last time you felt truly restored? Describe it.",
      "input_type": "text",
      "text_input": {
        "label": "Restoration memory",
        "placeholder": "Example: I felt restored after two days offline in the mountains with no agenda.",
        "required": true,
        "min_length": 60
      },
      "allow_file_upload": false
    },
    {
      "order": 6,
      "title": "Duty Cycle Map",
      "question": "Map a typical day into green (energizing), yellow (neutral), red (draining), black (recovery).",
      "input_type": "interactive",
      "text_input": {
        "label": "Summary of your duty cycle",
        "placeholder": "Example: Green 25%, Yellow 40%, Red 25%, Black 10%. Most red comes from admin and meetings.",
        "required": true,
        "min_length": 60
      },
      "allow_file_upload": false
    },
    {
      "order": 7,
      "title": "Boundary Strength",
      "question": "Rate your boundaries and identify the weakest link.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Time boundaries (Strong/Moderate/Weak/Absent)", "placeholder": "Example: Weak", "required": true, "field_name": "time_boundary" },
        { "label": "Energy boundaries", "placeholder": "Example: Moderate", "required": true, "field_name": "energy_boundary" },
        { "label": "Identity boundaries", "placeholder": "Example: Weak", "required": true, "field_name": "identity_boundary" },
        { "label": "Permission boundaries", "placeholder": "Example: Absent", "required": true, "field_name": "permission_boundary" }
      ],
      "text_input": {
        "label": "Weakest boundary and why",
        "placeholder": "Example: Permission boundaries. I wait for others to tell me it is ok to rest.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 8,
      "title": "Always-On Core State",
      "question": "What does the always-on part want for you, and what core state does it seek?",
      "input_type": "text",
      "text_input": {
        "label": "Core transformation chain",
        "placeholder": "Example: Staying on protects me from falling behind so I feel secure and at peace.",
        "required": true,
        "min_length": 60
      },
      "allow_file_upload": false
    },
    {
      "order": 9,
      "title": "Restoration Protocol",
      "question": "Install one boundary, one recovery activity, and remove one drain.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "One hard boundary", "placeholder": "Example: No work email after 7pm", "required": true, "field_name": "boundary" },
        { "label": "One recovery activity", "placeholder": "Example: 90-minute hike on Saturday", "required": true, "field_name": "recovery" },
        { "label": "One draining commitment to remove", "placeholder": "Example: Weekly status meeting", "required": true, "field_name": "remove" }
      ],
      "allow_file_upload": false
    }
  ]$$::jsonb,
  $${
    "welcome": {
      "title": "Boundary & Burnout Scan",
      "description": "Burnout is about having no off switch. This scan maps your duty cycle and shows where your boundaries fail.",
      "estimatedTime": "20 minutes",
      "ctaText": "Map My Energy"
    },
    "processing": [
      "Mapping your always-on patterns...",
      "Analyzing your duty cycle ratios...",
      "Assessing boundary strengths and weak points...",
      "Identifying your core state and reversal...",
      "Generating your Boundary & Burnout Report..."
    ],
    "deliverable": {
      "title": "Your Boundary & Burnout Report is Ready",
      "description": "Your duty cycle analysis, boundary profile, and restoration plan."
    }
  }$$::jsonb,
  'perception-rite',
  3,
  true
),
(
  'perception-rite-scan-4',
  'Money Signal',
  'Decode your money beliefs, pricing signal, and language to shift from scarcity to abundance.',
  3.00,
  7,
  '15-20 minutes',
  $$You are the Perception Rite Guide for the Money Signal Scan.

# CORE INSIGHT

The market responds to your money signal, not your value proposition. Your beliefs, pricing, and language broadcast scarcity or abundance.

# TASK

1. Run the money belief audit.
2. Diagnose pricing signal and feeling.
3. Audit money language for scarcity patterns.
4. Guide the core transformation from scarcity to okayness.
5. Install evidence mapping and a recalibration plan.

# VOICE

Confident, direct, and practical. No shame, only calibration. Use clear examples and ask one follow-up only if needed.$$,
  $$Generate a Money Signal Scan Report.

# OUTPUT STRUCTURE (4 pages)

PAGE 1: MONEY BELIEFS
- Belief audit summary
- Signal tone
- Current pricing and what it signals

PAGE 2: MONEY LANGUAGE
- Scarcity patterns
- Confidence score
- Abundance reframes

PAGE 3: CORE TRANSFORMATION
- Core State and paradox
- Reversal and new belief

PAGE 4: RECALIBRATION PROTOCOL
- Evidence mapping summary
- Pricing recalibration
- Sales script
- 21-day plan
- Next scan recommendation: Competence Mapping

Use the user's language. Be decisive and actionable.$$,
  $$[
    {
      "order": 1,
      "title": "Money Belief Audit",
      "question": "Complete these statements with your first thought.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Money is...", "placeholder": "Example: unpredictable", "required": true, "field_name": "money_is" },
        { "label": "Rich people are...", "placeholder": "Example: lucky", "required": true, "field_name": "rich_people" },
        { "label": "I charge what I charge because...", "placeholder": "Example: I am afraid of losing clients", "required": true, "field_name": "charge_because" },
        { "label": "If I raised my prices...", "placeholder": "Example: I would lose clients", "required": true, "field_name": "raise_prices" },
        { "label": "Money comes to me...", "placeholder": "Example: with struggle", "required": true, "field_name": "money_comes" },
        { "label": "I deserve to earn...", "placeholder": "Example: just enough", "required": true, "field_name": "deserve" },
        { "label": "Making money requires...", "placeholder": "Example: hard work", "required": true, "field_name": "requires" },
        { "label": "When I think about selling, I feel...", "placeholder": "Example: anxious", "required": true, "field_name": "selling_feel" }
      ],
      "text_input": {
        "label": "Overall tone (scarcity, neutral, abundance)",
        "placeholder": "Example: scarcity",
        "required": true,
        "min_length": 4
      },
      "allow_file_upload": false
    },
    {
      "order": 2,
      "title": "Pricing Signal",
      "question": "Describe your current pricing and how it feels.",
      "input_type": "mixed",
      "structured_options": {
        "type": "radio",
        "options": [
          { "value": "confident", "label": "Confident" },
          { "value": "uncomfortable", "label": "Uncomfortable" },
          { "value": "resentful", "label": "Resentful" },
          { "value": "uncertain", "label": "Uncertain" },
          { "value": "apologetic", "label": "Apologetic" }
        ],
        "allow_other": false,
        "required_count": 1
      },
      "text_input": {
        "label": "Offer, price, and why that number",
        "placeholder": "Example: Strategy sprint, $500, because it felt safer than $1,000",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 3,
      "title": "Pricing Assessment",
      "question": "Is your pricing aligned with the transformation you deliver?",
      "input_type": "mixed",
      "structured_options": {
        "type": "radio",
        "options": [
          { "value": "too_low", "label": "Too low" },
          { "value": "aligned", "label": "Aligned" },
          { "value": "too_high", "label": "Too high" }
        ],
        "allow_other": false,
        "required_count": 1
      },
      "text_input": {
        "label": "Reflection on value, clients, and delivery",
        "placeholder": "Example: I deliver high impact but price for beginners.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 4,
      "title": "Money Language Audit",
      "question": "Write your current offer sentence, then identify any scarcity phrases.",
      "input_type": "mixed",
      "structured_options": {
        "type": "checkbox",
        "options": [
          { "value": "only", "label": "Uses 'only'" },
          { "value": "apology", "label": "Apologizes for price" },
          { "value": "afford", "label": "Assumes people cannot afford" },
          { "value": "permission", "label": "Seeks permission or validation" },
          { "value": "doubt", "label": "Uses doubt or hedging" }
        ],
        "allow_other": true,
        "other_label": "Other scarcity phrase",
        "required_count": 0
      },
      "text_input": {
        "label": "Offer sentence + confidence score (1-10)",
        "placeholder": "Example: I offer X for $Y... Confidence: 4",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 5,
      "title": "Scarcity Core State",
      "question": "What does the scarcity belief protect you from, and what core state is it seeking?",
      "input_type": "text",
      "text_input": {
        "label": "Core transformation chain",
        "placeholder": "Example: Scarcity protects me from disappointment so I feel safe and okay.",
        "required": true,
        "min_length": 60
      },
      "allow_file_upload": false
    },
    {
      "order": 6,
      "title": "Evidence Mapping",
      "question": "List times money did come easily, plus 2-3 counter examples.",
      "input_type": "text",
      "text_input": {
        "label": "Evidence list",
        "placeholder": "Example: Client paid instantly, bonus arrived, refund came through... Counter: two times it was hard",
        "required": true,
        "min_length": 80
      },
      "allow_file_upload": false
    },
    {
      "order": 7,
      "title": "Recalibration Commitment",
      "question": "What pricing or language change will you implement next?",
      "input_type": "text",
      "text_input": {
        "label": "Commitment",
        "placeholder": "Example: Update my sales page to use investment language and raise my base price to $1,200.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    }
  ]$$::jsonb,
  $${
    "welcome": {
      "title": "Money Signal Scan",
      "description": "Your pricing, language, and beliefs broadcast a money signal. This scan recalibrates it.",
      "estimatedTime": "15-20 minutes",
      "ctaText": "Decode My Money Signal"
    },
    "processing": [
      "Analyzing your money belief patterns...",
      "Decoding your pricing signal...",
      "Scanning language for scarcity patterns...",
      "Mapping evidence for abundance...",
      "Generating your Money Signal Report..."
    ],
    "deliverable": {
      "title": "Your Money Signal Report is Ready",
      "description": "Your money signal diagnosis and recalibration protocol."
    }
  }$$::jsonb,
  'perception-rite',
  4,
  true
),
(
  'perception-rite-scan-5',
  'Competence Mapping',
  'Map your genius zone and redesign your system around what only you can do.',
  3.00,
  9,
  '15-20 minutes',
  $$You are the Perception Rite Guide for the Competence Mapping Scan.

# CORE INSIGHT

Trying to do everything spreads you thin and reduces value. This scan reveals your circle of competence, what belongs inside your system, and what should be delegated.

# TASK

1. Identify excellence, flow, market demand, teaching ability, and 10,000-hour expertise.
2. Audit time allocation across inner, middle, outer, and learning circles.
3. Diagnose business model misalignments.
4. Build delegation priorities and a 90-day plan.

# VOICE

Direct, strategic, and empowering. No shame. Specialization is power. One follow-up question only if needed.$$,
  $$Generate a Competence Mapping Scan Report.

# OUTPUT STRUCTURE (5 pages)

PAGE 1: CIRCLE OF COMPETENCE
- Inner, middle, outer circles
- Unfair advantage

PAGE 2: TIME ALLOCATION
- Current vs optimal ratios
- Time wasters

PAGE 3: CORE TRANSFORMATION
- Worthiness/okayness core state
- Paradox and reversal

PAGE 4: BUSINESS MODEL REALIGNMENT
- Misalignments
- Delegation matrix

PAGE 5: 90-DAY IMPLEMENTATION
- Month-by-month plan
- Daily prompts
- Master report unlock after all scans

Use their language. Be specific and actionable.$$,
  $$[
    {
      "order": 1,
      "title": "Excellence Pattern",
      "question": "What do you do significantly better than most people?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Excellence 1", "placeholder": "Example: Strategic synthesis", "required": true, "field_name": "excellence_1" },
        { "label": "Excellence 2", "placeholder": "Example: Clear decision frameworks", "required": true, "field_name": "excellence_2" },
        { "label": "Excellence 3", "placeholder": "Example: Pattern recognition", "required": true, "field_name": "excellence_3" },
        { "label": "Excellence 4", "placeholder": "Optional", "required": false, "field_name": "excellence_4" },
        { "label": "Excellence 5", "placeholder": "Optional", "required": false, "field_name": "excellence_5" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 2,
      "title": "Flow State",
      "question": "What activities put you in flow state?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Flow 1", "placeholder": "Example: Designing systems", "required": true, "field_name": "flow_1" },
        { "label": "Flow 2", "placeholder": "Example: Teaching frameworks", "required": true, "field_name": "flow_2" },
        { "label": "Flow 3", "placeholder": "Example: Research and synthesis", "required": true, "field_name": "flow_3" },
        { "label": "Flow 4", "placeholder": "Optional", "required": false, "field_name": "flow_4" },
        { "label": "Flow 5", "placeholder": "Optional", "required": false, "field_name": "flow_5" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 3,
      "title": "Magnetic Pattern",
      "question": "What do people consistently come to you for?",
      "input_type": "text",
      "text_input": {
        "label": "External validation",
        "placeholder": "Example: They ask me to clarify strategy and priorities.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 4,
      "title": "Teaching Test",
      "question": "What could you teach right now without preparation?",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Topic 1", "placeholder": "Example: Business model design", "required": true, "field_name": "teach_1" },
        { "label": "Topic 2", "placeholder": "Example: Messaging clarity", "required": true, "field_name": "teach_2" },
        { "label": "Topic 3", "placeholder": "Optional", "required": false, "field_name": "teach_3" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 5,
      "title": "10,000-Hour Expertise",
      "question": "What have you invested 10,000+ hours practicing?",
      "input_type": "text",
      "text_input": {
        "label": "Deep expertise",
        "placeholder": "Example: Coaching founders through pivots",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    },
    {
      "order": 6,
      "title": "Time Allocation Audit",
      "question": "Map last week across inner, middle, outer, and learning circles.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Inner circle tasks + hours", "placeholder": "Example: Strategy sessions - 12 hours", "required": true, "field_name": "inner" },
        { "label": "Middle circle tasks + hours", "placeholder": "Example: Delivery admin - 10 hours", "required": true, "field_name": "middle" },
        { "label": "Outer circle tasks + hours", "placeholder": "Example: Tech setup - 6 hours", "required": true, "field_name": "outer" },
        { "label": "Learning circle tasks + hours", "placeholder": "Example: New tool training - 4 hours", "required": false, "field_name": "learning" }
      ],
      "text_input": {
        "label": "Your estimated ratio (inner/middle/outer/learning)",
        "placeholder": "Example: 25/35/30/10",
        "required": true,
        "min_length": 10
      },
      "allow_file_upload": false
    },
    {
      "order": 7,
      "title": "Business Model Misalignments",
      "question": "List what your model requires that sits outside your competence.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "Misalignment 1", "placeholder": "Example: Daily outbound sales", "required": true, "field_name": "misalignment_1" },
        { "label": "Misalignment 2", "placeholder": "Example: Complex ops", "required": false, "field_name": "misalignment_2" },
        { "label": "Misalignment 3", "placeholder": "Optional", "required": false, "field_name": "misalignment_3" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 8,
      "title": "Delegation Priorities",
      "question": "Identify your highest priority tasks to delegate or eliminate.",
      "input_type": "multi_text",
      "text_inputs": [
        { "label": "High priority", "placeholder": "Example: Admin follow-ups", "required": true, "field_name": "delegate_high" },
        { "label": "Medium priority", "placeholder": "Example: Social media scheduling", "required": false, "field_name": "delegate_medium" },
        { "label": "Low priority", "placeholder": "Example: Basic design edits", "required": false, "field_name": "delegate_low" }
      ],
      "allow_file_upload": false
    },
    {
      "order": 9,
      "title": "90-Day Commitment",
      "question": "What is the first delegation or redesign step you will take this month?",
      "input_type": "text",
      "text_input": {
        "label": "Commitment",
        "placeholder": "Example: Hire a VA to take over scheduling and inbox triage.",
        "required": true,
        "min_length": 40
      },
      "allow_file_upload": false
    }
  ]$$::jsonb,
  $${
    "welcome": {
      "title": "Competence Mapping Scan",
      "description": "You do not need to do everything. This scan reveals your circle of competence and the work you should keep vs delegate.",
      "estimatedTime": "15-20 minutes",
      "ctaText": "Map My Genius"
    },
    "processing": [
      "Identifying excellence and flow patterns...",
      "Auditing time allocation across competence circles...",
      "Mapping business model misalignments...",
      "Building delegation priorities and a 90-day plan...",
      "Generating your Competence Mapping Report..."
    ],
    "deliverable": {
      "title": "Your Competence Mapping Report is Ready",
      "description": "Your circle of competence, delegation matrix, and implementation plan."
    }
  }$$::jsonb,
  'perception-rite',
  5,
  true
),
(
  'perception-rite-master',
  'Master Integration Report',
  'Master synthesis across all five scans.',
  0.00,
  0,
  '5-10 minutes',
  $$You are the Perception Rite Master Integrator. Synthesize all five scans into a single coherent transformation plan. Use a decisive, strategic tone. Connect the dots across signal, values, boundaries, money, and competence. Emphasize the shift from effect to cause and conscious agency.$$,
  $$Generate a 10-page Perception Rite Master Report.

PAGE 1: TRANSFORMATION SUMMARY
- Before: five statements
- After: five statements
- Core shift: effect to cause

PAGES 2-6: SCAN SUMMARIES
- One page per scan with key insights and action protocol

PAGE 7: INTEGRATED TRANSFORMATION PLAN
- 90-day master protocol
- Daily/weekly/monthly practices

PAGE 8: ARCHETYPE PROGRESSION
- Starting archetype
- Current archetype
- Next evolution requirements

PAGE 9: BUSINESS IMPACT FORECAST
- Decision quality
- Resource alignment
- Energy sustainability
- Revenue signal
- 6-month projection

PAGE 10: NEXT STEPS
- Orientation Rite recommendation
- Workshop recommendation
- Coaching recommendation

Use the user's language and specifics from each scan deliverable. Be concise and high signal.$$,
  '[]'::jsonb,
  NULL,
  'perception-rite',
  99,
  false
)
ON CONFLICT (product_slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_steps = EXCLUDED.total_steps,
  estimated_duration = EXCLUDED.estimated_duration,
  system_prompt = EXCLUDED.system_prompt,
  final_deliverable_prompt = EXCLUDED.final_deliverable_prompt,
  steps = EXCLUDED.steps,
  instructions = EXCLUDED.instructions,
  product_group = EXCLUDED.product_group,
  display_order = EXCLUDED.display_order,
  is_purchasable = EXCLUDED.is_purchasable;
