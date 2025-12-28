/**
 * Check storage usage and quota for the service account
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';

async function checkStorage() {
  console.log('📊 Checking Service Account Storage Usage...\n');
  console.log(`Service Account: ${SERVICE_ACCOUNT_EMAIL}\n`);

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

    // Get storage quota info
    console.log('📦 Storage Quota Information:');
    console.log('═══════════════════════════════════════\n');

    try {
      const about = await drive.about.get({
        fields: 'storageQuota,user',
      });

      const quota = about.data.storageQuota;
      const user = about.data.user;

      console.log(`User: ${user?.displayName || user?.emailAddress || 'Unknown'}`);
      console.log();

      if (quota) {
        const limit = parseInt(quota.limit || '0');
        const usage = parseInt(quota.usage || '0');
        const usageInDrive = parseInt(quota.usageInDrive || '0');
        const usageInTrash = parseInt(quota.usageInDriveTrash || '0');

        const formatBytes = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
        };

        console.log(`Total Quota: ${formatBytes(limit)} ${limit === 0 ? '(Unlimited)' : ''}`);
        console.log(`Used: ${formatBytes(usage)}`);
        console.log(`  ├─ In Drive: ${formatBytes(usageInDrive)}`);
        console.log(`  └─ In Trash: ${formatBytes(usageInTrash)}`);

        if (limit > 0) {
          const percentUsed = (usage / limit) * 100;
          const remaining = limit - usage;
          console.log();
          console.log(`Percent Used: ${percentUsed.toFixed(2)}%`);
          console.log(`Remaining: ${formatBytes(remaining)}`);

          if (percentUsed > 90) {
            console.log('\n⚠️  WARNING: Storage is over 90% full!');
          } else if (percentUsed > 75) {
            console.log('\n⚠️  Storage is over 75% full');
          }
        }
      } else {
        console.log('No quota information available');
      }
    } catch (error: any) {
      console.error('Could not fetch quota info:', error.message);
    }

    // List all files owned by service account
    console.log('\n\n📁 Files Owned by Service Account:');
    console.log('═══════════════════════════════════════\n');

    try {
      const filesList = await drive.files.list({
        q: `'me' in owners and trashed=false`,
        fields: 'files(id,name,mimeType,size,createdTime,parents)',
        pageSize: 100,
        orderBy: 'quotaBytesUsed desc',
      });

      const files = filesList.data.files || [];

      if (files.length === 0) {
        console.log('No files owned by this service account\n');
      } else {
        console.log(`Found ${files.length} files:\n`);

        let totalSize = 0;
        files.forEach((file, i) => {
          const size = parseInt(file.size || '0');
          totalSize += size;

          const icon = file.mimeType === 'application/vnd.google-apps.folder' ? '📁' :
                       file.mimeType === 'application/vnd.google-apps.document' ? '📄' : '📎';

          console.log(`${i + 1}. ${icon} ${file.name}`);
          console.log(`   ID: ${file.id}`);
          console.log(`   Type: ${file.mimeType}`);
          if (size > 0) {
            console.log(`   Size: ${(size / 1024).toFixed(2)} KB`);
          }
          console.log(`   Created: ${file.createdTime}`);
          console.log();
        });

        console.log(`Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

        // Count by type
        const folderCount = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder').length;
        const docCount = files.filter(f => f.mimeType === 'application/vnd.google-apps.document').length;
        const otherCount = files.length - folderCount - docCount;

        console.log('By Type:');
        console.log(`  📁 Folders: ${folderCount}`);
        console.log(`  📄 Docs: ${docCount}`);
        console.log(`  📎 Other: ${otherCount}`);
      }
    } catch (error: any) {
      console.error('Could not list files:', error.message);
    }

    console.log('\n═══════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ Failed to check storage:', error.message);
    process.exit(1);
  }
}

checkStorage();
