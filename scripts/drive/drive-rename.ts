import { buildDriveClient } from './google-auth';

const args = process.argv.slice(2);
const fileId = args[0];
const nameIndex = args.indexOf('--name');
const name = nameIndex !== -1 ? args[nameIndex + 1] : '';

if (!fileId || !name) {
  console.error('Usage: npm run drive:rename -- <fileId> --name "New Name"');
  process.exit(1);
}

async function run() {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  await drive.files.update({
    fileId,
    requestBody: { name },
    supportsAllDrives: true,
  });

  console.log('File renamed.');
  console.log(`File ID: ${fileId}`);
  console.log(`Name: ${name}`);
}

run().catch((error) => {
  console.error('Rename failed:', error?.message || error);
  process.exit(1);
});
