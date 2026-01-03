#!/usr/bin/env tsx
/**
 * Apply actionable nudge formatting migration
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('\n📝 Applying actionable nudge formatting migration...\n');

  // Read migration SQL
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260102000002_add_actionable_nudge_formatting.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Execute the SQL (note: this won't work with multi-statement SQL in Supabase client)
  // So let's do it step by step

  // Get current steps
  const { data: product, error: fetchError } = await supabase
    .from('product_definitions')
    .select('steps')
    .eq('product_slug', 'quantum-initiation')
    .single();

  if (fetchError || !product) {
    console.error('❌ Error fetching product:', fetchError?.message);
    process.exit(1);
  }

  const steps = product.steps as any[];
  const nudgeInstructions = `

**ACTIONABLE NUDGE:**
End your response with 1 specific actionable nudge formatted as:
"Actionable nudge (timeframe): [specific action to take]"

Example: "Actionable nudge (this week): choose one audience hub and post 3 direction-setting messages about your expert positioning."

Rules:
- Make it specific and concrete (not a question)
- Include a timeframe (this week, tomorrow, next 48 hours)
- Start with an action verb (choose, write, create, schedule, post, send)`;

  // Update each step (2-5, which are indices 1-4)
  const updatedSteps = [...steps];

  // Step 2 (index 1)
  if (updatedSteps[1]?.prompt) {
    updatedSteps[1].prompt += nudgeInstructions.replace(
      'choose one audience hub',
      'choose one audience hub and post 3 direction-setting messages about your expert positioning'
    );
  }

  // Step 3 (index 2)
  if (updatedSteps[2]?.prompt) {
    updatedSteps[2].prompt += nudgeInstructions.replace(
      'choose one audience hub and post 3 direction-setting messages about your expert positioning',
      'write one 3-sentence script addressing your root constraint and practice saying it out loud'
    );
  }

  // Step 4 (index 3)
  if (updatedSteps[3]?.prompt) {
    updatedSteps[3].prompt = (updatedSteps[3].prompt || '') + nudgeInstructions.replace(
      'choose one audience hub and post 3 direction-setting messages about your expert positioning',
      'schedule 2 hours to redesign your work process aligned with your Human Design type'
    );
  }

  // Step 5 (index 4)
  if (updatedSteps[4]?.prompt) {
    updatedSteps[4].prompt += nudgeInstructions.replace(
      'choose one audience hub and post 3 direction-setting messages about your expert positioning',
      'create a simple one-page vision document with your 90-day goal and share it with one trusted peer for accountability'
    );
  }

  // Update the product
  const { error: updateError } = await supabase
    .from('product_definitions')
    .update({ steps: updatedSteps })
    .eq('product_slug', 'quantum-initiation');

  if (updateError) {
    console.error('❌ Error updating product:', updateError.message);
    process.exit(1);
  }

  // Verify
  const { data: updated } = await supabase
    .from('product_definitions')
    .select('steps')
    .eq('product_slug', 'quantum-initiation')
    .single();

  console.log('✅ Migration applied successfully!\n');
  console.log('Updated Steps:');
  console.log(`  ✓ Step 2: ${(updated?.steps as any)[1]?.prompt?.includes('ACTIONABLE NUDGE') ? 'Has nudge instructions' : 'Missing nudge instructions'}`);
  console.log(`  ✓ Step 3: ${(updated?.steps as any)[2]?.prompt?.includes('ACTIONABLE NUDGE') ? 'Has nudge instructions' : 'Missing nudge instructions'}`);
  console.log(`  ✓ Step 4: ${(updated?.steps as any)[3]?.prompt?.includes('ACTIONABLE NUDGE') ? 'Has nudge instructions' : 'Missing nudge instructions'}`);
  console.log(`  ✓ Step 5: ${(updated?.steps as any)[4]?.prompt?.includes('ACTIONABLE NUDGE') ? 'Has nudge instructions' : 'Missing nudge instructions'}`);
  console.log('\nAI will now format actionable nudges properly! 🎯\n');
}

applyMigration().catch(console.error);
