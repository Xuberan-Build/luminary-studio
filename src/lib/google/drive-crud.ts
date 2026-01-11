import { buildDocsClient, buildDriveClient } from './drive-auth';
import { ensureFolderPath, resolveFolderPath } from './drive-paths';

export async function createFolder(rootId: string, folderPath: string) {
  return ensureFolderPath(rootId, folderPath);
}

export async function createDoc(options: {
  rootId: string;
  title: string;
  folderPath?: string;
  content?: string;
}) {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  const docs = buildDocsClient(['https://www.googleapis.com/auth/documents']);

  let parentId = options.rootId;
  if (options.folderPath) {
    const resolved = await ensureFolderPath(options.rootId, options.folderPath);
    parentId = resolved.folderId;
  }

  const created = await drive.files.create({
    requestBody: {
      name: options.title,
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

  if (options.content?.trim()) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: options.content,
            },
          },
        ],
      },
    });
  }

  return { docId };
}

export async function updateDoc(options: { docId: string; content: string }) {
  const docs = buildDocsClient(['https://www.googleapis.com/auth/documents']);
  const existing = await docs.documents.get({
    documentId: options.docId,
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

  if (options.content) {
    requests.push({
      insertText: {
        location: { index: 1 },
        text: options.content,
      },
    });
  }

  await docs.documents.batchUpdate({
    documentId: options.docId,
    requestBody: {
      requests,
    },
  });

  return { docId: options.docId };
}

export async function moveFile(options: {
  rootId: string;
  fileId: string;
  folderPath?: string;
  folderId?: string;
}) {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  let targetFolderId = options.folderId;

  if (!targetFolderId && options.folderPath) {
    const resolved = await resolveFolderPath(options.rootId, options.folderPath);
    targetFolderId = resolved.folderId;
  }

  if (!targetFolderId) {
    throw new Error('Missing target folder.');
  }

  const existing = await drive.files.get({
    fileId: options.fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });

  const previousParents = (existing.data.parents || []).join(',');

  await drive.files.update({
    fileId: options.fileId,
    addParents: targetFolderId,
    removeParents: previousParents,
    supportsAllDrives: true,
  });

  return { fileId: options.fileId, folderId: targetFolderId };
}

export async function renameFile(options: { fileId: string; name: string }) {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  await drive.files.update({
    fileId: options.fileId,
    requestBody: { name: options.name },
    supportsAllDrives: true,
  });

  return { fileId: options.fileId, name: options.name };
}

export async function deleteFile(options: { fileId: string }) {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  await drive.files.delete({
    fileId: options.fileId,
    supportsAllDrives: true,
  });

  return { fileId: options.fileId };
}
