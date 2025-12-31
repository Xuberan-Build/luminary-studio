#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetAllIncompleteSessions() {
  console.log('🔄 Resetting ALL incomplete sessions to show confirmation gate\n');

  // Reset ALL incomplete sessions (not completed) back to step 1
  // with placements_confirmed = false
  const { data: sessions, error } = await supabase
    .from('product_sessions')
    .update({
      current_step: 1,
      current_section: 1,
      placements_confirmed: false
    })
    .eq('is_complete', false)
    .not('placements', 'is', null)
    .select('id, product_slug, current_step, placements_confirmed');

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Reset ${sessions?.length || 0} incomplete sessions\n`);

  if (sessions && sessions.length > 0) {
    console.log('📋 Reset sessions:');
    const grouped = sessions.reduce((acc, s) => {
      acc[s.product_slug] = (acc[s.product_slug] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(grouped).forEach(([slug, count]) => {
      console.log(`   • ${slug}: ${count} session(s)`);
    });
  }

  console.log('\n✅ All incomplete sessions reset to step 1');
  console.log('✅ Confirmation gates will now show on next visit!');
}

resetAllIncompleteSessions().catch(console.error);
