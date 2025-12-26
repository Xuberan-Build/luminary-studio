#!/usr/bin/env node
/**
 * Create Customers Master Sheet
 * Central customer profile database for CRM
 */

require('dotenv').config({ path: '.env.production' });
const { google } = require('googleapis');

const SHEET_ID = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

async function setupCustomersSheet() {
  console.log('👥 Setting up Customers Master Sheet...\n');

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

  // Step 1: Check if Customers sheet already exists
  console.log('1️⃣ Checking if Customers sheet exists...');

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets || [];
    const customersSheet = existingSheets.find(s => s.properties?.title === 'Customers');

    if (customersSheet) {
      console.log('   ⚠️  Customers sheet already exists');
      console.log(`   📄 Sheet ID: ${customersSheet.properties?.sheetId}`);
      console.log('   Skipping creation...\n');

      // Just update headers if needed
      await updateCustomersHeaders(sheets);
      return;
    }

    console.log('   ✅ Customers sheet does not exist, creating...\n');

    // Step 2: Create new sheet
    console.log('2️⃣ Creating Customers sheet...');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Customers',
              gridProperties: {
                rowCount: 1000,
                columnCount: 20,
                frozenRowCount: 1, // Freeze header row
              },
              tabColor: {
                red: 0.4,
                green: 0.8,
                blue: 0.4,
              },
            },
          },
        }],
      },
    });

    console.log('   ✅ Customers sheet created\n');

    // Step 3: Add headers
    await updateCustomersHeaders(sheets);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function updateCustomersHeaders(sheets) {
  console.log('3️⃣ Setting up Customers sheet headers...');

  const headers = [
    'Email',                  // A - Primary key
    'Name',                   // B
    'First Purchase Date',    // C
    'Last Purchase Date',     // D
    'Total Purchases',        // E
    'Lifetime Value',         // F
    'Products Owned',         // G
    'Last Product',           // H
    'Customer Status',        // I - Active/At Risk/Churned/VIP
    'Tags',                   // J - Comma-separated tags
    'Sequence Status',        // K - active/completed/unsubscribed
    'Last Email Date',        // L
    'Engagement Score',       // M - 1-10
    'Referral Source',        // N
    'Timezone',               // O
    'Preferred Contact',      // P
    'Support Tickets',        // Q
    'NPS Score',              // R - Net Promoter Score
    'Next Action',            // S - Recommended next step
    'Notes',                  // T
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Customers!A1:T1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers],
    },
  });

  console.log(`   ✅ Added ${headers.length} column headers`);
  console.log('   📋 Headers:', headers.slice(0, 10).join(', '), '...\n');

  // Step 4: Add sample formulas for aggregation
  console.log('4️⃣ Adding sample customer record...');

  const sampleCustomer = [
    'sample@example.com',     // Email
    'Sample Customer',        // Name
    new Date().toISOString().split('T')[0],  // First Purchase Date
    new Date().toISOString().split('T')[0],  // Last Purchase Date
    '1',                      // Total Purchases
    '$7.00',                  // Lifetime Value
    'Quantum Initiation',     // Products Owned
    'Quantum Initiation Protocol',  // Last Product
    'Active',                 // Customer Status
    'New Customer',           // Tags
    'active',                 // Sequence Status
    new Date().toISOString(), // Last Email Date
    '8',                      // Engagement Score
    'Organic',                // Referral Source
    'America/Los_Angeles',    // Timezone
    'Email',                  // Preferred Contact
    '0',                      // Support Tickets
    '',                       // NPS Score
    'Complete Day 1 Email',   // Next Action
    'Sample customer for testing CRM setup',  // Notes
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Customers!A:T',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [sampleCustomer],
    },
  });

  console.log('   ✅ Sample customer added\n');

  console.log('═══════════════════════════════════════════════');
  console.log('✅ CUSTOMERS MASTER SHEET SETUP COMPLETE');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('📊 Customers Sheet Structure:');
  console.log('   A: Email (Primary Key)');
  console.log('   B: Name');
  console.log('   C-D: Purchase Dates');
  console.log('   E-F: Purchase Metrics');
  console.log('   G-H: Product Info');
  console.log('   I: Customer Status');
  console.log('   J: Tags (for segmentation)');
  console.log('   K-L: Email Sequence Data');
  console.log('   M: Engagement Score');
  console.log('   N-P: Contact Preferences');
  console.log('   Q-R: Support & Feedback');
  console.log('   S: Next Recommended Action');
  console.log('   T: Notes');
  console.log('');
  console.log('🚀 Ready for customer lifecycle automation!');
}

setupCustomersSheet().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
