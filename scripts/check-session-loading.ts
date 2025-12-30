#!/usr/bin/env tsx

/**
 * Check Session Loading
 * Simulates how the experience page loads sessions
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

const productSlug = 'personal-alignment';
const userEmail = 'santos.93.aus@gmail.com';

async function checkSessionLoading() {
  console.log('\n🔍 Simulating Experience Page Session Load\n');
  console.log('='.repeat(60));

  // Get user
  const { data: authUser } = await supabase.auth.admin.listUsers();
  const user = authUser?.users.find(u => u.email === userEmail);

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log(`\n✅ User ID: ${user.id}`);
  console.log(`Email: ${userEmail}`);

  // Simulate the exact query from experience page (lines 51-58)
  console.log('\n📊 Query: Loading session (same as experience page)...\n');

  const { data: productSession, error } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_slug', productSlug)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error loading session:', error.message);
    console.log('\nThis means NO session exists, so page would create NEW session');
    console.log('New session would have: placements_confirmed: false, placements: null');
    return;
  }

  if (!productSession) {
    console.log('❌ No session found');
    console.log('Page would create new session with placements_confirmed: false');
    return;
  }

  console.log('✅ Session found:', productSession.id);
  console.log('\n--- Session Data ---');
  console.log('Current Step:', productSession.current_step);
  console.log('Placements Confirmed:', productSession.placements_confirmed);
  console.log('Version:', productSession.version);
  console.log('Is Latest Version:', productSession.is_latest_version);
  console.log('Created:', new Date(productSession.created_at).toLocaleString());

  // Simulate the placementsEmpty check (lines 86-99)
  const placementsEmpty = (pl: any) => {
    if (!pl) return true;
    const astro = pl.astrology || {};
    const hd = pl.human_design || {};
    const astroHas = Object.values(astro).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    );
    const hdHas = Object.values(hd).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    );
    const notesHas =
      pl.notes && typeof pl.notes === 'string' && pl.notes.trim().length > 0;
    return !(astroHas || hdHas || notesHas);
  };

  const isEmpty = placementsEmpty(productSession.placements);
  const needsConfirmation = !productSession.placements_confirmed || isEmpty;

  console.log('\n--- Validation Checks (Server-Side Logic) ---');
  console.log('Placements Empty:', isEmpty);
  console.log('Needs Confirmation:', needsConfirmation);

  if (needsConfirmation) {
    console.log('\n⚠️  SERVER WILL RESET SESSION TO STEP 1');
    console.log('Reason:', !productSession.placements_confirmed ? 'placements_confirmed is false' : 'placements data is empty');
    console.log('\nPage will UPDATE database to:');
    console.log('  - current_step: 1');
    console.log('  - placements_confirmed: false');
    console.log('  - Show upload page');
  } else {
    console.log('\n✅ SERVER SEES VALID PLACEMENTS');
    console.log('Session should proceed normally');
    console.log('Should NOT show upload page');
  }

  console.log('\n' + '='.repeat(60));
  console.log('');
}

checkSessionLoading();
