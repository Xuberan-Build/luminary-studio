/**
 * Clean up duplicate test folders created during setup testing
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';
const PRODUCT_FOLDER_ID = process.env.GOOGLE_PRODUCT_FOLDER_ID!;

async function cleanupFolders() {
  console.log('🧹 Cleaning up duplicate test folders...\n');

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

    // List all folders in the parent folder
    const response = await drive.files.list({
      q: `'${PRODUCT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    const folders = response.data.files || [];

    console.log(`Found ${folders.length} folders:\n`);

    // Group by name
    const foldersByName: Record<string, any[]> = {};
    folders.forEach(folder => {
      const name = folder.name || 'Unnamed';
      if (!foldersByName[name]) {
        foldersByName[name] = [];
      }
      foldersByName[name].push(folder);
    });

    // Delete duplicates (keep newest)
    let deletedCount = 0;

    for (const [name, group] of Object.entries(foldersByName)) {
      if (group.length > 1) {
        console.log(`📁 "${name}" - Found ${group.length} copies`);

        // Sort by creation time, newest first
        group.sort((a, b) => {
          const timeA = new Date(a.createdTime || 0).getTime();
          const timeB = new Date(b.createdTime || 0).getTime();
          return timeB - timeA;
        });

        // Keep the first (newest), delete the rest
        const [keep, ...toDelete] = group;
        console.log(`   ✓ Keeping: ${keep.id} (${keep.createdTime})`);

        for (const folder of toDelete) {
          console.log(`   🗑️  Deleting: ${folder.id} (${folder.createdTime})`);
          await drive.files.delete({ fileId: folder.id! });
          deletedCount++;
        }

        console.log();
      } else {
        console.log(`📁 "${name}" - Only 1 copy (keeping)\n`);
      }
    }

    console.log(`═══════════════════════════════════════`);
    console.log(`✅ Cleanup complete!`);
    console.log(`   Deleted ${deletedCount} duplicate folders`);
    console.log(`   Kept ${folders.length - deletedCount} folders\n`);

  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupFolders();
