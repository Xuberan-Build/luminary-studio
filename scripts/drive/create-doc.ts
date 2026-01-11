import { buildDriveClient } from './google-auth';
import { ensureFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const folderPath = positional[0];
const docName = positional[1];
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

if (!folderPath || !docName) {
  console.error('Usage: npm run drive:create-doc -- "Growth/Products/PRDs" "PRD_Rite_III_Declaration"');
  process.exit(1);
}

const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);

async function run() {
  const { folderId, driveId } = await ensureFolderPath(rootId, folderPath);

  const file = await drive.files.create({
    requestBody: {
      name: docName,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId],
    },
    fields: 'id,webViewLink',
    supportsAllDrives: true,
  });

  console.log('Document created.');
  console.log(`Doc ID: ${file.data.id}`);
  console.log(`Link: ${file.data.webViewLink}`);
  if (driveId) {
    console.log(`Drive ID: ${driveId}`);
  }
}

run().catch((error) => {
  console.error('Create doc failed:', error?.message || error);
  process.exit(1);
});
