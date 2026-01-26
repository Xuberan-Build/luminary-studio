-- Restructure Money Signal Scan to start with Money Reality Mapping
-- Issue: Scan assumed everyone has pricing/offers (entrepreneurs only)
-- Fix: Start with understanding actual money flow structure for ALL financial situations

UPDATE product_definitions
SET
  description = 'Map your money reality, decode your beliefs, and recalibrate your earning signal.',
  
  system_prompt = $$You are the Perception Rite Guide for the Money Signal Scan.

# CORE INSIGHT

Money flows toward clarity and away from mixed signals. Your beliefs, language, and relationship to your current money sources broadcast what you expect - and you receive what you broadcast.

# TASK

1. Map their money reality (sources, stability, feelings)
2. Run the money belief audit
3. Audit money language for scarcity patterns
4. Reveal what the scarcity belief protects them from
5. Install evidence mapping and recalibration plan appropriate to their situation

# VOICE

Confident, direct, and practical. No shame, only calibration. Meet people where they are - W2, gig work, unemployed, entrepreneur, or mixed. Use clear examples and ask one follow-up only if needed.$$,

  final_deliverable_prompt = $$Generate a Money Signal Scan Report.

# OUTPUT STRUCTURE (4 pages)

PAGE 1: MONEY REALITY MAP
- Current money sources and amounts
- Stability assessment per source
- Emotional relationship to each source
- Financial architecture type (single point of failure vs diversified)
- Gap between what they HAVE vs what they WANT

PAGE 2: MONEY BELIEFS & LANGUAGE
- Belief audit summary
- Signal tone (scarcity/neutral/abundance)
- Language patterns and confidence score
- Scarcity phrases identified

PAGE 3: THE REAL PROBLEM
Start with: "Most people think the money problem is [their stated issue]. But that's not the real problem."

Then explain:
- What the scarcity belief protects them from
- What state they're actually seeking (safety, worthiness, okayness)
- The paradox: How the belief blocks what they want
- The reversal: What shift creates the opening

PAGE 4: RECALIBRATION PROTOCOL
Based on their money reality, provide specific actions:
- If W2: Negotiation script, side income activation, or career pivot plan
- If gig/freelance: Rate increase plan, packaging strategy, or client upgrade path
- If entrepreneur: Pricing recalibration, offer positioning, sales language
- If unemployed/building: Income bridge strategy while building
- If mixed: Optimization across all sources

Include:
- Evidence mapping (times money came easily)
- Language reframes (abundance shifts)
- 21-day recalibration plan
- Next scan recommendation: Competence Mapping

Use the user's language. Be specific to their actual financial situation.$$,

  steps = $$[
    {
      "order": 1,
      "title": "Money Sources Map",
      "question": "Where does money currently flow into your life? List all sources.",
      "input_type": "multi_text",
      "text_inputs": [
        { 
          "label": "Primary source (W2 job, business, gigs, etc.)", 
          "placeholder": "Example: Full-time marketing role at tech company", 
          "required": true, 
          "field_name": "source_1" 
        },
        { 
          "label": "Monthly amount (range is fine)", 
          "placeholder": "Example: $6,000-7,000/month", 
          "required": true, 
          "field_name": "amount_1" 
        },
        { 
          "label": "Secondary source (if any)", 
          "placeholder": "Example: Weekend freelance design work", 
          "required": false, 
          "field_name": "source_2" 
        },
        { 
          "label": "Secondary amount", 
          "placeholder": "Example: $500-1,500/month", 
          "required": false, 
          "field_name": "amount_2" 
        },
        { 
          "label": "Other sources", 
          "placeholder": "Example: Occasional affiliate income, investments", 
          "required": false, 
          "field_name": "source_3" 
        }
      ],
      "text_input": {
        "label": "How stable is each source? (Guaranteed / Variable / Unpredictable)",
        "placeholder": "Example: Primary is guaranteed (salary). Secondary is variable (depends on client projects). Other is unpredictable.",
        "required": true,
        "min_length": 15
      },
      "allow_file_upload": false
    },
    {
      "order": 2,
      "title": "Money Source Feelings",
      "question": "How do you feel about each money source?",
      "input_type": "text",
      "text_input": {
        "label": "Emotional relationship to your money sources",
        "placeholder": "Example: Primary feels safe but limiting - I'm grateful for stability but resentful of the cap. Secondary feels exciting but stressful - I love the freedom but hate the unpredictability. Want more passive income so I can breathe.",
        "required": true,
        "min_length": 30
      },
      "allow_file_upload": false
    },
    {
      "order": 3,
      "title": "Money Belief Audit",
      "question": "Complete these statements with your first thought.",
      "input_type": "multi_text",
      "text_inputs": [
        { 
          "label": "Money is...", 
          "placeholder": "Example: unpredictable", 
          "required": true, 
          "field_name": "money_is" 
        },
        { 
          "label": "Rich people are...", 
          "placeholder": "Example: lucky or ruthless", 
          "required": true, 
          "field_name": "rich_people" 
        },
        { 
          "label": "Money comes to me...", 
          "placeholder": "Example: with struggle", 
          "required": true, 
          "field_name": "money_comes" 
        },
        { 
          "label": "I deserve to earn...", 
          "placeholder": "Example: just enough to be comfortable", 
          "required": true, 
          "field_name": "deserve" 
        },
        { 
          "label": "Making more money requires...", 
          "placeholder": "Example: sacrificing my time and sanity", 
          "required": true, 
          "field_name": "requires" 
        },
        { 
          "label": "When I think about asking for money, I feel...", 
          "placeholder": "Example: anxious and apologetic", 
          "required": true, 
          "field_name": "asking_feel" 
        }
      ],
      "text_input": {
        "label": "Overall tone (scarcity, neutral, or abundance)",
        "placeholder": "Example: Definitely scarcity",
        "required": true,
        "min_length": 5
      },
      "allow_file_upload": false
    },
    {
      "order": 4,
      "title": "Money Language Audit",
      "question": "How do you talk about earning money? Write a sentence about how you earn (or want to earn) money.",
      "input_type": "mixed",
      "structured_options": {
        "type": "checkbox",
        "options": [
          { "value": "only", "label": "I use 'only' or 'just' when stating amounts" },
          { "value": "apology", "label": "I apologize for needing/wanting money" },
          { "value": "afford", "label": "I assume people cannot afford to pay me" },
          { "value": "luck", "label": "I attribute money success to luck, not skill" },
          { "value": "doubt", "label": "I use doubt or hedging ('maybe', 'hopefully')" }
        ],
        "allow_other": true,
        "other_label": "Other scarcity pattern I notice",
        "required_count": 0
      },
      "text_input": {
        "label": "Your money earning sentence + confidence level (1-10)",
        "placeholder": "Example: I earn a stable income from my job but I'd love to build something on the side. Confidence about earning more: 4/10",
        "required": true,
        "min_length": 20
      },
      "allow_file_upload": false
    },
    {
      "order": 5,
      "title": "The Real Problem",
      "question": "What does your scarcity belief protect you from? What deeper state are you seeking?",
      "input_type": "text",
      "text_input": {
        "label": "The deeper reason for scarcity thinking",
        "placeholder": "Example: If I keep expectations low, I won't be disappointed when money doesn't come. What I really want is to feel secure and okay regardless of what happens financially.",
        "required": true,
        "min_length": 30
      },
      "allow_file_upload": false
    },
    {
      "order": 6,
      "title": "Evidence Mapping",
      "question": "List 3-5 times money came to you easily or unexpectedly.",
      "input_type": "text",
      "text_input": {
        "label": "Times money flowed easily",
        "placeholder": "Example: Got a surprise bonus at work. Client paid my freelance invoice same day. Found $40 in old jacket. Friend paid back loan I'd written off. Sold old furniture for more than expected.",
        "required": true,
        "min_length": 30
      },
      "allow_file_upload": false
    },
    {
      "order": 7,
      "title": "Recalibration Commitment",
      "question": "What is ONE money move you will make in the next 21 days?",
      "input_type": "text",
      "text_input": {
        "label": "Your specific commitment",
        "placeholder": "Example: Ask for a raise at my annual review. OR Raise my freelance rate from $75 to $100/hour. OR Launch the digital product I've been sitting on. OR Apply to 3 higher-paying positions.",
        "required": true,
        "min_length": 20
      },
      "allow_file_upload": false
    }
  ]$$::jsonb,

  instructions = $${
    "welcome": {
      "title": "Money Signal Scan",
      "description": "Map your money reality, decode the signal you're broadcasting, and recalibrate for what you actually want.",
      "estimatedTime": "15-20 minutes",
      "ctaText": "Decode My Money Signal"
    },
    "processing": [
      "Mapping your money reality structure...",
      "Analyzing your money belief patterns...",
      "Scanning language for scarcity signals...",
      "Mapping evidence for recalibration...",
      "Generating your Money Signal Report..."
    ],
    "deliverable": {
      "title": "Your Money Signal Report is Ready",
      "description": "Your money reality map, belief audit, and recalibration protocol."
    }
  }$$::jsonb

WHERE product_slug = 'perception-rite-scan-4';