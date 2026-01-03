#!/usr/bin/env tsx
/**
 * Reset all product sessions to step 1 while preserving completions
 * Usage: npx tsx scripts/reset-sessions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetSessions() {
  console.log('\n🔄 Resetting all product sessions...\n');

  // Show current state
  const { data: beforeSessions, error: beforeError } = await supabase
    .from('product_sessions')
    .select('id, product_slug, current_step, placements_confirmed, completed_at, deliverable_content')
    .order('created_at', { ascending: false });

  if (beforeError) {
    console.error('❌ Error fetching sessions:', beforeError.message);
    process.exit(1);
  }

  console.log('📊 BEFORE:');
  beforeSessions?.forEach((s: any) => {
    console.log(`  ${s.product_slug}: step ${s.current_step}, confirmed: ${s.placements_confirmed}, complete: ${!!s.completed_at}`);
  });

  // Reset all sessions
  const { error: updateError } = await supabase
    .from('product_sessions')
    .update({
      current_step: 1,
      current_section: 1,
      placements_confirmed: false,
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

  if (updateError) {
    console.error('❌ Error updating sessions:', updateError.message);
    process.exit(1);
  }

  // Show updated state
  const { data: afterSessions, error: afterError } = await supabase
    .from('product_sessions')
    .select('id, product_slug, current_step, placements_confirmed, completed_at, deliverable_content')
    .order('created_at', { ascending: false });

  if (afterError) {
    console.error('❌ Error fetching updated sessions:', afterError.message);
    process.exit(1);
  }

  console.log('\n📊 AFTER:');
  afterSessions?.forEach((s: any) => {
    console.log(`  ${s.product_slug}: step ${s.current_step}, confirmed: ${s.placements_confirmed}, complete: ${!!s.completed_at}`);
  });

  console.log('\n✅ All sessions reset successfully!\n');
  console.log('Reset:');
  console.log('  - current_step → 1');
  console.log('  - current_section → 1');
  console.log('  - placements_confirmed → false');
  console.log('\nPreserved:');
  console.log('  - placements (auto-copied data)');
  console.log('  - deliverable_content');
  console.log('  - completed_at');
  console.log('\n🎯 Next time you click "Continue Experience" you will see the confirmation gate.\n');
}

resetSessions().catch(console.error);
