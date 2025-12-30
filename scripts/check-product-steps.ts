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

const productSlug = 'personal-alignment';

async function checkProductSteps() {
  console.log(`\n🔍 Checking Steps for: ${productSlug}\n`);
  console.log('='.repeat(80));

  // Get product definition
  const { data: product } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', productSlug)
    .single();

  if (!product) {
    console.error('❌ Product not found');
    process.exit(1);
  }

  console.log(`\n📦 Product: ${product.product_name}`);
  console.log(`Total Steps: ${product.total_steps}`);

  // Get all steps
  const { data: steps, error } = await supabase
    .from('product_steps')
    .select('*')
    .eq('product_slug', productSlug)
    .order('step_number');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log(`\nFound ${steps?.length || 0} steps\n`);

  for (const step of steps || []) {
    console.log('='.repeat(80));
    console.log(`\n📝 Step ${step.step_number}: ${step.title}`);
    console.log(`Section: ${step.section_number}`);
    if (step.subtitle) console.log(`Subtitle: ${step.subtitle}`);
    console.log(`\n--- Question ---`);
    console.log(step.question || 'No question');
    if (step.assistant_prompt) {
      console.log(`\n--- Assistant Prompt ---`);
      console.log(step.assistant_prompt.substring(0, 300) + '...');
    }
    console.log();
  }

  console.log('='.repeat(80));
}

checkProductSteps();
