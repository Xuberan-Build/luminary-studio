import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime?: string;
  driveId?: string;
};

type FileRecord = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  parentId: string;
  path: string;
  depth: number;
  isFolder: boolean;
};

const ROOT_ID = process.argv[2] || process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!ROOT_ID) {
  console.error('Missing root folder ID. Pass it as an argument or set GOOGLE_DRIVE_FOLDER_ID.');
  process.exit(1);
}

const rootId = ROOT_ID as string;

function getCredentials() {
  const serviceAccountFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
    const raw = fs.readFileSync(serviceAccountFile, 'utf8');
    const json = JSON.parse(raw);
    return { clientEmail: json.client_email, privateKey: json.private_key };
  }

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

const credentials = getCredentials();
let privateKey = credentials.privateKey;

if (!credentials.clientEmail || !privateKey) {
  console.error('Missing Google Drive credentials. Set GOOGLE_SERVICE_ACCOUNT_FILE, GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64, or GOOGLE_DRIVE_CLIENT_EMAIL/GOOGLE_DRIVE_PRIVATE_KEY.');
  process.exit(1);
}

if (privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
  console.error('GOOGLE_DRIVE_PRIVATE_KEY is malformed. Ensure it includes BEGIN/END lines and \\n escapes.');
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: credentials.clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

async function getRootMeta(folderId: string): Promise<DriveFile> {
  const res = await drive.files.get({
    fileId: folderId,
    fields: 'id,name,mimeType,driveId',
    supportsAllDrives: true,
  });
  return res.data as DriveFile;
}

async function listChildren(folderId: string, driveId?: string): Promise<DriveFile[]> {
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

function toCsv(records: FileRecord[]): string {
  const header = [
    'id',
    'name',
    'mimeType',
    'modifiedTime',
    'parentId',
    'path',
    'depth',
    'isFolder',
  ];

  const rows = records.map((r) => [
    r.id,
    r.name,
    r.mimeType,
    r.modifiedTime,
    r.parentId,
    r.path,
    r.depth.toString(),
    r.isFolder ? 'true' : 'false',
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

async function audit() {
  console.log('Starting Drive audit...');
  console.log(`Root folder: ${rootId}`);

  const rootMeta = await getRootMeta(rootId);
  const driveId = rootMeta.driveId;
  const rootName = rootMeta.name || 'Root';

  const records: FileRecord[] = [];
  const queue: Array<{ id: string; path: string; depth: number }> = [
    { id: rootId, path: `/${rootName}`, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const children = await listChildren(current.id, driveId);

    for (const child of children) {
      const isFolder = child.mimeType === 'application/vnd.google-apps.folder';
      const recordPath = `${current.path}/${child.name}`;
      const record: FileRecord = {
        id: child.id,
        name: child.name,
        mimeType: child.mimeType,
        modifiedTime: child.modifiedTime || '',
        parentId: current.id,
        path: recordPath,
        depth: current.depth + 1,
        isFolder,
      };
      records.push(record);

      if (isFolder) {
        queue.push({ id: child.id, path: recordPath, depth: current.depth + 1 });
      }
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.resolve(__dirname, 'output');
  const csvPath = path.join(outDir, `drive-audit-${timestamp}.csv`);
  const jsonPath = path.join(outDir, `drive-audit-${timestamp}.json`);

  fs.writeFileSync(csvPath, toCsv(records));
  fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2));

  const folderCount = records.filter((r) => r.isFolder).length;
  const fileCount = records.length - folderCount;

  console.log(`Audit complete. Folders: ${folderCount}, Files: ${fileCount}`);
  console.log(`CSV: ${csvPath}`);
  console.log(`JSON: ${jsonPath}`);
}

audit().catch((error) => {
  console.error('Drive audit failed:', error?.message || error);
  process.exit(1);
});
