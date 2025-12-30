#!/usr/bin/env tsx

/**
 * Recover Session Data
 * Shows conversation history and placements from reset sessions
 * Usage: npm run recover-session -- <session-id>
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

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('❌ Usage: npm run recover-session -- <session-id>');
  console.error('Example: npm run recover-session -- 578eab72-4d6e-4cd0-b5e5-ce11afdaf2ab');
  process.exit(1);
}

async function recoverSessionData() {
  console.log(`\n🔍 Recovering data for session: ${sessionId}\n`);
  console.log('='.repeat(60));

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    console.error('❌ Session not found');
    process.exit(1);
  }

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', session.user_id)
    .single();

  console.log('\n📋 SESSION INFO\n');
  console.log(`User: ${user?.email || 'Unknown'}`);
  console.log(`Product: ${session.product_slug}`);
  console.log(`Current Step: ${session.current_step}/${session.total_steps}`);
  console.log(`Completed: ${session.is_complete ? 'Yes' : 'No'}`);
  console.log(`Placements Confirmed: ${session.placements_confirmed ? 'Yes' : 'No'}`);
  console.log(`Created: ${new Date(session.created_at).toLocaleString()}`);

  // Check placements
  console.log('\n\n🎯 PLACEMENTS DATA\n');
  if (session.placements) {
    const astro = session.placements.astrology || {};
    const hd = session.placements.human_design || {};

    console.log('Astrology:');
    console.log(`  Sun: ${astro.sun || 'UNKNOWN'}`);
    console.log(`  Moon: ${astro.moon || 'UNKNOWN'}`);
    console.log(`  Rising: ${astro.rising || 'UNKNOWN'}`);
    console.log(`  Venus: ${astro.venus || 'UNKNOWN'}`);
    console.log(`  Mars: ${astro.mars || 'UNKNOWN'}`);

    console.log('\nHuman Design:');
    console.log(`  Type: ${hd.type || 'UNKNOWN'}`);
    console.log(`  Strategy: ${hd.strategy || 'UNKNOWN'}`);
    console.log(`  Authority: ${hd.authority || 'UNKNOWN'}`);
    console.log(`  Profile: ${hd.profile || 'UNKNOWN'}`);

    console.log('\n✅ Placements data is INTACT');
  } else {
    console.log('❌ No placements data found');
  }

  // Check conversations
  console.log('\n\n💬 CONVERSATION HISTORY\n');
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('step_number');

  if (conversations && conversations.length > 0) {
    console.log(`✅ Found ${conversations.length} conversation records\n`);

    for (const convo of conversations) {
      console.log(`\n--- Step ${convo.step_number} ---`);
      const messages = convo.messages || [];
      console.log(`Messages: ${messages.length}`);

      messages.slice(0, 3).forEach((msg: any, i: number) => {
        const content = msg.content?.substring(0, 100) || '';
        console.log(`  ${i + 1}. [${msg.role}]: ${content}...`);
      });

      if (messages.length > 3) {
        console.log(`  ... and ${messages.length - 3} more messages`);
      }
    }

    console.log('\n✅ Conversation history is INTACT');
  } else {
    console.log('❌ No conversation history found');
  }

  // Check deliverable
  console.log('\n\n📄 FINAL DELIVERABLE\n');
  if (session.deliverable_content) {
    console.log('✅ Deliverable exists!');
    console.log(`Generated: ${new Date(session.deliverable_generated_at).toLocaleString()}`);
    console.log(`Length: ${session.deliverable_content.length} characters`);
    console.log('\nPreview:');
    console.log(session.deliverable_content.substring(0, 200) + '...\n');
  } else {
    console.log('❌ Deliverable was deleted during reset');
  }

  // Recovery options
  console.log('\n' + '='.repeat(60));
  console.log('\n🔧 RECOVERY OPTIONS\n');

  if (session.placements && conversations && conversations.length > 0) {
    console.log('✅ Your data CAN be recovered!\n');
    console.log('Options:');
    console.log('1. Re-generate deliverable from existing conversations + placements');
    console.log('2. View full conversation history (all your answers are saved)');
    console.log('3. Export conversation history to file');
    console.log('\nRun: npm run regenerate-deliverable -- ' + sessionId);
  } else {
    console.log('⚠️  Limited recovery options - some data is missing');
  }

  console.log('\n');
}

recoverSessionData();
