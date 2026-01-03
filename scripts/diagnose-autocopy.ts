import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try multiple .env files in order
const envFiles = ['.env.production.local', '.env.local', '.env'];
for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    console.log(`📝 Loaded environment from ${file}\n`);
    break;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function diagnoseAutoCopy() {
  const testEmail = 'santos.93.aus@gmail.com';
  const targetSessionId = '056d826e-69a8-40f1-9ce3-19982e2bc45f';

  console.log(`🔍 DIAGNOSING AUTO-COPY ISSUE`);
  console.log(`Email: ${testEmail}`);
  console.log(`Target Session: ${targetSessionId}\n`);

  // Get user
  const { data: authData } = await supabase.auth.admin.listUsers();
  const user = authData.users.find(u => u.email === testEmail);

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  const userId = user.id;
  console.log(`✓ User ID: ${userId}\n`);

  // Get target session
  console.log(`📊 TARGET SESSION (Personal Alignment):`);
  const { data: targetSession } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('id', targetSessionId)
    .single();

  if (!targetSession) {
    console.log('❌ Target session not found');
    return;
  }

  console.log(`  Product: ${targetSession.product_slug}`);
  console.log(`  Current Step: ${targetSession.current_step}`);
  console.log(`  Placements Confirmed: ${targetSession.placements_confirmed}`);
  console.log(`  Has Placements: ${!!targetSession.placements}`);
  console.log(`  Created: ${new Date(targetSession.created_at).toLocaleString()}`);

  if (targetSession.placements) {
    const astro = targetSession.placements.astrology || {};
    const hd = targetSession.placements.human_design || {};
    console.log(`  Placements Data:`);
    console.log(`    Sun: ${astro.sun || 'UNKNOWN'}`);
    console.log(`    Moon: ${astro.moon || 'UNKNOWN'}`);
    console.log(`    Rising: ${astro.rising || 'UNKNOWN'}`);
    console.log(`    HD Type: ${hd.type || 'UNKNOWN'}`);
  } else {
    console.log(`  Placements: NULL`);
  }

  // Find source session for auto-copy
  console.log(`\n🔎 SEARCHING FOR SOURCE SESSION TO COPY FROM:`);
  console.log(`  Looking for sessions with:`);
  console.log(`    - user_id = ${userId}`);
  console.log(`    - placements_confirmed = true`);
  console.log(`    - placements IS NOT NULL`);
  console.log(`    - id != ${targetSessionId}`);
  console.log(`    - ordered by created_at DESC\n`);

  const { data: sourceSession, error: sourceError } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('placements_confirmed', true)
    .not('placements', 'is', null)
    .neq('id', targetSessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sourceError) {
    console.log(`❌ Error querying for source session:`, sourceError);
    return;
  }

  if (!sourceSession) {
    console.log(`❌ NO SOURCE SESSION FOUND`);
    console.log(`\nReason: No other sessions with confirmed placements exist.`);
    console.log(`This means auto-copy can't work.\n`);

    // Show all sessions to understand why
    console.log(`📋 ALL SESSIONS FOR THIS USER:`);
    const { data: allSessions } = await supabase
      .from('product_sessions')
      .select('id, product_slug, placements_confirmed, placements, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allSessions) {
      allSessions.forEach((s, idx) => {
        console.log(`\n  Session ${idx + 1}:`);
        console.log(`    ID: ${s.id.substring(0, 8)}...`);
        console.log(`    Product: ${s.product_slug}`);
        console.log(`    Confirmed: ${s.placements_confirmed}`);
        console.log(`    Has Placements: ${!!s.placements}`);
        console.log(`    Created: ${new Date(s.created_at).toLocaleString()}`);
      });
    }

    return;
  }

  console.log(`✅ SOURCE SESSION FOUND:`);
  console.log(`  ID: ${sourceSession.id}`);
  console.log(`  Product: ${sourceSession.product_slug}`);
  console.log(`  Placements Confirmed: ${sourceSession.placements_confirmed}`);
  console.log(`  Created: ${new Date(sourceSession.created_at).toLocaleString()}`);

  if (sourceSession.placements) {
    const astro = sourceSession.placements.astrology || {};
    const hd = sourceSession.placements.human_design || {};
    console.log(`  Placements Data:`);
    console.log(`    Sun: ${astro.sun || 'UNKNOWN'}`);
    console.log(`    Moon: ${astro.moon || 'UNKNOWN'}`);
    console.log(`    Rising: ${astro.rising || 'UNKNOWN'}`);
    console.log(`    HD Type: ${hd.type || 'UNKNOWN'}`);
    console.log(`    HD Strategy: ${hd.strategy || 'UNKNOWN'}`);
  }

  console.log(`\n🔧 AUTO-COPY SHOULD WORK:`);
  console.log(`  Source has placements: YES`);
  console.log(`  Source is confirmed: YES`);
  console.log(`  Target needs placements: ${!targetSession.placements ? 'YES' : 'NO'}`);

  if (!targetSession.placements) {
    console.log(`\n💡 SOLUTION: Auto-copy SHOULD have copied placements from ${sourceSession.product_slug} to ${targetSession.product_slug}`);
    console.log(`   But target session still has NO placements.`);
    console.log(`\n   This means either:`);
    console.log(`   1. The server-side auto-copy code didn't run`);
    console.log(`   2. The update query failed silently`);
    console.log(`   3. The placements were copied then erased\n`);
  } else {
    console.log(`\n✅ Target session HAS placements (auto-copy may have worked)`);
  }
}

diagnoseAutoCopy().catch(console.error);
