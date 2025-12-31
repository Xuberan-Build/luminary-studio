#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixAllSessions() {
  console.log('🔧 Fixing all sessions with auto-copied placements\n');

  // Find all sessions at step 1 with placements but not confirmed
  // These should show the confirmation gate
  const { data: sessions, error } = await supabase
    .from('product_sessions')
    .update({
      placements_confirmed: false
    })
    .eq('current_step', 1)
    .not('placements', 'is', null)
    .select('id, product_slug, user_id');

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Updated ${sessions?.length || 0} sessions`);
  console.log('   Set placements_confirmed = false for all step 1 sessions with placements\n');

  if (sessions && sessions.length > 0) {
    console.log('📋 Updated sessions:');
    sessions.forEach(s => {
      console.log(`   • ${s.product_slug}`);
    });
  }

  console.log('\n✅ Fix complete - confirmation gates should now appear!');
}

fixAllSessions().catch(console.error);
