/**
 * Create CRM Google Sheet
 *
 * Creates a Google Sheet for tracking customer purchases in the specified Drive folder
 * Run: node create-crm-sheet.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createCRMSheet() {
  console.log('📊 Creating Quantum Strategies CRM Sheet...\n');

  // Load Drive service account key
  const keyPath = path.join(__dirname, '.secrets', 'quantum-gpt-assistant-b176e8b31832.json');

  if (!fs.existsSync(keyPath)) {
    console.error('❌ Drive service account key not found at:', keyPath);
    process.exit(1);
  }

  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  console.log('✅ Drive service account key loaded');
  console.log('   Email:', key.client_email);
  console.log('');

  try {
    // Create auth client for Drive and Sheets
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    console.log('🔐 Authenticating with Google...');
    await auth.authorize();
    console.log('✅ Authentication successful\n');

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      console.error('❌ GOOGLE_DRIVE_FOLDER_ID not found in .env');
      process.exit(1);
    }

    console.log('📁 Target folder ID:', folderId);
    console.log('');

    // Create the spreadsheet
    console.log('📝 Creating spreadsheet...');

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Quantum Strategies - Customer CRM',
        },
        sheets: [
          {
            properties: {
              title: 'Purchases',
              gridProperties: {
                frozenRowCount: 1, // Freeze header row
              },
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

    console.log('✅ Spreadsheet created!');
    console.log('   ID:', spreadsheetId);
    console.log('   URL:', spreadsheetUrl);
    console.log('');

    // Add headers to the sheet
    console.log('📋 Adding CRM headers...');

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Purchases!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Timestamp',
          'Email',
          'Name',
          'Product',
          'Amount',
          'Stripe Session ID',
          'GPT Link',
          'Email Sent',
          'Status',
        ]],
      },
    });

    console.log('✅ Headers added');
    console.log('');

    // Format the header row
    console.log('🎨 Formatting header row...');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.012, green: 0.0, blue: 0.282 }, // #030048 Quantum blue
                  textFormat: {
                    foregroundColor: { red: 0.973, green: 0.961, blue: 1.0 }, // #F8F5FF
                    fontSize: 11,
                    bold: true,
                  },
                  horizontalAlignment: 'LEFT',
                  verticalAlignment: 'MIDDLE',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 9,
              },
              properties: {
                pixelSize: 150,
              },
              fields: 'pixelSize',
            },
          },
        ],
      },
    });

    console.log('✅ Formatting applied');
    console.log('');

    // Move to the specified folder
    console.log('📁 Moving to Drive folder...');

    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      fields: 'id, parents',
    });

    console.log('✅ Moved to folder');
    console.log('');

    // Share with austin@xuberandigital.com for easy access
    console.log('👥 Sharing with your email...');

    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: 'austin@xuberandigital.com',
        },
      });
      console.log('✅ Shared with austin@xuberandigital.com');
    } catch (error) {
      console.log('⚠️  Could not share (email may not exist in workspace)');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 CRM Sheet Created Successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Spreadsheet Details:');
    console.log('   Name: Quantum Strategies - Customer CRM');
    console.log('   ID:', spreadsheetId);
    console.log('   URL:', spreadsheetUrl);
    console.log('');
    console.log('📋 Sheet Structure:');
    console.log('   - Purchases (main sheet)');
    console.log('   - Headers: Timestamp, Email, Name, Product, Amount, etc.');
    console.log('   - Formatted with Quantum branding colors');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('   1. Add this to your .env file:');
    console.log('      GOOGLE_SHEET_ID=' + spreadsheetId);
    console.log('');
    console.log('   2. Open the sheet:');
    console.log('      ' + spreadsheetUrl);
    console.log('');
    console.log('Ready to track customer purchases! 🚀');
    console.log('');

  } catch (error) {
    console.error('❌ Failed to create CRM sheet\n');
    console.error('Error:', error.message);

    if (error.code === 403) {
      console.error('\nPermission Error:');
      console.error('- Verify Google Drive API is enabled');
      console.error('- Verify Google Sheets API is enabled');
      console.error('- Check service account has proper permissions');
    }

    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the script
createCRMSheet();
