#!/usr/bin/env tsx

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

async function resetSession() {
  console.log(`\n🔄 Resetting Personal Alignment session for ${userEmail}\n`);
  console.log('='.repeat(60));

  // Get user
  const { data: authUser } = await supabase.auth.admin.listUsers();
  const user = authUser?.users.find(u => u.email === userEmail);

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log(`\n✅ User ID: ${user.id}`);

  // Get current session
  const { data: session } = await supabase
    .from('product_sessions')
    .select('id, current_step, placements_confirmed, placements')
    .eq('user_id', user.id)
    .eq('product_slug', productSlug)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    console.log('❌ No session found to reset');
    process.exit(1);
  }

  console.log(`\n📊 Current Session State:`);
  console.log(`Session ID: ${session.id}`);
  console.log(`Current Step: ${session.current_step}`);
  console.log(`Placements Confirmed: ${session.placements_confirmed}`);

  // Delete conversation history (old wizard responses)
  console.log(`\n🗑️  Deleting old conversation history...`);
  const { error: deleteError } = await supabase
    .from('conversations')
    .delete()
    .eq('session_id', session.id);

  if (deleteError) {
    console.error('⚠️  Warning - could not delete conversations:', deleteError.message);
  } else {
    console.log('✅ Conversation history deleted');
  }

  // Reset session to step 1 (keeping placements confirmed so confirmation gate shows)
  console.log(`\n♻️  Resetting session to Step 1...`);
  const { error: updateError } = await supabase
    .from('product_sessions')
    .update({
      current_step: 1,
      current_section: 1,
      // Keep placements and placements_confirmed true so user sees confirmation gate
    })
    .eq('id', session.id);

  if (updateError) {
    console.error('❌ Error updating session:', updateError.message);
    process.exit(1);
  }

  console.log('✅ Session reset to Step 1 - will show confirmation gate');
  console.log('\n📝 Next Steps:');
  console.log('1. Hard refresh your browser (Cmd+Shift+R / Ctrl+Shift+R)');
  console.log('2. Navigate to /products/personal-alignment/experience');
  console.log('3. The wizard should now use identity/values prompts instead of money/business');
  console.log('\n' + '='.repeat(60));
  console.log('');
}

resetSession();
