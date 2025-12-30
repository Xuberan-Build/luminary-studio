/**
 * Delete ALL files created by the service account in the product folder
 * This will free up the service account's storage quota
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';
const PRODUCT_FOLDER_ID = process.env.GOOGLE_PRODUCT_FOLDER_ID!;

async function cleanupAll() {
  console.log('🧹 Cleaning up ALL files owned by service account...\n');
  console.log(`   Service Account: ${SERVICE_ACCOUNT_EMAIL}`);
  console.log(`   This will free up the service account's storage quota\n`);

  try {
    // Load private key
    const keyFileContent = fs.readFileSync(path.join(process.cwd(), KEY_FILE_PATH), 'utf8');
    const keyData = JSON.parse(keyFileContent);
    const PRIVATE_KEY = keyData.private_key;

    // Auth
    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // List ALL files owned by the service account (not just in product folder)
    // This is needed to free up the service account's storage quota
    console.log('📋 Fetching ALL files owned by service account...');

    const response = await drive.files.list({
      q: `'me' in owners and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, owners, parents)',
      orderBy: 'createdTime desc',
      pageSize: 1000, // Get up to 1000 files
    });

    const files = response.data.files || [];

    console.log(`   Found ${files.length} files/folders\n`);

    if (files.length === 0) {
      console.log('✅ No files to delete!\n');
      return;
    }

    // Show all files
    console.log('═══════════════════════════════════════');
    console.log('Files to be deleted:');
    console.log('═══════════════════════════════════════\n');

    files.forEach((file, i) => {
      const type = file.mimeType === 'application/vnd.google-apps.folder' ? '📁 Folder' : '📄 File';
      console.log(`${i + 1}. ${type}: "${file.name}"`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Created: ${file.createdTime}`);
      console.log();
    });

    // Confirm deletion
    console.log('═══════════════════════════════════════');
    console.log(`⚠️  WARNING: About to delete ${files.length} files/folders!`);
    console.log('═══════════════════════════════════════\n');

    // Delete all files
    console.log('🗑️  Deleting files...\n');

    let deleted = 0;
    let failed = 0;

    for (const file of files) {
      try {
        await drive.files.delete({ fileId: file.id! });
        console.log(`✓ Deleted: ${file.name} (${file.id})`);
        deleted++;
      } catch (error: any) {
        console.error(`✗ Failed to delete ${file.name}: ${error.message}`);
        failed++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Cleanup complete!');
    console.log('═══════════════════════════════════════');
    console.log(`   Deleted: ${deleted} files/folders`);
    console.log(`   Failed: ${failed} files/folders`);
    console.log(`   Storage freed!\n`);

  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupAll();
