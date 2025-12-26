#!/usr/bin/env node
/**
 * Add Email Sequence Tracking Columns to Purchases Sheet
 * Adds columns J-N for email automation tracking
 */

require('dotenv').config({ path: '.env.production' });
const { google } = require('googleapis');

const SHEET_ID = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

async function setupEmailTrackingColumns() {
  console.log('📊 Setting up Email Tracking Columns in Purchases sheet...\n');

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

  // Step 1: Read current headers
  console.log('1️⃣ Reading current headers...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Purchases!A1:Z1',
  });

  const headers = response.data.values?.[0] || [];
  console.log(`   Current headers (${headers.length} columns):`, headers);
  console.log('');

  // Step 2: Check if email tracking columns already exist
  const expectedColumns = [
    'Day 1 Email Sent',      // J (column 10)
    'Day 3 Email Sent',      // K (column 11)
    'Day 7 Email Sent',      // L (column 12)
    'Last Email Sent',       // M (column 13)
    'Sequence Status',       // N (column 14)
  ];

  const startColumn = headers.length; // Start adding from the next empty column
  const columnsToAdd = [];

  console.log('2️⃣ Checking which columns need to be added...');

  expectedColumns.forEach((colName, index) => {
    const targetIndex = 9 + index; // J=9, K=10, L=11, M=12, N=13
    if (!headers[targetIndex] || headers[targetIndex] !== colName) {
      columnsToAdd.push({ index: targetIndex, name: colName });
      console.log(`   ➕ Will add: ${colName} at column ${String.fromCharCode(65 + targetIndex)}`);
    } else {
      console.log(`   ✅ Already exists: ${colName}`);
    }
  });

  if (columnsToAdd.length === 0) {
    console.log('\n✅ All email tracking columns already exist!');
    return;
  }

  console.log('');

  // Step 3: Update headers
  console.log('3️⃣ Adding missing columns to header row...');

  // Build the complete header row with new columns
  const newHeaders = [...headers];

  // Ensure we have at least 14 columns (A-N)
  while (newHeaders.length < 14) {
    newHeaders.push('');
  }

  // Set the email tracking column names
  newHeaders[9] = 'Day 1 Email Sent';   // J
  newHeaders[10] = 'Day 3 Email Sent';  // K
  newHeaders[11] = 'Day 7 Email Sent';  // L
  newHeaders[12] = 'Last Email Sent';   // M
  newHeaders[13] = 'Sequence Status';   // N

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Purchases!A1:N1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newHeaders.slice(0, 14)], // Only update A-N
    },
  });

  console.log('   ✅ Headers updated successfully');
  console.log('');

  // Step 4: Verify
  console.log('4️⃣ Verifying updated headers...');
  const verifyResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Purchases!A1:N1',
  });

  const updatedHeaders = verifyResponse.data.values?.[0] || [];
  console.log('   📋 Updated headers:', updatedHeaders);
  console.log('');

  console.log('═══════════════════════════════════════════════');
  console.log('✅ EMAIL TRACKING COLUMNS SETUP COMPLETE');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('📊 Your Purchases sheet now has:');
  console.log('   A-I: Purchase data (existing)');
  console.log('   J:   Day 1 Email Sent');
  console.log('   K:   Day 3 Email Sent');
  console.log('   L:   Day 7 Email Sent');
  console.log('   M:   Last Email Sent');
  console.log('   N:   Sequence Status');
  console.log('');
  console.log('🚀 Ready for email sequence automation!');
}

setupEmailTrackingColumns().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
