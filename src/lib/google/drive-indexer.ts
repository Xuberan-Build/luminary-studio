import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase/server';

export type DriveIndexRecord = {
  doc_id: string;
  name: string;
  mime_type: string;
  path: string;
  parent_id: string | null;
  modified_time: string | null;
  depth: number;
  is_folder: boolean;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime?: string;
  driveId?: string;
};

function getCredentials() {
  const base64 = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    const raw = Buffer.from(base64, 'base64').toString('utf8');
    const json = JSON.parse(raw);
    return { clientEmail: json.client_email, privateKey: json.private_key };
  }

  return {
    clientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };
}

function buildDriveClient() {
  const credentials = getCredentials();
  let privateKey = credentials.privateKey;

  if (!credentials.clientEmail || !privateKey) {
    throw new Error('Missing Google Drive credentials.');
  }

  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email: credentials.clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

async function getRootMeta(drive: any, folderId: string): Promise<DriveFile> {
  const res = await drive.files.get({
    fileId: folderId,
    fields: 'id,name,mimeType,driveId',
    supportsAllDrives: true,
  });
  return res.data as DriveFile;
}

async function listChildren(drive: any, folderId: string, driveId?: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id,name,mimeType,parents,modifiedTime,driveId)',
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: driveId,
      corpora: driveId ? 'drive' : undefined,
      pageToken,
    });

    if (res.data.files) {
      files.push(...(res.data.files as DriveFile[]));
    }

    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return files;
}

export async function fetchDriveIndex(rootId: string) {
  const drive = buildDriveClient();
  const rootMeta = await getRootMeta(drive, rootId);
  const driveId = rootMeta.driveId;
  const rootName = rootMeta.name || 'Drive';

  const records: DriveIndexRecord[] = [];
  const queue: Array<{ id: string; path: string; depth: number }> = [
    { id: rootId, path: `/${rootName}`, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const children = await listChildren(drive, current.id, driveId);

    for (const child of children) {
      const isFolder = child.mimeType === 'application/vnd.google-apps.folder';
      const recordPath = `${current.path}/${child.name}`;
      records.push({
        doc_id: child.id,
        name: child.name,
        mime_type: child.mimeType,
        path: recordPath,
        parent_id: current.id || null,
        modified_time: child.modifiedTime ? new Date(child.modifiedTime).toISOString() : null,
        depth: current.depth + 1,
        is_folder: isFolder,
      });

      if (isFolder) {
        queue.push({ id: child.id, path: recordPath, depth: current.depth + 1 });
      }
    }
  }

  return records;
}

export async function syncDriveIndex(rootId: string) {
  const records = await fetchDriveIndex(rootId);
  const now = new Date().toISOString();

  const rows = records.map((r) => ({
    ...r,
    last_synced_at: now,
  }));

  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin
      .from('content_index')
      .upsert(chunk, { onConflict: 'doc_id' });
    if (error) {
      throw error;
    }
  }

  return { total: rows.length };
}
