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

async function showProductSchema() {
  console.log('\n🔍 Product Definitions Schema\n');

  const { data: products, error } = await supabase
    .from('product_definitions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  if (products && products.length > 0) {
    console.log('Columns available:');
    console.log(Object.keys(products[0]));
    console.log('\nSample product:');
    console.log(JSON.stringify(products[0], null, 2));
  }
}

showProductSchema();
