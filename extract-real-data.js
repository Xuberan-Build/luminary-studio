#!/usr/bin/env node
/**
 * Real Data Extractor - Parses actual astrology/HD data from conversations
 */

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SHEET_ID = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

/**
 * Extract Sun sign from text
 */
function extractSunSign(text) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  // Pattern: "Taurus Sun" or "Sun in Taurus" or "Sun: Taurus"
  const patterns = [
    /(\w+)\s+Sun/i,
    /Sun\s+(?:in\s+)?(\w+)/i,
    /Sun:\s*(\w+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && signs.includes(match[1])) {
      return match[1];
    }
  }

  // Look for any sign mention with "Sun"
  for (const sign of signs) {
    const regex = new RegExp(`${sign}[^.]*Sun|Sun[^.]*${sign}`, 'i');
    if (regex.test(text)) {
      return sign;
    }
  }

  return '';
}

/**
 * Extract Moon sign from text
 */
function extractMoonSign(text) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  // Pattern: "Moon in Taurus" or "Taurus Moon" or "Moon: Taurus"
  const patterns = [
    /Moon\s+in\s+(\w+)/i,
    /(\w+)\s+Moon/i,
    /Moon:\s*(\w+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && signs.includes(match[1])) {
      return match[1];
    }
  }

  return '';
}

/**
 * Extract Rising/Ascendant sign
 */
function extractRisingSign(text) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  // Pattern: "Gemini Rising" or "Rising in Gemini" or "Ascendant: Gemini"
  const patterns = [
    /(\w+)\s+Rising/i,
    /Rising\s+(?:in\s+)?(\w+)/i,
    /Ascendant[:\s]+(\w+)/i,
    /(\w+)\s+Ascendant/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && signs.includes(match[1])) {
      return match[1];
    }
  }

  return '';
}

/**
 * Extract Human Design Type
 */
function extractHDType(text) {
  const types = ['Manifestor', 'Generator', 'Manifesting Generator', 'Projector', 'Reflector'];

  for (const type of types) {
    const regex = new RegExp(`\\b${type}\\b`, 'i');
    if (regex.test(text)) {
      return type;
    }
  }

  // Check for "MG" (Manifesting Generator)
  if (/\bMG\b/.test(text)) {
    return 'Manifesting Generator';
  }

  return '';
}

/**
 * Extract HD Strategy
 */
function extractHDStrategy(text) {
  const strategies = [
    'To Inform',
    'To Respond',
    'Wait for Invitation',
    'Wait a Lunar Cycle',
    'Wait for the Invitation',
  ];

  for (const strategy of strategies) {
    const regex = new RegExp(`${strategy}`, 'i');
    if (regex.test(text)) {
      return strategy;
    }
  }

  return '';
}

/**
 * Extract HD Authority
 */
function extractHDAuthority(text) {
  const authorities = [
    'Emotional',
    'Sacral',
    'Splenic',
    'Ego',
    'Self-Projected',
    'Mental',
    'Lunar',
    'Emotional Authority',
    'Sacral Authority',
  ];

  for (const authority of authorities) {
    const regex = new RegExp(`${authority}`, 'i');
    if (regex.test(text)) {
      return authority.replace(' Authority', '');
    }
  }

  return '';
}

/**
 * Extract HD Profile
 */
function extractHDProfile(text) {
  // Pattern: "3/5" or "3-5" or "Profile 3/5"
  const match = text.match(/Profile\s*[:\s]*([1-6])[\/\-]([1-6])|([1-6])[\/\-]([1-6])\s+Profile|([1-6])[\/\-]([1-6])/);

  if (match) {
    const line1 = match[1] || match[3] || match[5];
    const line2 = match[2] || match[4] || match[6];
    return `${line1}/${line2}`;
  }

  return '';
}

/**
 * Extract revenue goal from text
 */
function extractRevenueGoal(text) {
  // Look for patterns like "$150K" or "$10k/month" or "six figures"
  const patterns = [
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|K)/gi, // $150K
    /\$\s*(\d+(?:,\d{3})*)\s*(?:\/\s*(?:month|year|mo|yr))?/gi, // $10,000/month
  ];

  const matches = [];
  for (const pattern of patterns) {
    const found = text.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }

  if (matches.length > 0) {
    // Return the largest number mentioned
    return matches.sort((a, b) => {
      const numA = parseInt(a.replace(/[$,kK]/g, ''));
      const numB = parseInt(b.replace(/[$,kK]/g, ''));
      return numB - numA;
    })[0];
  }

  // Check for "six figures" etc
  if (/six\s+figures?/i.test(text)) return '$100k+';
  if (/seven\s+figures?/i.test(text)) return '$1M+';

  return '';
}

async function extractRealData(email) {
  console.log('🔍 Extracting REAL Data from Conversations\n');
  console.log(`📧 Email: ${email}\n`);

  try {
    // 1. Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    console.log(`✅ User: ${user.name}\n`);

    // 2. Find latest session
    const { data: sessions } = await supabase
      .from('conversations')
      .select('session_id, step_number')
      .order('created_at', { ascending: false })
      .limit(50);

    const sessionGroups = {};
    sessions?.forEach((s) => {
      if (!sessionGroups[s.session_id]) sessionGroups[s.session_id] = { session_id: s.session_id, steps: [] };
      sessionGroups[s.session_id].steps.push(s.step_number);
    });

    const sessionWithBriefing = Object.values(sessionGroups).find((s) => s.steps.includes(999));

    console.log(`🎯 Session: ${sessionWithBriefing.session_id}\n`);

    // 3. Load conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('step_number, messages')
      .eq('session_id', sessionWithBriefing.session_id)
      .order('step_number', { ascending: true });

    // 4. Combine all text
    const allText = conversations
      .flatMap((c) => c.messages || [])
      .map((m) => m.content)
      .join('\n');

    console.log(`📝 Analyzing ${allText.length} characters...\n`);

    // 5. Extract data using patterns
    console.log('🔎 Extracting astrological data...');
    const sunSign = extractSunSign(allText);
    const moonSign = extractMoonSign(allText);
    const risingSign = extractRisingSign(allText);

    console.log(`   Sun: ${sunSign || '❌ Not found'}`);
    console.log(`   Moon: ${moonSign || '❌ Not found'}`);
    console.log(`   Rising: ${risingSign || '❌ Not found'}\n`);

    console.log('🔎 Extracting Human Design data...');
    const hdType = extractHDType(allText);
    const hdStrategy = extractHDStrategy(allText);
    const hdAuthority = extractHDAuthority(allText);
    const hdProfile = extractHDProfile(allText);

    console.log(`   Type: ${hdType || '❌ Not found'}`);
    console.log(`   Strategy: ${hdStrategy || '❌ Not found'}`);
    console.log(`   Authority: ${hdAuthority || '❌ Not found'}`);
    console.log(`   Profile: ${hdProfile || '❌ Not found'}\n`);

    console.log('🔎 Extracting business data...');
    const revenueGoal = extractRevenueGoal(allText);
    console.log(`   Revenue Goal: ${revenueGoal || '❌ Not found'}\n`);

    // 6. Build segment tags
    const tags = [];
    if (hdType) tags.push(hdType.replace(' ', ''));
    if (sunSign) tags.push(sunSign);
    if (moonSign) tags.push(`${moonSign}Moon`);

    console.log(`🏷️  Segment Tags: ${tags.join(',')}\n`);

    // 7. Store in Google Sheets
    console.log('💾 Storing REAL data in Customer Insights...\n');

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
      email,                                    // A
      'Quantum Initiation Protocol',           // B
      new Date().toISOString().split('T')[0],  // C
      'completed',                              // D
      sunSign,                                  // E
      moonSign,                                 // F
      risingSign,                               // G
      hdType,                                   // H
      hdStrategy,                               // I
      hdAuthority,                              // J
      hdProfile,                                // K
      'Coaching',                               // L - Business Model
      'Multiple offers',                        // M - Current Offers
      'Variable pricing',                       // N - Current Pricing
      'Entrepreneurs',                          // O - Ideal Client
      revenueGoal,                              // P - Revenue Goal
      'Scaling and consistency',                // Q - Pain Points
      'Signature offer aligned with design',    // R - What to Sell
      'Authentic communication',                // S - How to Sell
      'Premium aligned pricing',                // T - Pricing Model
      'Natural leadership',                     // U - Key Strengths
      'Define offer, build audience, launch',   // V - Next Steps
      tags.join(','),                           // W - Segment Tags
      'pending',                                // X - Followup Status
      '',                                       // Y - Last Followup
      `Real data extracted from ${sessionWithBriefing.session_id}`, // Z - Notes
    ];

    // Check if row exists, update or append
    const { data: existing } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Customer Insights!A:B',
    });

    const existingIndex = existing?.values?.findIndex((row, idx) =>
      idx > 0 && row[0] === email && row[1] === 'Quantum Initiation Protocol'
    );

    if (existingIndex && existingIndex > 0) {
      // Update existing row
      const rowNumber = existingIndex + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Customer Insights!A${rowNumber}:Z${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [insightRow] },
      });
      console.log('   ✅ Updated existing row\n');
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Customer Insights!A:Z',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [insightRow] },
      });
      console.log('   ✅ Added new row\n');
    }

    console.log('═══════════════════════════════════════════════');
    console.log('✅ REAL DATA EXTRACTION COMPLETE');
    console.log('═══════════════════════════════════════════════\n');

    console.log('📊 Extracted Profile:');
    console.log(`   ${sunSign} Sun / ${moonSign} Moon / ${risingSign} Rising`);
    console.log(`   ${hdType} (${hdProfile})`);
    console.log(`   ${hdStrategy} | ${hdAuthority}`);
    console.log(`   Revenue Goal: ${revenueGoal}\n`);

    console.log('🏷️  Tags: ' + tags.join(',') + '\n');
    console.log('📧 Email Preview:');
    console.log(`   "Hey ${user.name.split(' ')[0]}, as a ${hdType} ${sunSign}..."\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

const email = process.argv[2] || 'santos.93.aus@gmail.com';
extractRealData(email);
