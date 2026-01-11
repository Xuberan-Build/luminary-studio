import { buildDriveClient } from './google-auth';

const args = process.argv.slice(2);
const fileId = args.find((arg) => !arg.startsWith('--'));

if (!fileId) {
  console.error('Usage: npm run drive:delete -- <fileId>');
  process.exit(1);
}

const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);

drive.files.delete({
  fileId,
  supportsAllDrives: true,
})
  .then(() => {
    console.log('File deleted.');
    console.log(`File ID: ${fileId}`);
  })
  .catch((error) => {
    console.error('Delete failed:', error?.message || error);
    process.exit(1);
  });
