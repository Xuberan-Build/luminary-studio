import * as fs from 'fs';
import { buildDocsClient, buildDriveClient } from './google-auth';
import { ensureFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const titleIndex = args.indexOf('--title');
const title = titleIndex !== -1 ? args[titleIndex + 1] : undefined;
const folderIndex = args.indexOf('--folder');
const folderPath = folderIndex !== -1 ? args[folderIndex + 1] : '';
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;
const fromIndex = args.indexOf('--from');
const fromPath = fromIndex !== -1 ? args[fromIndex + 1] : '';
const contentIndex = args.indexOf('--content');
const content = contentIndex !== -1 ? args[contentIndex + 1] : '';

if (!title) {
  console.error('Usage: npm run drive:create-doc -- --title "Doc Title" [--folder "Path"] [--from path] [--content "text"]');
  process.exit(1);
}

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

async function run() {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  const docs = buildDocsClient(['https://www.googleapis.com/auth/documents']);

  let parentId = rootId;
  if (folderPath) {
    const resolved = await ensureFolderPath(rootId, folderPath);
    parentId = resolved.folderId;
  }

  const created = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });

  const docId = created.data.id || '';
  if (!docId) {
    throw new Error('Failed to create doc.');
  }

  let initialContent = '';
  if (fromPath) {
    initialContent = fs.readFileSync(fromPath, 'utf8');
  } else if (content) {
    initialContent = content;
  }

  if (initialContent.trim()) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: initialContent,
            },
          },
        ],
      },
    });
  }

  console.log('Doc created.');
  console.log(`Doc ID: ${docId}`);
  console.log(`Title: ${title}`);
}

run().catch((error) => {
  console.error('Create doc failed:', error?.message || error);
  process.exit(1);
});
