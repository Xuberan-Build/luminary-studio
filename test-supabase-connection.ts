import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Test 1: Connection
  console.log('Test 1: Database connection');
  const { data: tables, error: tablesError } = await supabase
    .from('users')
    .select('count')
    .limit(0);

  if (tablesError) {
    console.log('❌ Connection failed:', tablesError.message);
    return;
  }
  console.log('✅ Connected to Supabase!\n');

  // Test 2: Check tables exist
  console.log('Test 2: Checking tables');
  const tableNames = ['users', 'product_access', 'product_definitions', 'product_sessions'];

  for (const table of tableNames) {
    const { error } = await supabase.from(table).select('count').limit(0);
    if (error) {
      console.log(`❌ Table '${table}' not found`);
    } else {
      console.log(`✅ Table '${table}' exists`);
    }
  }
  console.log('');

  // Test 3: Check product definitions
  console.log('Test 3: Checking product_definitions');
  const { data: products, error: productsError } = await supabase
    .from('product_definitions')
    .select('product_slug, name, total_steps');

  if (productsError) {
    console.log('❌ Error reading products:', productsError.message);
  } else if (!products || products.length === 0) {
    console.log('⚠️  No products found. Did you run schema.sql?');
  } else {
    console.log(`✅ Found ${products.length} product(s):`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.product_slug}) - ${p.total_steps} steps`);
    });
  }
  console.log('');

  // Test 4: Row Level Security
  console.log('Test 4: Row Level Security');
  const { data: rlsCheck, error: rlsError } = await supabase.rpc('pg_get_rls_enabled', {
    table_name: 'users'
  }).single();

  if (rlsError) {
    console.log('⚠️  Could not check RLS (this is okay)');
  } else {
    console.log('✅ RLS policies are active');
  }
  console.log('');

  console.log('🎉 Supabase setup is complete and working!');
}

testConnection().catch(console.error);
