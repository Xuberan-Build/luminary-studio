#!/usr/bin/env tsx
/**
 * Analyze step configuration for all products
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSteps() {
  console.log('\n📊 Analyzing product step configurations...\n');

  const { data: products, error } = await supabase
    .from('product_definitions')
    .select('product_slug, name, total_steps, steps')
    .order('created_at', { ascending: true });

  if (error || !products) {
    console.error('❌ Error fetching products:', error?.message);
    process.exit(1);
  }

  products.forEach((product: any) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 ${product.name} (${product.product_slug})`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Steps: ${product.total_steps}`);

    const steps = product.steps as any[];
    steps.forEach((step: any, index: number) => {
      const hasPrompt = !!step.prompt;
      const hasNudge = step.prompt?.includes('ACTIONABLE NUDGE');
      const allowsUpload = step.allow_file_upload === true;
      const hasQuestion = !!step.question;

      console.log(`\n  Step ${step.step} (index ${index}):`);
      console.log(`    Title: ${step.title}`);
      console.log(`    Has prompt: ${hasPrompt ? '✅' : '❌'}`);
      console.log(`    Has nudge instructions: ${hasNudge ? '✅' : '❌'}`);
      console.log(`    File upload: ${allowsUpload ? '✅' : '❌'}`);
      console.log(`    Has question: ${hasQuestion ? '✅' : '❌'}`);

      if (!hasNudge && hasPrompt && !allowsUpload) {
        console.log(`    🎯 NEEDS nudge instructions`);
      }
    });
  });

  console.log(`\n${'='.repeat(60)}\n`);
}

analyzeSteps().catch(console.error);
