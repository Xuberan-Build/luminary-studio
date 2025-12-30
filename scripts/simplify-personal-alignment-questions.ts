#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simplifyQuestions() {
  console.log('\n✂️  Simplifying Personal Alignment Questions\n');
  console.log('='.repeat(60));

  const { data: product, error } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', 'personal-alignment')
    .single();

  if (error || !product) {
    console.error('❌ Error loading product:', error?.message);
    process.exit(1);
  }

  const steps = product.steps;

  // Simplify Step 2 - Life Satisfaction & Core Values
  steps[1].question = `**Why This Matters:**
Before you can build an aligned life, you need clarity on what matters most to YOU—not what you were taught to value, but what authentically drives you. Your chart reveals your natural value system.

**Part 1: Current Life Alignment**
Across all areas of your life (relationships, health, daily routine, personal growth, fulfillment), how aligned do you feel with who you truly are?

Rate it 1-10: (1 = living someone else's life, 10 = completely authentic)

**Part 2: What Matters Most to You**
Share what genuinely matters to you:

• **What lights you up?** When do you feel most alive, most yourself?
• **What would you never compromise on?** Even if it cost you money, status, or approval?
• **What makes you angry or frustrated?** (This reveals violated values)
• **If you could design your life with zero constraints, what would you prioritize?**

Don't overthink it—just share what genuinely matters to you. We'll help you identify your core values from what you share.`;

  // Simplify Step 3 - Energy Architecture
  steps[2].question = `**Why This Matters:**
You have a unique energy design. Certain activities light you up, others drain you. Most people build lives around what drains them, then wonder why they're exhausted. Your Human Design type reveals how you're meant to operate.

**Reflect On:**

**What Energizes You:**
• What activities make you lose track of time?
• When do you feel most alive and engaged?
• What could you do for hours without feeling tired?

**What Drains You:**
• What do you procrastinate on or dread?
• What leaves you exhausted even if it's not physically demanding?
• What feels like obligation rather than opportunity?

**Your Current Daily Reality:**
• Describe a typical day from wake to sleep
• What percentage of your day is energizing vs. draining?
• What would need to change for you to feel energized most of the time?

List specific activities that energize vs. drain you, then describe your typical day. Be honest—we're looking for patterns, not judgment.`;

  // Simplify Step 4 - Identity Evolution
  steps[3].question = `**Why This Matters:**
You're not meant to stay the same person forever. Identity evolution is natural and necessary. Your chart shows your growth direction—where you've been, where you are, and where you're being called.

**Reflect On:**

**Past Identity (5 years ago):**
• What were your priorities and goals back then?
• What did you believe about yourself and the world?

**Present Identity (Now):**
• How have your priorities shifted since then?
• What matters to you now that didn't matter before?
• What used to matter that doesn't matter anymore?

**Future Vision (Who You're Becoming):**
If you could design your ideal life with no limitations, what would it look like?

**Morning to Evening:**
• What time do you wake up? What's the first thing you do?
• What work are you doing (if any)? Where does income come from?
• How do you spend your free time? Who do you spend it with?

**Big Picture:**
• What does your home look like? Where is it?
• What's your relationship status and quality?
• What impact are you making? What are you known for?

Most importantly: **WHO are you BEING in this life** (not just what you're doing)? How do you FEEL in your body in this future? What's the quality of your days—the energy, the pace, the purpose?

Paint a picture of your ideal future life. Don't hold back. What does your soul actually want?`;

  // Simplify Step 5 - Life Purpose & Calling
  steps[4].question = `**Why This Matters:**
Your Life's Task—what Robert Greene calls your unique calling—is not something you invent. It's something you discover. It's been there all along, showing up as recurring themes, persistent interests, and natural talents. Your chart reveals what you're here to do.

**Reflect On:**

**Recurring Themes:**
• What subjects, topics, or problems have fascinated you across your entire life?
• What problems do you naturally notice and want to solve?
• What do people consistently come to you for help with?

**Natural Gifts:**
• What comes easily to you that others struggle with?
• What activities put you in flow state where time disappears?
• If you started a masterclass tomorrow, what would you teach?
• What would you do even if no one paid or recognized you for it?

**Your Calling:**
Based on everything you've shared—your values, energy, identity evolution, and vision—what do you sense is your Life's Task? What feels like your unique calling?

If you're not certain yet, that's okay. Share:
• What you're drawn to
• What themes keep appearing in your life
• What you sense you're here to do
• What you'd regret NOT doing with your life

**Possible Frames:**
• "I'm here to help people..."
• "My calling is to create/build..."
• "I feel pulled toward..."
• "The world needs me to..."
• "I can't NOT do..."

Don't try to sound impressive or unique. Don't worry about how you'll monetize it yet. Just be honest about what calls to you. What feels like YOURS to do in this lifetime?`;

  // Update the database
  const { error: updateError } = await supabase
    .from('product_definitions')
    .update({ steps })
    .eq('product_slug', 'personal-alignment');

  if (updateError) {
    console.error('❌ Error updating questions:', updateError.message);
    process.exit(1);
  }

  console.log('✅ Personal Alignment questions simplified!');
  console.log('\nChanges made:');
  console.log('• Step 2: Reduced from 15+ questions to 4 core questions');
  console.log('• Step 3: Streamlined energy questions');
  console.log('• Step 4: Simplified identity/vision questions');
  console.log('• Step 5: Clarified life purpose questions');
  console.log('\n' + '='.repeat(60));
}

simplifyQuestions();
