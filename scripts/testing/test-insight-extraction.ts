/**
 * Test Insight Extraction
 * Extracts customer insights from a Supabase session and stores them
 *
 * Usage: npx ts-node test-insight-extraction.ts <email>
 */

import { config } from 'dotenv';
config({ path: '.env.production' });

import { supabaseAdmin } from './src/lib/supabase/server';
import { extractCustomerInsights } from './src/lib/ai/insight-extractor';
import { storeCustomerInsights } from './src/lib/google-sheets/customer-sync';

async function testInsightExtraction(email: string) {
  console.log('🔍 Testing Insight Extraction System\n');
  console.log(`📧 Email: ${email}\n`);

  try {
    // Step 1: Find user sessions
    console.log('1️⃣ Finding user sessions...');

    // Try to find sessions linked to this email
    // First, check if there's a user_sessions table or similar
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('   ❌ Error finding user:', userError.message);
    }

    if (user) {
      console.log(`   ✅ Found user: ${user.name} (${user.email})`);
    } else {
      console.log(`   ⚠️  No user found with email: ${email}`);
      console.log('   Searching for sessions by email...\n');
    }

    // Look for conversation sessions that might be linked to this email
    // (sessions might be stored differently)
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('conversations')
      .select('session_id, created_at')
      .limit(10)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('   ❌ Error finding sessions:', sessionsError.message);
      return;
    }

    console.log(`   📊 Found ${sessions?.length || 0} recent sessions\n`);

    if (!sessions || sessions.length === 0) {
      console.log('   ℹ️  No sessions found. Create a session first by:');
      console.log('      1. Purchase the product');
      console.log('      2. Complete the interactive experience');
      console.log('      3. Generate the final blueprint\n');
      return;
    }

    // For testing, use the most recent session
    const testSession = sessions[0];
    console.log(`   🎯 Using session: ${testSession.session_id}`);
    console.log(`   📅 Created: ${testSession.created_at}\n`);

    // Step 2: Check what data exists for this session
    console.log('2️⃣ Checking session data...');

    const { data: conversationData, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('step_number, messages, created_at')
      .eq('session_id', testSession.session_id)
      .order('step_number', { ascending: true });

    if (convError) {
      console.error('   ❌ Error loading conversations:', convError.message);
      return;
    }

    console.log(`   ✅ Found ${conversationData?.length || 0} conversation steps`);

    // Show which steps exist
    const steps = conversationData?.map((c: any) => c.step_number).sort((a: number, b: number) => a - b);
    console.log(`   📋 Steps: ${steps?.join(', ')}`);

    // Check for final briefing (step 999)
    const hasFinalBriefing = steps?.includes(999);
    console.log(`   ${hasFinalBriefing ? '✅' : '⚠️ '} Final briefing: ${hasFinalBriefing ? 'Present' : 'Missing'}\n`);

    if (!hasFinalBriefing) {
      console.log('   ℹ️  No final briefing found. The session may not be complete.');
      console.log('   To generate a final briefing, complete the product experience.\n');
    }

    // Step 3: Extract insights (using mock placements for now)
    console.log('3️⃣ Extracting insights...\n');

    // Mock placements data (you would get this from the session or user input)
    const mockPlacements = {
      astrology: {
        sun: 'Leo',
        moon: 'Pisces',
        rising: 'Virgo',
      },
      human_design: {
        type: 'Manifestor',
        strategy: 'To Inform',
        authority: 'Emotional',
        profile: '3/5',
      },
      notes: 'Test extraction',
    };

    const insights = await extractCustomerInsights({
      sessionId: testSession.session_id,
      email: email,
      product: 'Quantum Initiation Protocol',
      placements: mockPlacements,
    });

    console.log('\n📊 Extracted Insights:');
    console.log('─────────────────────────────────────────');
    console.log(`   Sun Sign: ${insights.sunSign || 'N/A'}`);
    console.log(`   Moon Sign: ${insights.moonSign || 'N/A'}`);
    console.log(`   Rising Sign: ${insights.risingSign || 'N/A'}`);
    console.log(`   HD Type: ${insights.hdType || 'N/A'}`);
    console.log(`   HD Strategy: ${insights.hdStrategy || 'N/A'}`);
    console.log(`   Business Model: ${insights.businessModel || 'N/A'}`);
    console.log(`   Current Offers: ${insights.currentOffers || 'N/A'}`);
    console.log(`   Revenue Goal: ${insights.revenueGoal || 'N/A'}`);
    console.log(`   Segment Tags: ${insights.segmentTags || 'N/A'}\n`);

    if (insights.whatToSell) {
      console.log(`   💡 What to Sell: ${insights.whatToSell.slice(0, 100)}...`);
    }
    if (insights.howToSell) {
      console.log(`   📢 How to Sell: ${insights.howToSell.slice(0, 100)}...`);
    }
    console.log('');

    // Step 4: Store insights
    console.log('4️⃣ Storing insights in Google Sheets...\n');

    await storeCustomerInsights(insights);

    console.log('═══════════════════════════════════════════════');
    console.log('✅ INSIGHT EXTRACTION COMPLETE');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('📊 Check your Google Sheet:');
    console.log('   - Customer Insights tab');
    console.log(`   - Look for: ${email}\n`);
    console.log('🎯 Segment Tags Generated:');
    console.log(`   ${insights.segmentTags}\n`);
    console.log('🚀 Ready for personalized email sequences!');

  } catch (error: any) {
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
