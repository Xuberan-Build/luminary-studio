import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const channelId = process.argv[2];
const resourceId = process.argv[3];
const expiration = process.argv[4];

if (!channelId || !resourceId || !expiration) {
  console.error('Usage: npm run drive:record-webhook -- <channelId> <resourceId> <expirationMs>');
  process.exit(1);
}

const sheetId = process.env.OPS_CONTROL_SHEET_ID;
if (!sheetId) {
  console.error('Missing OPS_CONTROL_SHEET_ID in env.');
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

async function ensureTab(tabName: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const hasTab = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tabName);
  if (hasTab) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });
}

async function writeRow() {
  const tab = 'Webhook Renewals';
  await ensureTab(tab);

  const expMs = Number(expiration);
  const expDate = Number.isFinite(expMs) ? new Date(expMs).toISOString() : '';
  const now = new Date().toISOString();

  const values = [[
    'drive-index',
    channelId,
    resourceId,
    expiration,
    expDate,
    now,
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A:F`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log('Webhook renewal logged in Ops Control.');
}

writeRow().catch((error) => {
  console.error('Webhook record failed:', error?.message || error);
  process.exit(1);
});
