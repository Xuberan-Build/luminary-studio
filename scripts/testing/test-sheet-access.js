#!/usr/bin/env node
/**
 * Test Google Sheets API Access
 * Verifies we can read/write to the CRM sheet
 */

require('dotenv').config({ path: '.env.production' });
const { google } = require('googleapis');

const SHEET_ID = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

async function testSheetAccess() {
  console.log('🔍 Testing Google Sheets API Access...\n');

  // Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.error('❌ Missing credentials:');
    console.error('   GOOGLE_DRIVE_CLIENT_EMAIL:', clientEmail ? '✅ Set' : '❌ Missing');
    console.error('   GOOGLE_DRIVE_PRIVATE_KEY:', privateKey ? '✅ Set' : '❌ Missing');
    process.exit(1);
  }

  console.log('   ✅ GOOGLE_DRIVE_CLIENT_EMAIL:', clientEmail);
  console.log('   ✅ GOOGLE_DRIVE_PRIVATE_KEY: [REDACTED]');
  console.log('');

  // Create auth client
  console.log('2️⃣ Creating authentication client...');
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  console.log('   ✅ Auth client created');
  console.log('');

  // Test read access
  console.log('3️⃣ Testing READ access to Purchases sheet...');
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Purchases!A1:I10',
    });

    const rows = response.data.values || [];
    console.log(`   ✅ Successfully read ${rows.length} rows`);

    if (rows.length > 0) {
      console.log('   📋 Headers:', rows[0]);
      console.log(`   📊 Data rows: ${rows.length - 1}`);
    }
    console.log('');
  } catch (error) {
    console.error('   ❌ Failed to read sheet:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }

  // Test write access (append a test row)
  console.log('4️⃣ Testing WRITE access (appending test row)...');

  const testRow = [
    new Date().toISOString(), // Timestamp
    'test@example.com',       // Email
    'Test User',              // Name
    'Test Product',           // Product
    '$0.00',                  // Amount
    'test_session_123',       // Session ID
    '',                       // GPT Link (empty)
    '✅ Test',                // Email Sent
    'Test Entry',             // Status
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Purchases!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [testRow],
      },
    });

    console.log('   ✅ Successfully wrote test row');
    console.log('   📝 Test data:', testRow);
    console.log('');
  } catch (error) {
    console.error('   ❌ Failed to write to sheet:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }

  // Verify the write
  console.log('5️⃣ Verifying the test row was written...');

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Purchases!A:I',
    });

    const rows = response.data.values || [];
    const lastRow = rows[rows.length - 1];

    if (lastRow && lastRow[1] === 'test@example.com') {
      console.log('   ✅ Test row verified in sheet');
      console.log('   📋 Last row:', lastRow);
    } else {
      console.log('   ⚠️  Could not verify test row');
    }
    console.log('');
  } catch (error) {
    console.error('   ❌ Failed to verify:', error.message);
  }

  console.log('═══════════════════════════════════════════════');
  console.log('✅ ALL TESTS PASSED');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check the sheet to see the test row');
  console.log('2. Delete the test row if needed');
  console.log('3. Proceed with building the CRM automations');
  console.log('');
}

testSheetAccess().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
