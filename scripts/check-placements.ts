#!/usr/bin/env tsx

/**
 * Check Placements Across Products
 * Shows which sessions have placements data
 * Usage: npm run check-placements -- <user-email>
 */

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

const userEmail = process.argv[2] || 'santos.93.aus@gmail.com';

async function checkPlacements() {
  console.log(`\n🔍 Checking placements for: ${userEmail}\n`);
  console.log('='.repeat(60));

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', userEmail)
    .single();

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log(`\n✅ Found user: ${user.email}`);

  // Get all sessions for this user
  const { data: sessions } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('product_slug', { ascending: true })
    .order('version', { ascending: true });

  if (!sessions || sessions.length === 0) {
    console.log('\n❌ No sessions found for this user');
    return;
  }

  console.log(`\n📊 Found ${sessions.length} session(s):\n`);

  for (const session of sessions) {
    console.log(`\n--- ${session.product_slug} (v${session.version}) ---`);
    console.log(`Session ID: ${session.id}`);
    console.log(`Current Step: ${session.current_step}/${session.total_steps}`);
    console.log(`Placements Confirmed: ${session.placements_confirmed ? 'YES ✅' : 'NO ❌'}`);

    if (session.placements) {
      const astro = session.placements.astrology || {};
      const hd = session.placements.human_design || {};

      console.log('\n📊 Placements Data:');
      console.log('  Astrology:');
      console.log(`    Sun: ${astro.sun || 'MISSING'}`);
      console.log(`    Moon: ${astro.moon || 'MISSING'}`);
      console.log(`    Rising: ${astro.rising || 'MISSING'}`);
      console.log(`    Venus: ${astro.venus || 'MISSING'}`);
      console.log(`    Mars: ${astro.mars || 'MISSING'}`);

      console.log('  Human Design:');
      console.log(`    Type: ${hd.type || 'MISSING'}`);
      console.log(`    Strategy: ${hd.strategy || 'MISSING'}`);
      console.log(`    Authority: ${hd.authority || 'MISSING'}`);
      console.log(`    Profile: ${hd.profile || 'MISSING'}`);

      console.log('\n  ✅ Placements data EXISTS');
    } else {
      console.log('\n  ❌ NO placements data');
    }

    console.log(`\nIs Complete: ${session.is_complete ? 'YES' : 'NO'}`);
    console.log(`Latest Version: ${session.is_latest_version ? 'YES' : 'NO'}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Summary:\n');

  const withPlacements = sessions.filter(s => s.placements !== null);
  const withoutPlacements = sessions.filter(s => s.placements === null);

  console.log(`Sessions WITH placements: ${withPlacements.length}`);
  console.log(`Sessions WITHOUT placements: ${withoutPlacements.length}`);

  if (withoutPlacements.length > 0 && withPlacements.length > 0) {
    console.log('\n⚠️  Some sessions are missing placements!');
    console.log('The auto-copy trigger should have copied them.');
    console.log('This might indicate a trigger issue.\n');
  } else if (withPlacements.length > 0) {
    console.log('\n✅ All sessions have placements data!\n');
  }
}

checkPlacements();
