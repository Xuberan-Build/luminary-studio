import { readFileSync } from 'fs';
import { buildDocsClient } from './google-auth';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const docId = positional[0];
const fromIndex = args.indexOf('--from');
const sourcePath = fromIndex !== -1 ? args[fromIndex + 1] : undefined;

if (!docId || !sourcePath) {
  console.error('Usage: npm run drive:update-doc -- <docId> --from ./local.md');
  process.exit(1);
}

const content = readFileSync(sourcePath, 'utf8');
const docs = buildDocsClient([
  'https://www.googleapis.com/auth/documents',
]);

async function run() {
  const doc = await docs.documents.get({ documentId: docId });
  const body = doc.data.body?.content || [];
  const endIndex = body.reduce((max, node) => Math.max(max, node.endIndex || 0), 1);

  const requests: any[] = [];
  if (endIndex > 1) {
    requests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: endIndex - 1 },
      },
    });
  }

  if (content) {
    requests.push({
      insertText: {
        location: { index: 1 },
        text: content,
      },
    });
  }

  if (requests.length === 0) {
    console.log('No updates to apply.');
    return;
  }

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests },
  });

  console.log('Document updated.');
}

run().catch((error) => {
  console.error('Update doc failed:', error?.message || error);
  process.exit(1);
});
