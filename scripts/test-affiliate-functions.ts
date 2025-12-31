#!/usr/bin/env tsx
/**
 * Test if affiliate database functions exist and work
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAffiliateFunctions() {
  console.log('\n🧪 Testing Affiliate Database Functions\n');
  console.log('═'.repeat(60));

  // Test 1: generate_referral_code
  console.log('\n1. Testing generate_referral_code()...');
  try {
    const { data, error } = await supabase.rpc('generate_referral_code');

    if (error) {
      console.log('   ❌ FAILED:', error.message);
      console.log('   Error details:', error);
    } else {
      console.log('   ✅ SUCCESS');
      console.log(`   Generated code: ${data}`);
    }
  } catch (err: any) {
    console.log('   ❌ ERROR:', err.message);
  }

  // Test 2: Check if referral_hierarchy table exists
  console.log('\n2. Checking referral_hierarchy table...');
  try {
    const { count, error } = await supabase
      .from('referral_hierarchy')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('   ❌ FAILED:', error.message);
    } else {
      console.log('   ✅ Table exists');
      console.log(`   Current records: ${count || 0}`);
    }
  } catch (err: any) {
    console.log('   ❌ ERROR:', err.message);
  }

  // Test 3: Check if stripe_connect_accounts table exists
  console.log('\n3. Checking stripe_connect_accounts table...');
  try {
    const { count, error } = await supabase
      .from('stripe_connect_accounts')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('   ❌ FAILED:', error.message);
    } else {
      console.log('   ✅ Table exists');
      console.log(`   Current records: ${count || 0}`);
    }
  } catch (err: any) {
    console.log('   ❌ ERROR:', err.message);
  }

  // Test 4: Check users table has affiliate columns
  console.log('\n4. Checking users table affiliate columns...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_affiliate, affiliate_opted_out, affiliate_enrolled_at')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.log('   ❌ FAILED:', error.message);
    } else {
      console.log('   ✅ Columns exist');
    }
  } catch (err: any) {
    console.log('   ❌ ERROR:', err.message);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n💡 If any tests failed, run migrations:\n');
  console.log('   psql $DATABASE_URL -f database/migrations/003_affiliate_functions.sql');
  console.log('   psql $DATABASE_URL -f database/migrations/006_affiliate_opt_in_system.sql');
  console.log('   psql $DATABASE_URL -f database/migrations/008_fix_function_search_path.sql\n');
}

testAffiliateFunctions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
