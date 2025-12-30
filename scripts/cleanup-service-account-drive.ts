/**
 * Cleanup Service Account Google Drive Storage
 * Deletes old test files and unused documents to free up quota
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
}

async function cleanupDrive() {
  console.log('🧹 Cleaning Up Service Account Google Drive Storage\n');
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
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('✓ Authenticated with Google Drive API\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Get all files owned by service account
    console.log('📋 Fetching all files owned by service account...\n');

    const response = await drive.files.list({
      q: `'me' in owners and trashed = false`,
      fields: 'files(id, name, mimeType, createdTime, size, parents)',
      pageSize: 1000,
      orderBy: 'createdTime desc',
    });

    const files = response.data.files || [];
    console.log(`Found ${files.length} files\n`);

    if (files.length === 0) {
      console.log('✅ No files found - storage is already clean!\n');
      return;
    }

    // Categorize files
    const testFiles: DriveFile[] = [];
    const templateFiles: DriveFile[] = [];
    const otherFiles: DriveFile[] = [];

    files.forEach((file: any) => {
      const fileData: DriveFile = {
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        createdTime: file.createdTime!,
        size: file.size,
      };

      const name = file.name!.toLowerCase();

      if (name.includes('test') || name.includes('temp') || name.includes('copy')) {
        testFiles.push(fileData);
      } else if (name.includes('template') || name.includes('prompt')) {
        templateFiles.push(fileData);
      } else {
        otherFiles.push(fileData);
      }
    });

    // Display summary
    console.log('📊 FILE BREAKDOWN:\n');
    console.log(`  Test/Temporary Files: ${testFiles.length}`);
    console.log(`  Template/Prompt Files: ${templateFiles.length}`);
    console.log(`  Other Files: ${otherFiles.length}\n`);

    console.log('═══════════════════════════════════════════════════\n');

    // Delete test files
    if (testFiles.length > 0) {
      console.log(`🗑️  DELETING ${testFiles.length} TEST/TEMPORARY FILES:\n`);

      for (const file of testFiles) {
        try {
          await drive.files.delete({ fileId: file.id });
          console.log(`  ✓ Deleted: ${file.name} (${file.mimeType})`);
        } catch (error: any) {
          console.log(`  ✗ Failed to delete ${file.name}: ${error.message}`);
        }
      }

      console.log(`\n✅ Deleted ${testFiles.length} test files\n`);
      console.log('═══════════════════════════════════════════════════\n');
    }

    // List remaining files
    if (templateFiles.length > 0 || otherFiles.length > 0) {
      console.log('📁 REMAINING FILES:\n');

      if (templateFiles.length > 0) {
        console.log('  TEMPLATES/PROMPTS:');
        templateFiles.slice(0, 10).forEach(file => {
          const created = new Date(file.createdTime).toLocaleDateString();
          console.log(`    • ${file.name} (${created})`);
        });
        if (templateFiles.length > 10) {
          console.log(`    ... and ${templateFiles.length - 10} more`);
        }
        console.log();
      }

      if (otherFiles.length > 0) {
        console.log('  OTHER FILES:');
        otherFiles.slice(0, 10).forEach(file => {
          const created = new Date(file.createdTime).toLocaleDateString();
          console.log(`    • ${file.name} (${created})`);
        });
        if (otherFiles.length > 10) {
          console.log(`    ... and ${otherFiles.length - 10} more`);
        }
        console.log();
      }

      console.log('To delete ALL remaining files, add a --force flag to this script.\n');
    }

    console.log('═══════════════════════════════════════════════════\n');

    // Storage summary
    console.log('💾 STORAGE FREED:\n');
    console.log(`  Files deleted: ${testFiles.length}`);
    console.log(`  Files remaining: ${templateFiles.length + otherFiles.length}\n`);

    console.log('Next steps:');
    console.log('  1. Run: npm run test-doc-creation');
    console.log('  2. Verify document creation now works');
    console.log('  3. If still failing, consider deleting template files too\n');

  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    if (error.errors) {
      console.error('Error details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

// Check for --force flag to delete everything
const forceDelete = process.argv.includes('--force');

if (forceDelete) {
  console.log('⚠️  WARNING: --force flag detected');
  console.log('This will delete ALL files owned by the service account!\n');

  // TODO: Implement force delete if needed
  console.log('Force delete not yet implemented. Remove test files manually first.\n');
  process.exit(0);
}

cleanupDrive()
  .then(() => {
    console.log('✅ Cleanup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
