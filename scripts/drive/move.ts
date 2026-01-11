import { buildDriveClient } from './google-auth';
import { resolveFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const fileId = positional[0];
const toIndex = args.indexOf('--to');
const toIdIndex = args.indexOf('--to-id');
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!fileId) {
  console.error('Usage: npm run drive:move -- <fileId> --to "Delivery/Built Products"');
  process.exit(1);
}

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);

async function run() {
  let destinationId = '';

  if (toIdIndex !== -1) {
    destinationId = args[toIdIndex + 1];
  } else if (toIndex !== -1) {
    const folderPath = args[toIndex + 1];
    if (!folderPath) {
      throw new Error('Missing --to <path>');
    }
    const resolved = await resolveFolderPath(rootId, folderPath);
    destinationId = resolved.folderId;
  }

  if (!destinationId) {
    throw new Error('Destination folder not resolved. Use --to or --to-id.');
  }

  const file = await drive.files.get({
    fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });

  const previousParents = (file.data.parents || []).join(',');

  await drive.files.update({
    fileId,
    addParents: destinationId,
    removeParents: previousParents || undefined,
    supportsAllDrives: true,
  });

  console.log('File moved.');
  console.log(`File ID: ${fileId}`);
  console.log(`Destination folder ID: ${destinationId}`);
}

run().catch((error) => {
  console.error('Move failed:', error?.message || error);
  process.exit(1);
});
