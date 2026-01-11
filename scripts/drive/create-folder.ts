import { ensureFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const pathArg = args.find((arg) => !arg.startsWith('--'));
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

if (!pathArg) {
  console.error('Usage: npm run drive:create-folder -- "Growth/Products/Rite III"');
  process.exit(1);
}

ensureFolderPath(rootId, pathArg)
  .then(({ folderId }) => {
    console.log(`Folder ready: ${pathArg}`);
    console.log(`Folder ID: ${folderId}`);
  })
  .catch((error) => {
    console.error('Create folder failed:', error?.message || error);
    process.exit(1);
  });
