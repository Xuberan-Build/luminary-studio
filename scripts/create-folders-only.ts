/**
 * Create Product Folder Structure
 * Only creates folders (documents must be created manually due to service account restrictions)
 */

import { GoogleDocsService } from '../src/lib/services/GoogleDocsService';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';
const PRODUCT_FOLDER_ID = process.env.GOOGLE_PRODUCT_FOLDER_ID!;

async function createFolders() {
  console.log('📁 Creating Product Folder Structure...\n');

  try {
    // Load private key
    const keyFileContent = fs.readFileSync(path.join(process.cwd(), KEY_FILE_PATH), 'utf8');
    const keyData = JSON.parse(keyFileContent);
    const PRIVATE_KEY = keyData.private_key;

    // Initialize service
    const docsService = new GoogleDocsService({
      clientEmail: SERVICE_ACCOUNT_EMAIL,
      privateKey: PRIVATE_KEY,
    });

    console.log('✓ Authenticated with Google API\n');

    // Create folders
    console.log('Creating folders in Product Development folder...\n');

    const archiveFolderId = await docsService.createFolder('Archive', PRODUCT_FOLDER_ID);
    console.log(`✓ Created: Archive/`);
    console.log(`  ID: ${archiveFolderId}`);
    console.log(`  Link: https://drive.google.com/drive/folders/${archiveFolderId}\n`);

    const draftsFolderId = await docsService.createFolder('Drafts', PRODUCT_FOLDER_ID);
    console.log(`✓ Created: Drafts/`);
    console.log(`  ID: ${draftsFolderId}`);
    console.log(`  Link: https://drive.google.com/drive/folders/${draftsFolderId}\n`);

    const approvedFolderId = await docsService.createFolder('Approved', PRODUCT_FOLDER_ID);
    console.log(`✓ Created: Approved/`);
    console.log(`  ID: ${approvedFolderId}`);
    console.log(`  Link: https://drive.google.com/drive/folders/${approvedFolderId}\n`);

    // Save config
    const config = {
      productFolderId: PRODUCT_FOLDER_ID,
      archiveFolderId,
      draftsFolderId,
      approvedFolderId,
      createdAt: new Date().toISOString(),
    };

    const configPath = path.join(process.cwd(), '.product-system-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ FOLDER STRUCTURE CREATED!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📋 Folder Structure:');
    console.log(`   Product Development: https://drive.google.com/drive/folders/${PRODUCT_FOLDER_ID}`);
    console.log(`   ├── Archive: ${archiveFolderId}`);
    console.log(`   ├── Drafts: ${draftsFolderId}`);
    console.log(`   └── Approved: ${approvedFolderId}\n`);

    console.log('💾 Configuration saved to: .product-system-config.json\n');

    console.log('📖 NEXT STEPS:');
    console.log('   1. Create template document manually in Google Drive');
    console.log('   2. Copy content from PRODUCT_TEMPLATE_CONTENT.txt');
    console.log('   3. Share doc with service account (Editor permission)');
    console.log('   4. Add document ID to .env.local');
    console.log('   5. Run: npm run test-doc-parse\n');

  } catch (error: any) {
    console.error('❌ Failed to create folders:', error.message);
    process.exit(1);
  }
}

createFolders();
