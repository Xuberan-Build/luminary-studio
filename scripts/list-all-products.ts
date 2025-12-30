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

async function listAllProducts() {
  console.log('\n📦 All Products in Database\n');

  const { data: products, error } = await supabase
    .from('product_definitions')
    .select('id, product_slug, product_name, total_steps')
    .order('product_slug');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.table(products);

  // Now let's check one product's full data
  if (products && products.length > 0) {
    const slug = products.find(p => p.product_slug === 'personal-alignment')?.product_slug || products[0].product_slug;

    console.log(`\n🔍 Detailed view of: ${slug}\n`);

    const { data: product } = await supabase
      .from('product_definitions')
      .select('*')
      .eq('product_slug', slug)
      .single();

    if (product) {
      console.log('Columns in product_definitions:');
      console.log(Object.keys(product));

      if (product.step_definitions) {
        console.log(`\n--- First 2 Steps ---`);
        const steps = Array.isArray(product.step_definitions)
          ? product.step_definitions
          : JSON.parse(product.step_definitions);

        console.log(JSON.stringify(steps.slice(0, 2), null, 2));
      }
    }
  }
}

listAllProducts();
