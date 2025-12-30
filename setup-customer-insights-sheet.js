#!/usr/bin/env node
/**
 * Create Customer Insights Sheet
 * Stores rich data extracted from GPT product experiences for segmentation
 */

require('dotenv').config({ path: '.env.production' });
const { google } = require('googleapis');

const SHEET_ID = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

async function setupCustomerInsightsSheet() {
  console.log('🔮 Setting up Customer Insights Sheet...\n');

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

  // Check if sheet exists
  console.log('1️⃣ Checking if Customer Insights sheet exists...');

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const existingSheets = spreadsheet.data.sheets || [];
  const insightsSheet = existingSheets.find(s => s.properties?.title === 'Customer Insights');

  if (insightsSheet) {
    console.log('   ⚠️  Customer Insights sheet already exists');
    console.log('   Updating headers...\n');
  } else {
    console.log('   ✅ Creating new sheet...\n');

    // Create new sheet
    console.log('2️⃣ Creating Customer Insights sheet...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Customer Insights',
              gridProperties: {
                rowCount: 1000,
                columnCount: 26,
                frozenRowCount: 1,
              },
              tabColor: {
                red: 0.6,
                green: 0.4,
                blue: 0.8,
              },
            },
          },
        }],
      },
    });
    console.log('   ✅ Sheet created\n');
  }

  // Set up headers
  console.log('3️⃣ Setting up column headers...');

  const headers = [
    // Core Info
    'Email',                    // A - Primary key
    'Product',                  // B
    'Completion Date',          // C
    'Completion Status',        // D - started/completed

    // Astrological Profile
    'Sun Sign',                 // E
    'Moon Sign',                // F
    'Rising Sign',              // G

    // Human Design Profile
    'HD Type',                  // H - Manifestor/Generator/MG/Projector/Reflector
    'HD Strategy',              // I
    'HD Authority',             // J
    'HD Profile',               // K - e.g., 3/5

    // Business Profile
    'Business Model',           // L - Service/Product/Coaching/Course
    'Current Offers',           // M
    'Current Pricing',          // N
    'Ideal Client',             // O
    'Revenue Goal',             // P
    'Pain Points',              // Q

    // Generated Insights (from GPT)
    'What to Sell',             // R - AI recommendation
    'How to Sell',              // S - AI strategy
    'Pricing Model',            // T - AI recommendation
    'Key Strengths',            // U
    'Next Steps',               // V

    // Segmentation & Followup
    'Segment Tags',             // W - comma-separated
    'Followup Status',          // X - pending/in-progress/completed
    'Last Followup Date',       // Y
    'Notes',                    // Z
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Customer Insights!A1:Z1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers],
    },
  });

  console.log(`   ✅ Added ${headers.length} column headers\n`);

  // Add sample data
  console.log('4️⃣ Adding sample insight record...');

  const sampleInsight = [
    'sample@example.com',                           // Email
    'Business Alignment Orientation',               // Product
    new Date().toISOString().split('T')[0],        // Completion Date
    'completed',                                     // Completion Status
    'Leo',                                          // Sun Sign
    'Pisces',                                       // Moon Sign
    'Virgo',                                        // Rising Sign
    'Manifestor',                                   // HD Type
    'To Inform',                                    // HD Strategy
    'Emotional',                                    // HD Authority
    '3/5',                                          // HD Profile
    'Coaching',                                     // Business Model
    '1:1 Coaching, Group Programs',                // Current Offers
    '$1,500/month, $3,000/program',                // Current Pricing
    'Spiritual entrepreneurs, coaches',            // Ideal Client
    '$10k/month',                                  // Revenue Goal
    'Inconsistent income, not sure what to charge', // Pain Points
    'Signature coaching program aligned with manifestor energy', // What to Sell
    'Launch through informing strategy, authentic messaging', // How to Sell
    'Premium pricing $3k-5k to honor manifestor impact', // Pricing Model
    'Natural initiator, powerful vision, authentic voice', // Key Strengths
    'Create signature offer, build email list, launch in 30 days', // Next Steps
    'Manifestor,Leo,Coaching,High-ticket',         // Segment Tags
    'pending',                                      // Followup Status
    '',                                             // Last Followup Date
    'Strong energy for high-ticket coaching',      // Notes
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Customer Insights!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [sampleInsight],
    },
  });

  console.log('   ✅ Sample insight added\n');

  console.log('═══════════════════════════════════════════════');
  console.log('✅ CUSTOMER INSIGHTS SHEET SETUP COMPLETE');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('📊 Sheet Structure (26 columns):');
  console.log('');
  console.log('🔑 Core (A-D):');
  console.log('   Email, Product, Completion Date, Status');
  console.log('');
  console.log('✨ Astrological Profile (E-G):');
  console.log('   Sun Sign, Moon Sign, Rising Sign');
  console.log('');
  console.log('⚡ Human Design (H-K):');
  console.log('   Type, Strategy, Authority, Profile');
  console.log('');
  console.log('💼 Business Profile (L-Q):');
  console.log('   Model, Offers, Pricing, Client, Goals, Pain Points');
  console.log('');
  console.log('🤖 AI Insights (R-V):');
  console.log('   What to Sell, How to Sell, Pricing Model, Strengths, Next Steps');
  console.log('');
  console.log('🎯 Segmentation (W-Z):');
  console.log('   Tags, Followup Status, Last Followup, Notes');
  console.log('');
  console.log('🚀 Ready for:');
  console.log('   - Transcript parsing from GPT products');
  console.log('   - Automated segmentation');
  console.log('   - Personalized email sequences');
}

setupCustomerInsightsSheet().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
