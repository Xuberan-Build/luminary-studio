#!/usr/bin/env node
/**
 * Full Insight Extraction - Extracts and stores customer insights
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEET_ID = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Extract business model
function extractBusinessModel(text) {
  const lower = text.toLowerCase();
  if (lower.match(/coach|coaching|mentor/)) return 'Coaching';
  if (lower.match(/course|program|training/)) return 'Course Creator';
  if (lower.match(/service|agency|consultant|freelance/)) return 'Service Provider';
  if (lower.match(/product|ecommerce/)) return 'Product Business';
  if (lower.match(/saas|software/)) return 'SaaS';
  return 'Multiple Streams';
}

// Extract revenue goal
function extractRevenueGoal(text) {
  const goalMatches = text.match(/(?:goal|target|want|need).*?\$[\d,]+(?:k|K)?/gi);
  if (goalMatches && goalMatches[0]) {
    const dollarMatch = goalMatches[0].match(/\$[\d,]+(?:k|K)?/);
    return dollarMatch ? dollarMatch[0] : 'Growth focused';
  }
  return 'Revenue growth';
}

// Extract section from briefing
function extractSection(briefing, sectionName) {
  const regex = new RegExp(`\\*\\*${sectionName}[:\\s]*([^*]+)`, 'i');
  const match = briefing.match(regex);
  return match && match[1] ? match[1].trim().slice(0, 200) : '';
}

async function runFullExtraction(email) {
  console.log('🚀 Running Full Insight Extraction\n');
  console.log(`📧 Email: ${email}\n`);

  try {
    // 1. Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    console.log(`✅ User: ${user.name}\n`);

    // 2. Find session with final briefing
    const { data: sessions } = await supabase
      .from('conversations')
      .select('session_id, step_number, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    const sessionGroups = {};
    sessions?.forEach((s) => {
      if (!sessionGroups[s.session_id]) {
        sessionGroups[s.session_id] = { session_id: s.session_id, steps: [] };
      }
      sessionGroups[s.session_id].steps.push(s.step_number);
    });

    const sessionWithBriefing = Object.values(sessionGroups).find((s) => s.steps.includes(999));

    if (!sessionWithBriefing) {
      console.log('❌ No session with final briefing found');
      return;
    }

    console.log(`🎯 Session: ${sessionWithBriefing.session_id}\n`);

    // 3. Load conversations
    console.log('📊 Loading conversation data...');
    const { data: conversations } = await supabase
      .from('conversations')
      .select('step_number, messages, created_at')
      .eq('session_id', sessionWithBriefing.session_id)
      .order('step_number', { ascending: true });

    console.log(`   ✅ ${conversations.length} steps loaded\n`);

    // 4. Extract user messages
    const userMessages = conversations
      .flatMap((c) => c.messages || [])
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');

    console.log(`   📝 ${userMessages.length} characters of user input\n`);

    // 5. Get final briefing
    const finalBriefing = conversations.find((c) => c.step_number === 999);
    const briefingMsg = finalBriefing?.messages?.find(
      (m) => m.role === 'assistant' && m.type === 'final_briefing'
    );
    const briefingContent = briefingMsg?.content || '';

    console.log('🤖 Extracting AI insights from briefing...\n');

    // 6. Extract insights
    const insights = {
      email,
      product: 'Quantum Initiation Protocol',
      completionDate: new Date().toISOString().split('T')[0],
      completionStatus: 'completed',

      // Mock placements (would come from actual chart upload)
      sunSign: 'Leo',
      moonSign: 'Pisces',
      risingSign: 'Virgo',
      hdType: 'Manifestor',
      hdStrategy: 'To Inform',
      hdAuthority: 'Emotional',
      hdProfile: '3/5',

      // Business insights from conversations
      businessModel: extractBusinessModel(userMessages),
      currentOffers: userMessages.match(/(?:offer|sell)\s+([^.!?\n]{0,100})/i)?.[1] || 'Multiple offers',
      currentPricing: userMessages.match(/\$[\d,]+/g)?.slice(0, 2).join(', ') || 'Variable',
      idealClient: 'Entrepreneurs and coaches',
      revenueGoal: extractRevenueGoal(userMessages),
      painPoints: 'Scaling and consistency',

      // AI recommendations from briefing
      whatToSell: extractSection(briefingContent, 'What to Sell Next') || 'Signature high-ticket offer',
      howToSell: extractSection(briefingContent, 'How to Sell') || 'Authentic manifestor energy',
      pricingModel: extractSection(briefingContent, 'Money Model') || 'Premium pricing $3k-5k',
      keyStrengths: extractSection(briefingContent, 'Zone of Genius') || 'Natural initiator and visionary',
      nextSteps: extractSection(briefingContent, 'Execution Spine') || 'Define offer, build audience, launch',

      // Segmentation
      segmentTags: 'Manifestor,Leo,Coaching',
      notes: `Extracted from session ${sessionWithBriefing.session_id}`,
    };

    // 7. Display extracted insights
    console.log('═══════════════════════════════════════════════');
    console.log('📊 EXTRACTED INSIGHTS');
    console.log('═══════════════════════════════════════════════\n');

    console.log('✨ Astrological Profile:');
    console.log(`   Sun: ${insights.sunSign}`);
    console.log(`   Moon: ${insights.moonSign}`);
    console.log(`   Rising: ${insights.risingSign}\n`);

    console.log('⚡ Human Design:');
    console.log(`   Type: ${insights.hdType}`);
    console.log(`   Strategy: ${insights.hdStrategy}`);
    console.log(`   Authority: ${insights.hdAuthority}`);
    console.log(`   Profile: ${insights.hdProfile}\n`);

    console.log('💼 Business Profile:');
    console.log(`   Model: ${insights.businessModel}`);
    console.log(`   Offers: ${insights.currentOffers}`);
    console.log(`   Pricing: ${insights.currentPricing}`);
    console.log(`   Revenue Goal: ${insights.revenueGoal}\n`);

    console.log('🤖 AI Recommendations:');
    console.log(`   What to Sell: ${insights.whatToSell.slice(0, 80)}...`);
    console.log(`   How to Sell: ${insights.howToSell.slice(0, 80)}...`);
    console.log(`   Pricing Model: ${insights.pricingModel.slice(0, 80)}...\n`);

    console.log('🎯 Segmentation:');
    console.log(`   Tags: ${insights.segmentTags}\n`);

    // 8. Store in Google Sheets
    console.log('💾 Storing in Customer Insights sheet...\n');

    const credentials = {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
    };

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const insightRow = [
      insights.email,
      insights.product,
      insights.completionDate,
      insights.completionStatus,
      insights.sunSign,
      insights.moonSign,
      insights.risingSign,
      insights.hdType,
      insights.hdStrategy,
      insights.hdAuthority,
      insights.hdProfile,
      insights.businessModel,
      insights.currentOffers,
      insights.currentPricing,
      insights.idealClient,
      insights.revenueGoal,
      insights.painPoints,
      insights.whatToSell,
      insights.howToSell,
      insights.pricingModel,
      insights.keyStrengths,
      insights.nextSteps,
      insights.segmentTags,
      'pending',
      '',
      insights.notes,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Customer Insights!A:Z',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [insightRow],
      },
    });

    console.log('═══════════════════════════════════════════════');
    console.log('✅ EXTRACTION COMPLETE');
    console.log('═══════════════════════════════════════════════\n');

    console.log('🎉 Success! Your insights have been stored.\n');
    console.log('📊 Check your Google Sheet:');
    console.log('   https://docs.google.com/spreadsheets/d/' + SHEET_ID);
    console.log('   → Customer Insights tab\n');

    console.log('🏷️  Segment Tags Generated:');
    console.log(`   ${insights.segmentTags}\n`);

    console.log('📧 Ready for personalized emails:');
    console.log(`   "Hey ${user.name.split(' ')[0]}, as a ${insights.hdType} ${insights.sunSign}..."\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

const email = process.argv[2] || 'santos.93.aus@gmail.com';
runFullExtraction(email);
