#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('🔍 Verifying Database Changes');
  console.log('='.repeat(60) + '\n');

  // 1. Get admin user
  console.log('1️⃣  Finding admin user...\n');

  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.log('   ❌ Error fetching users:', authError.message);
    return;
  }

  const adminUser = authUser.users.find(u => u.email === 'santos.93.aus@gmail.com');

  if (!adminUser) {
    console.log('   ❌ Admin user not found\n');
    return;
  }

  console.log(`   ✅ Found: ${adminUser.email}`);
  console.log(`   🆔 ID: ${adminUser.id}\n`);

  // 2. Test can_create_new_version function
  console.log('2️⃣  Testing can_create_new_version function...\n');

  const { data: versionCheck, error: versionError } = await supabase.rpc('can_create_new_version', {
    p_user_id: adminUser.id,
    p_product_slug: 'personal-alignment'
  });

  if (versionError) {
    console.log('   ❌ Error:', versionError.message, '\n');
    return;
  }

  console.log('   📊 Result for santos.93.aus@gmail.com:');
  console.log(`      • canCreate: ${versionCheck.canCreate}`);
  console.log(`      • attemptsUsed: ${versionCheck.attemptsUsed}`);
  console.log(`      • attemptsLimit: ${versionCheck.attemptsLimit}`);
  console.log(`      • attemptsRemaining: ${versionCheck.attemptsRemaining}`);
  console.log(`      • isAdmin: ${versionCheck.isAdmin || 'not included'}\n`);

  if (versionCheck.canCreate && versionCheck.attemptsLimit >= 999999) {
    console.log('   ✅ UNLIMITED RESETS ENABLED\n');
  } else if (versionCheck.canCreate) {
    console.log('   ⚠️  Can create but limit is not unlimited\n');
  } else {
    console.log('   ❌ CANNOT CREATE - limit reached\n');
  }

  // 3. Check product_access for admin
  console.log('3️⃣  Checking product_access table...\n');

  const { data: accessData, error: accessError } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', adminUser.id)
    .limit(3);

  if (accessError) {
    console.log('   ❌ Error:', accessError.message, '\n');
  } else if (accessData && accessData.length > 0) {
    console.log('   📊 Product Access Records:\n');
    accessData.forEach(record => {
      console.log(`      ${record.product_slug}:`);
      console.log(`         • free_attempts_used: ${record.free_attempts_used}`);
      console.log(`         • free_attempts_limit: ${record.free_attempts_limit}`);
      console.log(`         • access_granted: ${record.access_granted}\n`);
    });
  } else {
    console.log('   ℹ️  No product access records found\n');
  }

  // 4. Check a product session for placements_confirmed
  console.log('4️⃣  Checking product_sessions...\n');

  const { data: sessionData, error: sessionError } = await supabase
    .from('product_sessions')
    .select('id, product_slug, current_step, placements_confirmed, placements')
    .eq('user_id', adminUser.id)
    .limit(2);

  if (sessionError) {
    console.log('   ❌ Error:', sessionError.message, '\n');
  } else if (sessionData && sessionData.length > 0) {
    console.log('   📊 Recent Sessions:\n');
    sessionData.forEach(session => {
      const hasPlacement = session.placements !== null;
      console.log(`      ${session.product_slug}:`);
      console.log(`         • current_step: ${session.current_step}`);
      console.log(`         • placements_confirmed: ${session.placements_confirmed}`);
      console.log(`         • has_placements: ${hasPlacement}\n`);

      if (hasPlacement && !session.placements_confirmed && session.current_step === 1) {
        console.log(`         ✅ Should show confirmation gate!\n`);
      }
    });
  } else {
    console.log('   ℹ️  No sessions found\n');
  }

  console.log('='.repeat(60));
  console.log('✅ Verification complete!\n');
}

verify().catch(console.error);
