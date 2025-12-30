/**
 * Check Service Account Storage Details
 * Shows what's consuming quota
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';

async function checkStorage() {
  console.log('💾 Checking Service Account Storage Details\n');
  console.log(`Service Account: ${SERVICE_ACCOUNT_EMAIL}\n`);

  try {
    // Load credentials
    const keyFileContent = fs.readFileSync(path.join(process.cwd(), KEY_FILE_PATH), 'utf8');
    const keyData = JSON.parse(keyFileContent);
    const PRIVATE_KEY = keyData.private_key;

    // Authenticate
    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('✓ Authenticated\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Get storage quota
    console.log('📊 STORAGE QUOTA:\n');
    try {
      const about = await drive.about.get({
        fields: 'storageQuota,user',
      });

      const quota = about.data.storageQuota;
      if (quota) {
        const limit = parseInt(quota.limit || '0');
        const usage = parseInt(quota.usage || '0');
        const usageInDrive = parseInt(quota.usageInDrive || '0');
        const usageInTrash = parseInt(quota.usageInDriveTrash || '0');

        console.log(`  Limit: ${formatBytes(limit)}`);
        console.log(`  Used: ${formatBytes(usage)} (${((usage / limit) * 100).toFixed(1)}%)`);
        console.log(`  In Drive: ${formatBytes(usageInDrive)}`);
        console.log(`  In Trash: ${formatBytes(usageInTrash)}\n`);

        if (usage >= limit) {
          console.log('  ⚠️  STORAGE QUOTA EXCEEDED!\n');
        }
      } else {
        console.log('  Unable to retrieve quota information\n');
      }
    } catch (error: any) {
      console.log(`  ✗ Failed to get quota: ${error.message}\n`);
    }

    console.log('═══════════════════════════════════════════════════\n');

    // List all files (not trashed)
    console.log('📁 FILES (NOT TRASHED):\n');
    const activeFiles = await drive.files.list({
      q: `'me' in owners and trashed=false`,
      fields: 'files(id, name, mimeType, size, createdTime)',
      pageSize: 100,
      orderBy: 'quotaBytesUsed desc',
    });

    console.log(`  Found: ${activeFiles.data.files?.length || 0} active files\n`);

    if (activeFiles.data.files && activeFiles.data.files.length > 0) {
      activeFiles.data.files.forEach((file, i) => {
        const size = file.size ? formatBytes(parseInt(file.size)) : 'N/A';
        console.log(`  ${i + 1}. ${file.name}`);
        console.log(`     Size: ${size}`);
        console.log(`     Type: ${file.mimeType}`);
        console.log();
      });
    }

    console.log('═══════════════════════════════════════════════════\n');

    // List trashed files
    console.log('🗑️  FILES IN TRASH:\n');
    const trashedFiles = await drive.files.list({
      q: `'me' in owners and trashed=true`,
      fields: 'files(id, name, mimeType, size)',
      pageSize: 100,
    });

    const trashedCount = trashedFiles.data.files?.length || 0;
    console.log(`  Found: ${trashedCount} trashed files\n`);

    if (trashedCount > 0) {
      console.log(`  ⚠️  Trashed files still count against quota!`);
      console.log(`  Run: npm run empty-trash\n`);

      trashedFiles.data.files?.slice(0, 10).forEach((file, i) => {
        const size = file.size ? formatBytes(parseInt(file.size)) : 'N/A';
        console.log(`  ${i + 1}. ${file.name} (${size})`);
      });

      if (trashedCount > 10) {
        console.log(`  ... and ${trashedCount - 10} more\n`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════\n');
    console.log('💡 RECOMMENDATIONS:\n');
    console.log('  1. Empty trash to free up quota');
    console.log('  2. Consider using ownership transfer for all documents');
    console.log('  3. Or use a different service account\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

checkStorage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
