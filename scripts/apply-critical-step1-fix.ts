#!/usr/bin/env tsx
/**
 * Apply CRITICAL fix: Business Alignment Step 1 should be file upload, not text input
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBusinessAlignmentStep1() {
  console.log('\n🚨 CRITICAL FIX: Business Alignment Step 1\n');

  // Fetch current product
  const { data: product, error: fetchError } = await supabase
    .from('product_definitions')
    .select('steps')
    .eq('product_slug', 'business-alignment')
    .single();

  if (fetchError || !product) {
    console.error('❌ Error fetching product:', fetchError?.message);
    process.exit(1);
  }

  const steps = [...(product.steps as any[])];

  console.log('BEFORE:');
  console.log(`  Title: ${steps[0].title}`);
  console.log(`  Has question: ${!!steps[0].question}`);
  console.log(`  File upload: ${steps[0].allow_file_upload || false}`);
  console.log(`  Description: ${steps[0].description?.substring(0, 50)}...`);

  // Update Step 1 to file upload
  steps[0] = {
    step: 1,
    title: "Upload Your Charts",
    description: "Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Business Alignment Blueprint.",
    file_upload_prompt: `📊 **Get Your Birth Chart:**
Visit https://horoscopes.astro-seek.com/ - Enter your birth date, time, and location, then download or screenshot your chart.

🔮 **Get Your Human Design Chart:**
Visit https://www.myhumandesign.com/ - Enter your birth details, then download or screenshot your chart.

Upload both charts below (PDF, PNG, or JPG).`,
    allow_file_upload: true,
    required: true,
    max_follow_ups: 0
  };

  // Update product
  const { error: updateError } = await supabase
    .from('product_definitions')
    .update({ steps })
    .eq('product_slug', 'business-alignment');

  if (updateError) {
    console.error('❌ Error updating product:', updateError.message);
    process.exit(1);
  }

  console.log('\n✅ FIXED!\n');
  console.log('AFTER:');
  console.log(`  Title: ${steps[0].title}`);
  console.log(`  Has question: ${!!steps[0].question}`);
  console.log(`  File upload: ${steps[0].allow_file_upload}`);
  console.log(`  Description: ${steps[0].description?.substring(0, 50)}...`);

  console.log('\n🎯 Business Alignment Step 1 now uses file upload (not text input)!\n');
}

fixBusinessAlignmentStep1().catch(console.error);
