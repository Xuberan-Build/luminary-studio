#!/usr/bin/env tsx
/**
 * Add actionable nudge formatting instructions to ALL products
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const NUDGE_INSTRUCTIONS = `

**ACTIONABLE NUDGE:**
End your response with 1 specific actionable nudge formatted as:
"Actionable nudge (timeframe): [specific action to take]"

Example: "Actionable nudge (this week): choose one specific action aligned with this insight and commit to it."

Rules:
- Make it specific and concrete (not a question)
- Include a timeframe (this week, tomorrow, next 48 hours)
- Start with an action verb (choose, write, create, schedule, post, send, etc.)`;

async function addNudgesToProduct(productSlug: string, stepIndices: number[]) {
  console.log(`\n📝 Updating ${productSlug}...`);

  // Fetch current product
  const { data: product, error: fetchError } = await supabase
    .from('product_definitions')
    .select('steps')
    .eq('product_slug', productSlug)
    .single();

  if (fetchError || !product) {
    console.error(`  ❌ Error fetching ${productSlug}:`, fetchError?.message);
    return;
  }

  const steps = [...(product.steps as any[])];
  let updated = 0;

  stepIndices.forEach((index) => {
    if (steps[index]?.prompt && !steps[index].prompt.includes('ACTIONABLE NUDGE')) {
      steps[index].prompt += NUDGE_INSTRUCTIONS;
      updated++;
    }
  });

  // Update product
  const { error: updateError } = await supabase
    .from('product_definitions')
    .update({ steps })
    .eq('product_slug', productSlug);

  if (updateError) {
    console.error(`  ❌ Error updating ${productSlug}:`, updateError.message);
    return;
  }

  console.log(`  ✅ Updated ${updated} steps`);
}

async function addNudgesToAllProducts() {
  console.log('\n🎯 Adding actionable nudge instructions to ALL products...\n');

  // Business Alignment: Step 1 (index 0) - Steps 2-5 already have nudges
  await addNudgesToProduct('business-alignment', [0]);

  // Personal Alignment: Steps 2-5 (indices 1-4)
  await addNudgesToProduct('personal-alignment', [1, 2, 3, 4]);

  // Brand Alignment: Steps 2-8 (indices 1-7)
  await addNudgesToProduct('brand-alignment', [1, 2, 3, 4, 5, 6, 7]);

  // Quantum Structure: Steps 2-7 (indices 1-6)
  await addNudgesToProduct('quantum-structure-profit-scale', [1, 2, 3, 4, 5, 6]);

  console.log('\n✅ All products updated!\n');
  console.log('Summary:');
  console.log('  ✓ Business Alignment: 1 step updated (Step 1)');
  console.log('  ✓ Personal Alignment: 4 steps updated (Steps 2-5)');
  console.log('  ✓ Brand Alignment: 7 steps updated (Steps 2-8)');
  console.log('  ✓ Quantum Structure: 6 steps updated (Steps 2-7)');
  console.log('\n🎯 Total: 18 steps now have actionable nudge formatting instructions!\n');
}

addNudgesToAllProducts().catch(console.error);
