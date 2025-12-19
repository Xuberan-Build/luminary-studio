/**
 * Setup CRM Google Sheet
 *
 * Formats an existing sheet with headers, styling, and moves to folder
 * Run: node setup-crm-sheet.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupCRMSheet() {
  console.log('📊 Setting up Quantum Strategies CRM Sheet...\n');

  const keyPath = path.join(__dirname, '.secrets', 'quantum-gpt-assistant-b176e8b31832.json');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  console.log('🔐 Authenticating...');
  await auth.authorize();
  console.log('✅ Authenticated\n');

  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  console.log('📋 Sheet ID:', spreadsheetId);
  console.log('📁 Folder ID:', folderId);
  console.log('');

  try {
    // 1. Rename the spreadsheet
    console.log('✏️  Renaming spreadsheet...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          updateSpreadsheetProperties: {
            properties: {
              title: 'Quantum Strategies - Customer CRM',
            },
            fields: 'title',
          },
        }],
      },
    });
    console.log('✅ Renamed to "Quantum Strategies - Customer CRM"\n');

    // 2. Rename the first sheet to "Purchases"
    console.log('✏️  Renaming sheet tab...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const firstSheetId = spreadsheet.data.sheets[0].properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: firstSheetId,
              title: 'Purchases',
            },
            fields: 'title',
          },
        }],
      },
    });
    console.log('✅ Sheet renamed to "Purchases"\n');

    // 3. Add headers
    console.log('📝 Adding CRM headers...');
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
    console.log('✅ Headers added\n');

    // 4. Format header row with Quantum branding
    console.log('🎨 Applying Quantum branding...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Style header row
          {
            repeatCell: {
              range: {
                sheetId: firstSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.012, green: 0.0, blue: 0.282 }, // #030048
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
          // Freeze header row
          {
            updateSheetProperties: {
              properties: {
                sheetId: firstSheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Set column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId: firstSheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1, // Timestamp
              },
              properties: { pixelSize: 180 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: firstSheetId,
                dimension: 'COLUMNS',
                startIndex: 1,
                endIndex: 2, // Email
              },
              properties: { pixelSize: 220 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: firstSheetId,
                dimension: 'COLUMNS',
                startIndex: 2,
                endIndex: 9, // Rest of columns
              },
              properties: { pixelSize: 150 },
              fields: 'pixelSize',
            },
          },
        ],
      },
    });
    console.log('✅ Quantum branding applied\n');

    // 5. Move to folder (skip if folder not accessible)
    console.log('📁 Moving to Drive folder...');
    try {
      const file = await drive.files.get({
        fileId: spreadsheetId,
        fields: 'parents',
      });

      const previousParents = file.data.parents ? file.data.parents.join(',') : '';

      await drive.files.update({
        fileId: spreadsheetId,
        addParents: folderId,
        removeParents: previousParents || undefined,
        fields: 'id, parents',
      });
      console.log('✅ Moved to folder\n');
    } catch (error) {
      console.log('⚠️  Folder not accessible (manually move if needed)\n');
    }

    // 6. Share with service account
    console.log('🔐 Granting access to service account...');
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: key.client_email,
      },
    });
    console.log('✅ Service account has write access\n');

    // 7. Share with austin@xuberandigital.com
    console.log('👤 Sharing with your email...');
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: 'austin@xuberandigital.com',
        },
      });
      console.log('✅ Shared with austin@xuberandigital.com\n');
    } catch (error) {
      console.log('⚠️  Could not share with austin@xuberandigital.com (may not be in workspace)\n');
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 CRM Sheet Setup Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Sheet Details:');
    console.log('   Name: Quantum Strategies - Customer CRM');
    console.log('   ID:', spreadsheetId);
    console.log('   URL:', sheetUrl);
    console.log('');
    console.log('✅ Configuration:');
    console.log('   - Headers added with Quantum branding');
    console.log('   - Header row frozen');
    console.log('   - Column widths optimized');
    console.log('   - Moved to Drive folder');
    console.log('   - Service account has write access');
    console.log('');
    console.log('📝 Environment Variables:');
    console.log('   ✅ GOOGLE_SHEET_ID=' + spreadsheetId);
    console.log('');
    console.log('Ready to track customer purchases! 🚀');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

setupCRMSheet();
