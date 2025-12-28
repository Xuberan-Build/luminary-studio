/**
 * Test Document Creation in Different Scenarios
 * Helps diagnose why document creation fails with "quota exceeded" error
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';
const PRODUCT_FOLDER_ID = process.env.GOOGLE_PRODUCT_FOLDER_ID!;
const OWNER_EMAIL = process.env.GOOGLE_DOCS_OWNER_EMAIL || 'santos.93.aus@gmail.com';

async function testDocCreation() {
  console.log('🔬 Testing Document Creation Scenarios...\n');
  console.log(`Service Account: ${SERVICE_ACCOUNT_EMAIL}`);
  console.log(`Owner Email: ${OWNER_EMAIL}`);
  console.log(`Product Folder: ${PRODUCT_FOLDER_ID}\n`);

  try {
    // Load private key
    const keyFileContent = fs.readFileSync(path.join(process.cwd(), KEY_FILE_PATH), 'utf8');
    const keyData = JSON.parse(keyFileContent);
    const PRIVATE_KEY = keyData.private_key;

    // Auth
    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: PRIVATE_KEY,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('✓ Authenticated with Google API\n');
    console.log('═══════════════════════════════════════════════════\n');

    // TEST 1: Create document in ROOT (My Drive)
    console.log('TEST 1: Create Document in Root (My Drive)');
    console.log('─────────────────────────────────────────────────');
    try {
      console.log('  Creating: "Test Doc - Root Location"');
      console.log('  Location: Root / My Drive (no folder specified)');
      console.log('  Ownership: Service Account\n');

      const rootDoc = await drive.files.create({
        requestBody: {
          name: 'Test Doc - Root Location',
          mimeType: 'application/vnd.google-apps.document',
        },
        fields: 'id,name,webViewLink,owners,parents',
      });

      console.log('  ✅ SUCCESS!');
      console.log(`  Doc ID: ${rootDoc.data.id}`);
      console.log(`  Link: ${rootDoc.data.webViewLink}`);
      console.log(`  Owner: ${rootDoc.data.owners?.[0]?.emailAddress || 'Unknown'}`);
      console.log(`  Parent: ${rootDoc.data.parents?.[0] || 'Root'}\n`);

      // Clean up
      if (rootDoc.data.id) {
        await drive.files.delete({ fileId: rootDoc.data.id });
        console.log('  🗑️  Cleaned up test doc\n');
      }
    } catch (error: any) {
      console.log('  ❌ FAILED');
      console.log(`  Error: ${error.message}`);
      console.log(`  Code: ${error.code}`);
      if (error.errors) {
        console.log(`  Details: ${JSON.stringify(error.errors, null, 2)}`);
      }
      console.log();
    }

    console.log('═══════════════════════════════════════════════════\n');

    // TEST 2: Create document in SHARED FOLDER
    console.log('TEST 2: Create Document in Shared Folder');
    console.log('─────────────────────────────────────────────────');
    try {
      console.log('  Creating: "Test Doc - Shared Folder"');
      console.log(`  Location: Product Folder (${PRODUCT_FOLDER_ID})`);
      console.log('  Ownership: Service Account\n');

      const folderDoc = await drive.files.create({
        requestBody: {
          name: 'Test Doc - Shared Folder',
          mimeType: 'application/vnd.google-apps.document',
          parents: [PRODUCT_FOLDER_ID],
        },
        fields: 'id,name,webViewLink,owners,parents',
      });

      console.log('  ✅ SUCCESS!');
      console.log(`  Doc ID: ${folderDoc.data.id}`);
      console.log(`  Link: ${folderDoc.data.webViewLink}`);
      console.log(`  Owner: ${folderDoc.data.owners?.[0]?.emailAddress || 'Unknown'}`);
      console.log(`  Parent: ${folderDoc.data.parents?.[0] || 'Root'}\n`);

      // Clean up
      if (folderDoc.data.id) {
        await drive.files.delete({ fileId: folderDoc.data.id });
        console.log('  🗑️  Cleaned up test doc\n');
      }
    } catch (error: any) {
      console.log('  ❌ FAILED');
      console.log(`  Error: ${error.message}`);
      console.log(`  Code: ${error.code}`);
      if (error.errors) {
        console.log(`  Details: ${JSON.stringify(error.errors, null, 2)}`);
      }
      console.log();
    }

    console.log('═══════════════════════════════════════════════════\n');

    // TEST 3: Create document with ownership transfer
    console.log('TEST 3: Create Document with Ownership Transfer');
    console.log('─────────────────────────────────────────────────');
    try {
      console.log('  Creating: "Test Doc - Ownership Transfer"');
      console.log('  Location: Root');
      console.log(`  Ownership: Transfer to ${OWNER_EMAIL}\n`);

      const transferDoc = await drive.files.create({
        requestBody: {
          name: 'Test Doc - Ownership Transfer',
          mimeType: 'application/vnd.google-apps.document',
        },
        fields: 'id,name,webViewLink,owners',
      });

      console.log(`  ✓ Document created: ${transferDoc.data.id}`);
      console.log(`  ✓ Initial owner: ${transferDoc.data.owners?.[0]?.emailAddress}`);

      // Transfer ownership
      console.log(`  → Transferring ownership to ${OWNER_EMAIL}...`);

      await drive.permissions.create({
        fileId: transferDoc.data.id!,
        requestBody: {
          type: 'user',
          role: 'owner',
          emailAddress: OWNER_EMAIL,
        },
        transferOwnership: true,
      });

      console.log('  ✅ SUCCESS!');
      console.log(`  Doc ID: ${transferDoc.data.id}`);
      console.log(`  Link: ${transferDoc.data.webViewLink}`);
      console.log(`  New Owner: ${OWNER_EMAIL}\n`);

      console.log('  ℹ️  Not cleaning up - doc transferred to user\n');
    } catch (error: any) {
      console.log('  ❌ FAILED');
      console.log(`  Error: ${error.message}`);
      console.log(`  Code: ${error.code}`);
      if (error.errors) {
        console.log(`  Details: ${JSON.stringify(error.errors, null, 2)}`);
      }
      console.log();
    }

    console.log('═══════════════════════════════════════════════════\n');

    // TEST 4: Create folder to confirm Drive API works
    console.log('TEST 4: Create Folder (Control Test)');
    console.log('─────────────────────────────────────────────────');
    try {
      console.log('  Creating: "Test Folder - Control"');
      console.log(`  Location: Product Folder (${PRODUCT_FOLDER_ID})`);
      console.log('  Type: Folder (not document)\n');

      const testFolder = await drive.files.create({
        requestBody: {
          name: 'Test Folder - Control',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [PRODUCT_FOLDER_ID],
        },
        fields: 'id,name',
      });

      console.log('  ✅ SUCCESS!');
      console.log(`  Folder ID: ${testFolder.data.id}\n`);

      // Clean up
      if (testFolder.data.id) {
        await drive.files.delete({ fileId: testFolder.data.id });
        console.log('  🗑️  Cleaned up test folder\n');
      }
    } catch (error: any) {
      console.log('  ❌ FAILED');
      console.log(`  Error: ${error.message}`);
      console.log(`  Code: ${error.code}\n`);
    }

    console.log('═══════════════════════════════════════════════════\n');

    // SUMMARY
    console.log('📊 TEST SUMMARY\n');
    console.log('Run this script to diagnose the document creation issue.');
    console.log('Compare which tests pass vs fail to identify the restriction:\n');
    console.log('  • If TEST 1 passes: Issue is folder-specific');
    console.log('  • If TEST 1 fails: Issue is service account Docs restriction');
    console.log('  • If TEST 2 fails but TEST 1 passes: Folder permission issue');
    console.log('  • If TEST 4 passes: Drive API works (confirms folders work)\n');

  } catch (error: any) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

testDocCreation();
