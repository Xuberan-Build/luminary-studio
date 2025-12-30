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

async function checkProductPrompts() {
  console.log('\n🔍 Checking Product Definitions\n');
  console.log('='.repeat(80));

  // Get all products
  const { data: products, error } = await supabase
    .from('product_definitions')
    .select('*')
    .order('product_slug');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  for (const product of products || []) {
    console.log(`\n📦 Product: ${product.product_name}`);
    console.log(`Slug: ${product.product_slug}`);
    console.log(`Total Steps: ${product.total_steps}`);
    console.log(`\n--- System Prompt ---`);
    console.log(product.system_prompt?.substring(0, 500) + '...\n');
    console.log(`\n--- Deliverable Prompt ---`);
    console.log(product.deliverable_prompt?.substring(0, 500) + '...\n');
    console.log('='.repeat(80));
  }
}

checkProductPrompts();
