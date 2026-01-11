import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

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

const auditPath = process.argv[2] || '';
if (!auditPath) {
  console.error('Provide audit JSON path: npm run drive:content-index -- <path>');
  process.exit(1);
}

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
  console.error('Missing Google Drive credentials.');
  process.exit(1);
}

if (privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const auth = new google.auth.JWT({
  email: credentials.clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = process.env.CONTENT_INDEX_SHEET_ID;
if (!SHEET_ID) {
  console.error('Missing CONTENT_INDEX_SHEET_ID env var.');
  process.exit(1);
}

async function writeIndex(records: FileRecord[]) {
  const header = [
    'id',
    'name',
    'mimeType',
    'path',
    'parentId',
    'modifiedTime',
    'depth',
    'isFolder',
    'status',
    'notes',
  ];

  const rows = records.map((r) => [
    r.id,
    r.name,
    r.mimeType,
    r.path,
    r.parentId,
    r.modifiedTime,
    r.depth.toString(),
    r.isFolder ? 'true' : 'false',
    '',
    '',
  ]);

  const values = [header, ...rows];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: 'Content Index!A:Z',
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Content Index!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

const raw = fs.readFileSync(auditPath, 'utf8');
const records = JSON.parse(raw) as FileRecord[];

writeIndex(records)
  .then(() => console.log('Content Index updated.'))
  .catch((error) => {
    console.error('Content Index update failed:', error?.message || error);
    process.exit(1);
  });
