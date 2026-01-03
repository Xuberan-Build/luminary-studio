#!/usr/bin/env tsx
/**
 * Export session data for testing/documentation
 * Usage: npx tsx scripts/export-session-data.ts <session-id>
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportSessionData(sessionId: string) {
  console.log(`\n🔍 Fetching session data for: ${sessionId}\n`);

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    console.error('❌ Session not found:', sessionError?.message);
    process.exit(1);
  }

  // Fetch conversations
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('step_number', { ascending: true });

  if (convError) {
    console.error('⚠️  Warning: Could not fetch conversations:', convError.message);
  }

  // Format output
  const output = {
    session: {
      id: session.id,
      product_slug: session.product_slug,
      current_step: session.current_step,
      total_steps: session.total_steps,
      is_complete: session.is_complete,
      completed_at: session.completed_at,
      placements: session.placements,
      placements_confirmed: session.placements_confirmed,
    },
    deliverable: session.deliverable_content,
    conversations: conversations?.map(conv => ({
      step_number: conv.step_number,
      messages: conv.messages,
    })) || [],
  };

  // Save to file
  const filename = `session-export-${session.product_slug}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));

  console.log(`✅ Session data exported to: ${filename}\n`);
  console.log(`📊 Summary:`);
  console.log(`   Product: ${session.product_slug}`);
  console.log(`   Steps completed: ${session.current_step}/${session.total_steps}`);
  console.log(`   Deliverable: ${session.deliverable_content ? 'Yes' : 'No'}`);
  console.log(`   Conversations: ${conversations?.length || 0} steps\n`);

  // Also create a markdown version of the deliverable
  if (session.deliverable_content) {
    const mdFilename = `deliverable-${session.product_slug}-${Date.now()}.md`;
    fs.writeFileSync(mdFilename, session.deliverable_content);
    console.log(`📄 Deliverable saved to: ${mdFilename}\n`);
  }
}

// Get session ID from command line
const sessionId = process.argv[2];

if (!sessionId) {
  console.error('❌ Usage: npx tsx scripts/export-session-data.ts <session-id>');
  console.log('\n💡 To find your session ID:');
  console.log('   1. Go to your dashboard');
  console.log('   2. Click on a completed product');
  console.log('   3. Copy the session ID from the URL\n');
  process.exit(1);
}

exportSessionData(sessionId).catch(console.error);
