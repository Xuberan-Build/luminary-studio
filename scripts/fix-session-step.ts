#!/usr/bin/env tsx

/**
 * Fix Session Step
 * Forces a session to advance past the upload step
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

const productSlug = process.argv[2] || 'personal-alignment';
const userEmail = process.argv[3] || 'santos.93.aus@gmail.com';

async function fixSession() {
  console.log(`\n🔧 Fixing session for ${userEmail} - ${productSlug}\n`);

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  // Update session to step 2 with placements confirmed
  const { error } = await supabase
    .from('product_sessions')
    .update({
      current_step: 2,
      placements_confirmed: true,
      current_section: 1,
    })
    .eq('user_id', user.id)
    .eq('product_slug', productSlug);

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Session updated to Step 2');
  console.log('\nNow hard refresh the browser page (Cmd+Shift+R or Ctrl+Shift+R)');
  console.log('');
}

fixSession();
