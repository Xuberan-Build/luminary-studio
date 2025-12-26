#!/usr/bin/env node
/**
 * Inspect actual session data to see what we have
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function inspectSession(email) {
  console.log('🔍 Inspecting Session Data\n');

  // Get latest session
  const { data: sessions } = await supabase
    .from('conversations')
    .select('session_id, step_number, messages, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  const sessionGroups = {};
  sessions?.forEach((s) => {
    if (!sessionGroups[s.session_id]) {
      sessionGroups[s.session_id] = { session_id: s.session_id, conversations: [] };
    }
    sessionGroups[s.session_id].conversations.push(s);
  });

  const sessionId = Object.keys(sessionGroups)[0];
  const sessionData = sessionGroups[sessionId].conversations;

  console.log(`📋 Session: ${sessionId}\n`);

  // Show all steps
  sessionData.forEach((conv) => {
    console.log(`Step ${conv.step_number}:`);
    console.log(`  Messages: ${conv.messages?.length || 0}`);

    if (conv.messages && conv.messages.length > 0) {
      conv.messages.forEach((msg, i) => {
        const preview = (msg.content || '').slice(0, 100).replace(/\n/g, ' ');
        console.log(`  ${i + 1}. ${msg.role}: ${preview}${msg.content?.length > 100 ? '...' : ''}`);

        // Show any metadata
        if (msg.type) console.log(`     Type: ${msg.type}`);
        if (msg.placements) {
          console.log(`     📊 Placements found!`);
          console.log(`     Astro: ${JSON.stringify(msg.placements.astrology || {})}`);
          console.log(`     HD: ${JSON.stringify(msg.placements.human_design || {})}`);
        }
      });
    }
    console.log('');
  });

  // Look for any placements data stored elsewhere
  console.log('\n🔍 Searching for placements data...\n');

  // Check if there's a placements or chart_data column
  const { data: tables } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .limit(1)
    .single();

  console.log('Available columns:', Object.keys(tables || {}));
  console.log('\nFull record sample:', JSON.stringify(tables, null, 2));
}

inspectSession(process.argv[2] || 'santos.93.aus@gmail.com');
