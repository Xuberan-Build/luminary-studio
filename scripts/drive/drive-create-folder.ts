import { ensureFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const pathArg = args[0];
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!pathArg) {
  console.error('Usage: npm run drive:create-folder -- "<folder/path>" [--root <folderId>]');
  process.exit(1);
}

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

async function run() {
  const resolved = await ensureFolderPath(rootId, pathArg);
  console.log('Folder ensured.');
  console.log(`Path: ${pathArg}`);
  console.log(`Folder ID: ${resolved.folderId}`);
}

run().catch((error) => {
  console.error('Create folder failed:', error?.message || error);
  process.exit(1);
});
