import { buildDriveClient } from './google-auth';

export type DriveMeta = {
  driveId?: string;
  rootName: string;
};

function escapeQueryValue(value: string) {
  return value.replace(/'/g, "\\'");
}

export async function getDriveMeta(rootId: string): Promise<DriveMeta> {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  const res = await drive.files.get({
    fileId: rootId,
    fields: 'id,name,driveId',
    supportsAllDrives: true,
  });

  return {
    driveId: res.data.driveId || undefined,
    rootName: res.data.name || 'Drive',
  };
}

export async function ensureFolderPath(rootId: string, folderPath: string) {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  const meta = await getDriveMeta(rootId);
  const parts = folderPath
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  let currentId = rootId;
  for (const part of parts) {
    const query = [
      `'${currentId}' in parents`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      `name = '${escapeQueryValue(part)}'`,
      'trashed = false',
    ].join(' and ');

    const res = await drive.files.list({
      q: query,
      fields: 'files(id,name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: meta.driveId,
      corpora: meta.driveId ? 'drive' : undefined,
    });

    const existing = (res.data.files || [])[0];
    if (existing?.id) {
      currentId = existing.id;
      continue;
    }

    const created = await drive.files.create({
      requestBody: {
        name: part,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [currentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    if (!created.data.id) {
      throw new Error(`Failed to create folder: ${part}`);
    }

    currentId = created.data.id;
  }

  return { folderId: currentId, driveId: meta.driveId };
}

export async function resolveFolderPath(rootId: string, folderPath: string) {
  const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);
  const meta = await getDriveMeta(rootId);
  const parts = folderPath
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  let currentId = rootId;
  for (const part of parts) {
    const query = [
      `'${currentId}' in parents`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      `name = '${escapeQueryValue(part)}'`,
      'trashed = false',
    ].join(' and ');

    const res = await drive.files.list({
      q: query,
      fields: 'files(id,name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: meta.driveId,
      corpora: meta.driveId ? 'drive' : undefined,
    });

    const existing = (res.data.files || [])[0];
    if (!existing?.id) {
      throw new Error(`Folder not found: ${part}`);
    }

    currentId = existing.id;
  }

  return { folderId: currentId, driveId: meta.driveId };
}
