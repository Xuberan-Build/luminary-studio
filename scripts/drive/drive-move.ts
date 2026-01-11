import { buildDriveClient } from './google-auth';
import { resolveFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const fileId = args[0];
const toIndex = args.indexOf('--to');
const folderPath = toIndex !== -1 ? args[toIndex + 1] : '';
const folderIdIndex = args.indexOf('--folder-id');
const folderIdArg = folderIdIndex !== -1 ? args[folderIdIndex + 1] : '';
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!fileId) {
  console.error('Usage: npm run drive:move -- <fileId> (--to "Folder/Path" | --folder-id <id>)');
  process.exit(1);
}

if (!folderPath && !folderIdArg) {
  console.error('Provide --to "Folder/Path" or --folder-id <id>.');
  process.exit(1);
}

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

async function run() {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  let targetFolderId = folderIdArg;

  if (!targetFolderId) {
    const resolved = await resolveFolderPath(rootId, folderPath);
    targetFolderId = resolved.folderId;
  }

  const existing = await drive.files.get({
    fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });

  const previousParents = (existing.data.parents || []).join(',');

  await drive.files.update({
    fileId,
    addParents: targetFolderId,
    removeParents: previousParents,
    supportsAllDrives: true,
  });

  console.log('File moved.');
  console.log(`File ID: ${fileId}`);
  console.log(`Folder ID: ${targetFolderId}`);
}

run().catch((error) => {
  console.error('Move failed:', error?.message || error);
  process.exit(1);
});
