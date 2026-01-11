import { buildDriveClient } from './google-auth';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const fileId = positional[0];
const newName = positional[1];

if (!fileId || !newName) {
  console.error('Usage: npm run drive:rename -- <fileId> "New Name"');
  process.exit(1);
}

const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);

drive.files.update({
  fileId,
  requestBody: { name: newName },
  supportsAllDrives: true,
})
  .then(() => {
    console.log('File renamed.');
    console.log(`File ID: ${fileId}`);
    console.log(`New name: ${newName}`);
  })
  .catch((error) => {
    console.error('Rename failed:', error?.message || error);
    process.exit(1);
  });
