import * as fs from 'fs';
import { buildDocsClient } from './google-auth';

const args = process.argv.slice(2);
const docId = args[0];
const fromIndex = args.indexOf('--from');
const fromPath = fromIndex !== -1 ? args[fromIndex + 1] : '';
const contentIndex = args.indexOf('--content');
const content = contentIndex !== -1 ? args[contentIndex + 1] : '';

if (!docId) {
  console.error('Usage: npm run drive:update-doc -- <docId> [--from path] [--content "text"]');
  process.exit(1);
}

if (!fromPath && !content) {
  console.error('Provide --from <path> or --content "<text>" to update the doc.');
  process.exit(1);
}

async function run() {
  const docs = buildDocsClient(['https://www.googleapis.com/auth/documents']);
  const newContent = fromPath ? fs.readFileSync(fromPath, 'utf8') : content;

  const existing = await docs.documents.get({
    documentId: docId,
  });

  const body = existing.data.body;
  const endIndex = body?.content?.[body.content.length - 1]?.endIndex;

  const requests: Array<Record<string, unknown>> = [];
  if (typeof endIndex === 'number' && endIndex > 1) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex,
        },
      },
    });
  }

  if (newContent) {
    requests.push({
      insertText: {
        location: { index: 1 },
        text: newContent,
      },
    });
  }

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests,
    },
  });

  console.log('Doc updated.');
  console.log(`Doc ID: ${docId}`);
}

run().catch((error) => {
  console.error('Update doc failed:', error?.message || error);
  process.exit(1);
});
