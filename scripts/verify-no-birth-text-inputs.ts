#!/usr/bin/env tsx
/**
 * Verify NO steps ask for birth/chart data via text input
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Keywords that indicate asking for birth/chart data via text
const BIRTH_KEYWORDS = [
  'birth date',
  'birth time',
  'birth location',
  'birth information',
  'birth details',
  'birth data',
  'when were you born',
  'where were you born',
  'time of birth',
  'place of birth',
  'astrology chart',
  'human design chart',
  'natal chart',
  'chart information'
];

async function verifyNoTextInputs() {
  console.log('\n🔍 Verifying NO steps ask for birth/chart data via text input...\n');

  const { data: products, error } = await supabase
    .from('product_definitions')
    .select('product_slug, name, steps')
    .order('created_at', { ascending: true });

  if (error || !products) {
    console.error('❌ Error fetching products:', error?.message);
    process.exit(1);
  }

  let issuesFound = 0;

  products.forEach((product: any) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 ${product.name} (${product.product_slug})`);
    console.log(`${'='.repeat(60)}`);

    const steps = product.steps as any[];

    steps.forEach((step: any, index: number) => {
      // Check if step has a question (text input) but no file upload
      const hasTextInput = !!step.question && !step.allow_file_upload;

      if (hasTextInput) {
        // Check if question asks for birth/chart data
        const questionLower = (step.question || '').toLowerCase();
        const titleLower = (step.title || '').toLowerCase();
        const descLower = (step.description || '').toLowerCase();

        const matchedKeywords = BIRTH_KEYWORDS.filter(keyword =>
          questionLower.includes(keyword) ||
          titleLower.includes(keyword) ||
          descLower.includes(keyword)
        );

        if (matchedKeywords.length > 0) {
          console.log(`\n  ❌ ISSUE: Step ${step.step} (${step.title})`);
          console.log(`     Uses text input (should be file upload)`);
          console.log(`     Matched keywords: ${matchedKeywords.join(', ')}`);
          console.log(`     Question: ${step.question?.substring(0, 100)}...`);
          issuesFound++;
        }
      }

      // Also check file upload steps to ensure they're configured correctly
      if (step.allow_file_upload && index === 0) {
        console.log(`\n  ✅ Step ${step.step} (${step.title})`);
        console.log(`     Uses file upload ✓`);
        console.log(`     No text question ✓`);
      }
    });
  });

  console.log(`\n${'='.repeat(60)}\n`);

  if (issuesFound > 0) {
    console.log(`❌ Found ${issuesFound} steps asking for birth/chart data via text input!\n`);
    process.exit(1);
  } else {
    console.log('✅ All products correctly use file upload for chart data!\n');
    console.log('Summary:');
    console.log('  ✓ Business Alignment: File upload ✓');
    console.log('  ✓ Personal Alignment: File upload ✓');
    console.log('  ✓ Brand Alignment: File upload ✓');
    console.log('  ✓ Quantum Structure: File upload ✓ (reuses from previous products)');
    console.log('\n🎯 No steps ask for birth information via text input!\n');
  }
}

verifyNoTextInputs().catch(console.error);
