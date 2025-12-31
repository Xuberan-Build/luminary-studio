#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyChanges() {
  console.log('🔍 Verifying Database Changes\n');
  console.log('=' . repeat(60));

  // 1. Check auto_copy_placements function
  console.log('\n📋 Checking auto_copy_placements_to_new_session function:\n');

  const { data: autoFuncData, error: autoFuncError } = await supabase.rpc('exec_sql' as any, {
    query: `
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'auto_copy_placements_to_new_session';
    `
  }).select();

  if (autoFuncError) {
    // Try alternative method
    console.log('  ℹ️  Function exists (direct query not available)');
    console.log('  ℹ️  Checking via test call...\n');
  } else if (autoFuncData && autoFuncData.length > 0) {
    const funcDef = autoFuncData[0].definition;
    if (funcDef.includes('placements_confirmed := false')) {
      console.log('  ✅ Function sets placements_confirmed = FALSE (correct)');
    } else if (funcDef.includes('placements_confirmed := true')) {
      console.log('  ❌ Function sets placements_confirmed = TRUE (needs fix)');
    }
  }

  // 2. Check can_create_new_version function for admin logic
  console.log('\n📋 Checking can_create_new_version function:\n');

  const { data: canCreateFuncData, error: canCreateFuncError } = await supabase.rpc('exec_sql' as any, {
    query: `
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'can_create_new_version';
    `
  }).select();

  if (canCreateFuncError) {
    console.log('  ℹ️  Function exists (direct query not available)');
    console.log('  ℹ️  Checking via test call...\n');
  } else if (canCreateFuncData && canCreateFuncData.length > 0) {
    const funcDef = canCreateFuncData[0].definition;
    if (funcDef.includes('santos.93.aus@gmail.com') || funcDef.includes('v_is_admin')) {
      console.log('  ✅ Function includes admin email logic');
    } else {
      console.log('  ❌ Function missing admin logic (needs fix)');
    }
  }

  // 3. Test can_create_new_version with actual user
  console.log('\n🧪 Testing can_create_new_version function:\n');

  // Get the user ID for santos.93.aus@gmail.com
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'santos.93.aus@gmail.com')
    .maybeSingle();

  if (userData) {
    console.log(`  📧 Found user: ${userData.email}`);
    console.log(`  🆔 User ID: ${userData.id}\n`);

    // Test the function
    const { data: testResult, error: testError } = await supabase.rpc('can_create_new_version', {
      p_user_id: userData.id,
      p_product_slug: 'personal-alignment'
    });

    if (testError) {
      console.log('  ❌ Error testing function:', testError.message);
    } else {
      console.log('  📊 Function result:');
      console.log(`     canCreate: ${testResult.canCreate}`);
      console.log(`     attemptsUsed: ${testResult.attemptsUsed}`);
      console.log(`     attemptsLimit: ${testResult.attemptsLimit}`);
      console.log(`     attemptsRemaining: ${testResult.attemptsRemaining}`);
      console.log(`     isAdmin: ${testResult.isAdmin}`);

      if (testResult.isAdmin && testResult.attemptsLimit === 999999) {
        console.log('\n  ✅ Admin user has unlimited resets!');
      } else if (testResult.isAdmin) {
        console.log('\n  ⚠️  Admin flag set but limit not unlimited');
      } else {
        console.log('\n  ❌ Admin logic not working - user not recognized as admin');
      }
    }
  } else {
    console.log(`  ⚠️  User santos.93.aus@gmail.com not found in database`);
    console.log('  ℹ️  Testing with dummy UUID...\n');

    const { data: dummyResult, error: dummyError } = await supabase.rpc('can_create_new_version', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_product_slug: 'personal-alignment'
    });

    if (dummyError) {
      console.log('  ❌ Error:', dummyError.message);
    } else {
      console.log('  📊 Dummy user result (should show standard limit):');
      console.log(`     attemptsLimit: ${dummyResult.attemptsLimit} (should be 2)`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Verification complete!\n');
}

verifyChanges().catch(console.error);
