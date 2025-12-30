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

async function checkStepsSchema() {
  console.log('\n🔍 Checking product_steps schema\n');

  // Get product definition first
  const { data: product } = await supabase
    .from('product_definitions')
    .select('id, product_slug, product_name, step_definitions')
    .eq('product_slug', 'personal-alignment')
    .single();

  if (!product) {
    console.error('❌ Product not found');
    process.exit(1);
  }

  console.log(`Product ID: ${product.id}`);
  console.log(`Product Slug: ${product.product_slug}`);
  console.log(`Product Name: ${product.product_name}`);
  console.log(`\n--- Step Definitions (JSONB) ---`);
  console.log(JSON.stringify(product.step_definitions, null, 2));
}

checkStepsSchema();
