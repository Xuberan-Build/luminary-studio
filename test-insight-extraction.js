#!/usr/bin/env node
/**
 * Test Insight Extraction
 * Extracts customer insights from a Supabase session and stores them
 *
 * Usage: node test-insight-extraction.js <email>
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.production');
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testInsightExtraction(email) {
  console.log('🔍 Testing Insight Extraction System\n');
  console.log(`📧 Email: ${email}\n`);

  try {
    // Step 1: Find user
    console.log('1️⃣ Finding user...');

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('   ❌ Error finding user:', userError.message);
    }

    if (user) {
      console.log(`   ✅ Found user: ${user.name} (${user.email})`);
      console.log(`   👤 User ID: ${user.id}\n`);
    } else {
      console.log(`   ⚠️  No user found with email: ${email}\n`);
    }

    // Step 2: Find product access
    console.log('2️⃣ Checking product access...');

    const { data: access, error: accessError } = await supabase
      .from('product_access')
      .select('*')
      .eq('user_id', user?.id)
      .eq('product_slug', 'quantum-initiation')
      .maybeSingle();

    if (accessError) {
      console.error('   ❌ Error checking access:', accessError.message);
    }

    if (access) {
      console.log('   ✅ Has product access');
      console.log(`   📅 Purchased: ${access.purchase_date}`);
      console.log(`   💰 Amount: $${access.amount_paid}\n`);
    } else {
      console.log('   ⚠️  No product access found');
      console.log('   User needs to purchase first\n');
    }

    // Step 3: Find sessions
    console.log('3️⃣ Finding conversation sessions...');

    const { data: sessions, error: sessionsError } = await supabase
      .from('conversations')
      .select('session_id, step_number, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (sessionsError) {
      console.error('   ❌ Error finding sessions:', sessionsError.message);
      return;
    }

    // Group by session_id
    const sessionGroups = {};
    sessions?.forEach((s) => {
      if (!sessionGroups[s.session_id]) {
        sessionGroups[s.session_id] = {
          session_id: s.session_id,
          created_at: s.created_at,
          steps: [],
        };
      }
      sessionGroups[s.session_id].steps.push(s.step_number);
    });

    const uniqueSessions = Object.values(sessionGroups)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    console.log(`   📊 Found ${uniqueSessions.length} recent sessions:\n`);

    uniqueSessions.forEach((s, i) => {
      const hasFinalBriefing = s.steps.includes(999);
      console.log(`   ${i + 1}. Session: ${s.session_id.slice(0, 8)}...`);
      console.log(`      Created: ${s.created_at}`);
      console.log(`      Steps: ${s.steps.sort((a, b) => a - b).join(', ')}`);
      console.log(`      Final Briefing: ${hasFinalBriefing ? '✅ Yes' : '❌ No'}\n`);
    });

    if (uniqueSessions.length === 0) {
      console.log('   ℹ️  No sessions found. User needs to:');
      console.log('      1. Purchase the product');
      console.log('      2. Complete the interactive experience\n');
      return;
    }

    // Use the most recent session with a final briefing
    const testSession = uniqueSessions.find((s) => s.steps.includes(999)) || uniqueSessions[0];

    console.log(`   🎯 Using session: ${testSession.session_id}`);
    console.log(`   📅 Created: ${testSession.created_at}\n`);

    // Step 4: Load conversation data
    console.log('4️⃣ Loading conversation data...');

    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('step_number, messages, created_at')
      .eq('session_id', testSession.session_id)
      .order('step_number', { ascending: true });

    if (convError) {
      console.error('   ❌ Error loading conversations:', convError.message);
      return;
    }

    console.log(`   ✅ Loaded ${conversations.length} conversation steps`);

    // Show message counts
    const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
    console.log(`   💬 Total messages: ${totalMessages}\n`);

    // Step 5: Extract sample insights
    console.log('5️⃣ Extracting insights from conversations...\n');

    // Get all user messages
    const userMessages = conversations
      .flatMap((c) => c.messages || [])
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');

    console.log(`   📝 User messages length: ${userMessages.length} characters`);

    // Simple extraction examples
    const hasMoneyGoal = /\$[\d,]+(?:k|K)?/.test(userMessages);
    const hasCoaching = /coach|coaching/i.test(userMessages);
    const hasService = /service|agency|freelance/i.test(userMessages);

    console.log(`   💰 Mentions money goal: ${hasMoneyGoal ? '✅' : '❌'}`);
    console.log(`   👥 Mentions coaching: ${hasCoaching ? '✅' : '❌'}`);
    console.log(`   🛠️  Mentions services: ${hasService ? '✅' : '❌'}\n`);

    // Check for final briefing
    const finalBriefing = conversations.find((c) => c.step_number === 999);
    if (finalBriefing) {
      const briefingMsg = finalBriefing.messages?.find(
        (m) => m.role === 'assistant' && m.type === 'final_briefing'
      );
      if (briefingMsg) {
        console.log('   ✅ Final briefing found');
        console.log(`   📄 Length: ${briefingMsg.content?.length || 0} characters`);
        console.log(`   📋 Preview: ${briefingMsg.content?.slice(0, 100)}...\n`);
      }
    }

    console.log('═══════════════════════════════════════════════');
    console.log('✅ DATA EXTRACTION TEST COMPLETE');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Email: ${email}`);
    console.log(`   User Found: ${user ? 'Yes' : 'No'}`);
    console.log(`   Product Access: ${access ? 'Yes' : 'No'}`);
    console.log(`   Sessions Found: ${uniqueSessions.length}`);
    console.log(`   Test Session: ${testSession.session_id}`);
    console.log(`   Conversation Steps: ${conversations.length}`);
    console.log(`   Total Messages: ${totalMessages}`);
    console.log('');
    console.log('🚀 Next: Run the full insight extractor to parse and store data');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

// Get email from command line or use default
const testEmail = process.argv[2] || 'austin@xuberandigital.com';

testInsightExtraction(testEmail).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
