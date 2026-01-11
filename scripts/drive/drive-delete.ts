import { buildDriveClient } from './google-auth';

const args = process.argv.slice(2);
const fileId = args[0];

if (!fileId) {
  console.error('Usage: npm run drive:delete -- <fileId>');
  process.exit(1);
}

async function run() {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });

  console.log('File deleted.');
  console.log(`File ID: ${fileId}`);
}

run().catch((error) => {
  console.error('Delete failed:', error?.message || error);
  process.exit(1);
});
