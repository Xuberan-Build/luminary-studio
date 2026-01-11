/**
 * Personal Alignment Orientation - Product Definition
 *
 * Discover your core values, life purpose, and authentic self using Astrology & Human Design.
 * Know who you're designed to be before you decide what to build.
 */

import { ProductDefinition } from './types';

export const productDefinition: ProductDefinition = {
  // PRODUCT METADATA
  product_slug: 'personal-alignment',
  name: 'Personal Alignment Orientation',
  description: 'Discover your core values, life purpose, and authentic self using Astrology & Human Design. Know who you are designed to be before you decide what to build.',
  price: 7.00,
  total_steps: 5,
  estimated_duration: '15-20 minutes',
  model: 'gpt-4o',

  // CRM CONFIGURATION
  sheet_id: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
  from_email: 'austin@xuberandigital.com',
  from_name: 'Quantum Strategies',

  // SYSTEM PROMPT
  system_prompt: `You are the Personal Alignment Guide AI (Sage–Companion).

You must be:
- Compassionate and wise
- Chart-aware (Sun/Moon/Rising, Venus, Mars, Saturn, Pluto, North Node, HD type/strategy/authority/profile)
- Value-focused (extract and map values to core principles)
- Always offer actionable alignment nudges

Your Purpose:
Help people discover WHO they are at their core—their authentic values, natural energy design, and Life's Task—using their astrological and Human Design charts.

Rules:
- Never fabricate unknown chart data
- Extract values FROM user's words (don't impose)
- Map extracted values to the 5 Core Principles framework
- Ask for missing pieces briefly (especially birth time for Rising sign)
- Write like you're talking to a smart high schooler (simple language, short sentences)
- Ground everything in their chart placements
- Be decisive, not wishy-washy ("Your chart says X" not "You might consider...")

The 5 Core Principles Framework:
1. Inner Peace & Wholeness - Feeling complete, not fragmented
2. Gentle Transformation - Growth through compassion, not struggle
3. Positive Intent - Every behavior serves a purpose
4. Self-Discovery - Finding your own inner resources
5. Spiritual Connection - Making deep concepts practical

Quality Standard:
Every response should feel like a $500 clarity session compressed into 2-3 paragraphs.`,

  // FINAL DELIVERABLE PROMPT
  final_deliverable_prompt: `You are the Personal Alignment Guide. Create a powerful Personal Alignment Blueprint that a smart high schooler could understand but is deep enough to be worth $500.

Writing Style:
- Write like you're talking to someone smart but not an expert
- Short sentences
- Simple words
- Explain any jargon
- No fluff—every word must earn its place

Data Integrity:
- Use only confirmed chart data
- If something is UNKNOWN, say so plainly and note it as a limitation
- Don't fabricate placements or interpretations

Deliver these 7 sections:

1) **Core Identity** (3-4 sentences)
   - Their Sun/Moon/Rising essence in plain language
   - HD type/strategy/authority basics
   - Who they are at their core, how they're designed to operate

2) **Value System** (4-5 sentences)
   - List their 3-5 core values (extracted from Step 2)
   - Connect to Venus, 2nd house, other relevant placements
   - Show how these values form a coherent system
   - Include the Value System Mapping to the 5 Core Principles

3) **Energy Architecture** (4-5 sentences)
   - HD energy mechanics (Generator/Manifestor/Projector/Reflector)
   - Mars placement (action style)
   - What energizes vs. drains them based on their responses
   - How to structure life for sustainable energy

4) **Identity Evolution** (4-5 sentences)
   - Where they've been (past identity)
   - Where they are (present)
   - Where they're growing (future)
   - Reference Saturn (lessons), Pluto (transformation), North Node (soul direction)
   - Validate evolution as natural and necessary

5) **Life Vision** (4-5 sentences)
   - Their desired future state from Step 4
   - Connect to chart's highest potential (Jupiter, MC/10th house)
   - The life they're designed to live when fully expressed
   - WHO they're being in that future (not just what they're doing)

6) **Life Purpose** (4-5 sentences)
   - Their Life's Task articulated clearly
   - What they're uniquely here to do
   - Reference Sun (life purpose), North Node (soul direction), MC (public mission)
   - Connect to recurring themes from their responses
   - How personal purpose sets foundation for future business

7) **Alignment Action Plan** (3-5 action items)
   - Concrete next steps to close gap between current reality and authentic self
   - One line each
   - THIS WEEK actions (not someday goals)
   - Example: "1) Identify one daily activity misaligned with your values and eliminate it this week"

Synthesis:
- Synthesize insights from all 5 steps into the blueprint
- Keep total length around 400-500 words
- Every word must earn its place
- Make it feel like a $500 consultation

Cross-Reference to Business Alignment:
End with: "You now know WHO you are and WHAT you value. Ready to discover WHAT GAME your business is designed to play? Business Alignment Orientation shows you how to monetize your purpose and build offers aligned with your cosmic design."`,

  // STEPS CONFIGURATION
  steps: [
    // STEP 1: Upload Charts
    {
      step: 1,
      title: 'Upload Your Charts',
      subtitle: 'Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Personal Alignment Blueprint.',
      question: 'Please upload your birth chart files. We accept:\n- Astrology charts (PDF or image from astro.com, astro-seek.com, etc.)\n- Human Design charts (PDF or image from jovianarchive.com, mybodygraph.com, etc.)\n\nYou can upload multiple files if you have separate charts.',
      prompt: 'Thank you for uploading your chart! I\'m analyzing your placements now. This will take just a moment...\n\n(Note: The system will automatically extract placements using Vision API and show a confirmation screen before proceeding to Step 2)',
      allow_file_upload: true,
      file_upload_prompt: 'Upload your charts as PDF, PNG, or JPG. You can upload multiple files.',
      required: true,
      max_follow_ups: 0,
    },

    // STEP 2: Life Satisfaction & Core Values
    {
      step: 2,
      title: 'Life Satisfaction & Core Values',
      subtitle: 'Let\'s discover what truly matters to you',
      question: `**Why This Matters:**
Before you can build an aligned business, you need clarity on what matters most to YOU—not what you were taught to value, but what authentically drives you. Your chart reveals your natural value system.

**Part 1: Current Life Alignment**
Across all areas of your life (relationships, health, daily routine, personal growth, fulfillment), how aligned do you feel with who you truly are? Rate it 1-10.
(1 = living someone else's life, 10 = completely authentic)

**Part 2: What Matters Most to You**
Don't worry about naming "values" perfectly—just answer honestly:

• What lights you up? When do you feel most alive, most yourself?
• What would you never compromise on? Even if it cost you money, status, or approval?
• What makes you angry or frustrated? (This reveals violated values)
• If you could design your life with zero constraints, what would you prioritize?
• What do you admire most in others? What qualities draw you to people?
• What would you do even if no one paid or recognized you for it?

Think about these areas:

• Freedom vs. Security: Do you crave autonomy or stability?
• Growth vs. Comfort: Do you prioritize learning/expansion or peace/consistency?
• Connection vs. Independence: Do relationships or solitude energize you?
• Impact vs. Personal fulfillment: Do you want to change the world or perfect your craft?
• Authenticity vs. Harmony: Do you value truth-telling or keeping the peace?

**Your Response:**
Give your alignment rating (1-10) and explain why. Then answer the questions above in your own words. Don't overthink it—just share what genuinely matters to you. We'll help you identify your core values from what you share.`,
      prompt: `RESPONSE STRUCTURE:

Opening:
"Hey, I'm the Personal Alignment Guide. I've read your chart and I can see who you're designed to be."

Then structure your response like this:

**YOUR CORE VALUES** (extracted from what they shared):

1. **[Value Name]** - [Brief definition based on their words]
2. **[Value Name]** - [Brief definition]
3. **[Value Name]** - [Brief definition]
[Continue for 3-5 values total]

**CHART ALIGNMENT:**
[Reference Sun/Moon/Rising + Venus + 2nd house to validate these values. Explain why their chart naturally prioritizes these values.]

**VALUE SYSTEM MAPPING:**
Your values map to deeper principles that guide transformation:

- **[Their Value]** connects to **[Core Principle]** → [How it shows up in their life]
- **[Their Value]** connects to **[Core Principle]** → [How it shows up]
[Continue for all their values]

**WHAT THIS MEANS:**
[Synthesize how their values create a coherent system aligned with their Life's Task]

[One alignment nudge: concrete action to honor their values this week]

VALUE EXTRACTION RULES:
- Extract values FROM their exact words (don't impose values they didn't express)
- If user says "I need freedom" → Value: Autonomy
- If user says "I have to create" → Value: Creative Expression
- If user says "I won't lie even if it works" → Value: Integrity
- Define each value using THEIR language, not generic definitions

CORE PRINCIPLES MAPPING:
- Values about freedom, self-direction → Self-Discovery
- Values about peace, authenticity, alignment → Inner Peace & Wholeness
- Values about growth, learning, evolution → Gentle Transformation
- Values about honesty, truth, doing right → Positive Intent
- Values about meaning, purpose, contribution → Spiritual Connection`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 3: Energy Architecture & Daily Life
    {
      step: 3,
      title: 'Energy Architecture & Daily Life',
      subtitle: 'Understanding what fuels vs. depletes you',
      question: `**Why This Matters:**
You have a unique energy design. Certain activities light you up, others drain you. Most people build lives around what drains them, then wonder why they're exhausted. Your Human Design type reveals how you're meant to operate.

**Your Human Design Type Determines Your Energy:**

• Generators (70% of people): Energy comes from RESPONDING to things that excite you
• Manifestors (9%): Energy comes from INITIATING new things when inspired
• Projectors (20%): Energy comes from being INVITED to guide others
• Reflectors (1%): Energy comes from being in ENVIRONMENTS that feel right

(Don't worry if you don't know your type—we'll tell you based on your chart)

**Reflect On:**

**ENERGIZERS - What gives you life:**
• What activities make you lose track of time?
• When do you feel most alive and engaged?
• What could you do for hours without feeling tired?
• What lights up your whole body when you think about it?

**DRAINS - What depletes you:**
• What do you procrastinate on or dread?
• What leaves you exhausted even if it's not physically demanding?
• What feels like obligation rather than opportunity?
• What makes you feel like you're dying inside?

**Current Daily Reality:**
• Describe a typical day from wake to sleep
• How much control do you have over your time and energy?
• What percentage of your day is energizing vs. draining?
• What would need to change for you to feel energized most of the time?

**Your Response:**
List specific activities that energize vs. drain you. Then describe your typical day. Be honest—we're looking for patterns, not judgment. The more specific you are, the clearer your energy architecture becomes.

**Go Deep:**
Notice patterns. Do you get energy from people or solitude? From creating or analyzing? From freedom or structure? From teaching or learning? Your body knows the truth—listen to it.`,
      prompt: `Identify their HD type and explain energy mechanics in simple terms.

Reference Mars (action style), Sun (life force expression).

Connect energizers/drains to their design.

Show misalignment between current daily life and natural energy.

Give one micro-action to reclaim energy this week.

Write like you're talking to a smart high schooler. Short sentences. Ground everything in their chart. End with one powerful next step.`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 4: Identity Evolution & Life Vision
    {
      step: 4,
      title: 'Identity Evolution & Life Vision',
      subtitle: 'Who you were, who you are, who you\'re becoming',
      question: `**Why This Matters:**
You're not meant to stay the same person forever. Identity evolution is natural and necessary. Your chart shows your growth direction—where you've been, where you are, and where you're being called. Most people feel guilty about outgrowing old versions of themselves. Your chart says it's necessary.

**Reflect On:**

**Past Identity (5 years ago):**
• What were your priorities and goals back then?
• What did you believe about yourself and the world?
• What version of yourself were you trying to be?
• What made you feel successful or valuable?

**Present Identity (Now):**
• How have your priorities shifted since then?
• What beliefs have changed?
• What matters to you now that didn't matter before?
• What used to matter that doesn't matter anymore?
• Where do you feel different from who you were?

**Future Vision (Who You're Becoming):**
If you could design your ideal life with no limitations, what would it look like?

• **Morning:** What time do you wake up? What's the first thing you do? Where are you? Who's there with you?
• **Midday:** What work are you doing (if any)? Where does income come from? Who are you collaborating with? How much control do you have over your schedule?
• **Evening:** How do you spend your free time? Who do you spend it with? What hobbies or passions do you pursue?
• **Big Picture:** What does your home look like? Where is it? What's your financial situation (specific number if possible)? What's your relationship status and quality? What impact are you making? What are you known for?

Most importantly:

• WHO are you BEING in this life (not just what you're doing)?
• How do you FEEL in your body in this future?
• What's the quality of your days—the energy, the pace, the purpose?

**Your Response:**
Describe who you were 5 years ago, who you are now, and who you're becoming. Then paint a picture of your ideal future life in vivid detail—from wake to sleep. Don't hold back. Don't edit for "realism." What does your soul actually want?

**Go Deep:**
This isn't about external circumstances alone (house, car, income). It's about the QUALITY of your experience. How do you FEEL in this life? What's the energy? The rhythm? The purpose? Let yourself dream without limits.`,
      prompt: `Reference Saturn (lessons/growth), Pluto (transformation), North Node (soul direction).

Validate identity evolution as natural path of their chart.

Connect vision to chart's highest potential (Jupiter, MC/10th house).

Identify WHO they need to become (not just what to do).

Challenge any vision elements misaligned with their design.

Give one identity-shift action.

Write in simple language. 2-3 paragraphs. End with one powerful nudge.`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 5: Life Purpose & Calling
    {
      step: 5,
      title: 'Life Purpose & Calling',
      subtitle: 'What is your unique Life\'s Task?',
      question: `**Why This Matters:**
Your Life's Task—what Robert Greene calls your unique calling—is not something you invent. It's something you discover. It's been there all along, showing up as recurring themes, persistent interests, natural talents, and a magnetic pull toward certain activities or subjects. Your chart reveals what you're here to do.

**Your Life's Task Has These Qualities:**

• It feels deeply personal and unique to you
• You've been drawn to it since childhood (in some form)
• It connects your natural gifts with meaningful contribution
• When you engage with it, you lose track of time
• It feels like play, even when it's challenging
• You'd do it even if no one paid you
• It creates value for others, not just you

**Reflect On:**

**Recurring Themes:**
• What subjects, topics, or problems have fascinated you across your entire life?
• What problems do you naturally notice and want to solve?
• What do people consistently come to you for help with?
• What injustices or inefficiencies make you angry or frustrated?

**Natural Gifts:**
• What comes easily to you that others struggle with?
• What do you do that makes people say "I could never do that" or "How did you do that?"
• What activities put you in flow state where time disappears?
• If you started a masterclass tomorrow, what would you teach?
• What would you do even if no one paid or recognized you for it?

**Intersection Point:**
Your Life's Task lives at the intersection of:

• What you're naturally good at (your gifts)
• What the world needs (problems you can solve)
• What you're deeply curious about (your interests)
• What creates transformation (your impact)

**Consider Your Previous Responses:**
Look back at what you've shared:

• Your core values (what matters most)
• Your energizers (what you could do forever)
• Your identity evolution (who you're becoming)
• Your vision (what life you're creating)

All of these point toward your Life's Task.

**Your Response:**
Based on everything you've shared—your values, energy, identity evolution, and vision—what do you sense is your Life's Task? What feels like your unique calling?

If you're not certain yet, that's completely okay. Share:

• What you're drawn to
• What themes keep appearing in your life
• What you sense you're here to do (even if it's vague)
• What you'd regret NOT doing with your life

**Possible Frames to Help:**

• "I'm here to help people..."
• "My calling is to create/build..."
• "I feel pulled toward..."
• "The world needs me to..."
• "I'm designed to be a bridge between..."
• "I can't NOT do..."

**Go Deep:**
Don't try to sound impressive or unique. Don't worry about how you'll monetize it yet (that's for Business Alignment Orientation). Just be honest about what calls to you. What feels like YOURS to do in this lifetime?`,
      prompt: `Synthesize ALL previous responses into Life's Task clarity.

Reference Sun (life purpose), North Node (soul direction), MC/10th house (public mission).

Articulate their Life's Task in clear, powerful language.

Connect personal purpose to future business potential.

Validate recurring themes as chart-aligned.

Give 3 immediate alignment actions (THIS WEEK).

End with bridge to Business Alignment Orientation:
"You now know WHO you are and WHAT you value. Ready to discover WHAT GAME your business is designed to play? Business Alignment Orientation shows you how to monetize your purpose and build offers aligned with your cosmic design. Your personal foundation is solid—now let's build your business strategy on top of it."`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },
  ],
};
