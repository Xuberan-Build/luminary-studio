import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

type DriveFile = {
  driveId?: string;
};

const ROOT_ID = process.argv[2] || process.env.GOOGLE_DRIVE_FOLDER_ID;
const webhookUrl = process.argv[3] || process.env.GOOGLE_DRIVE_WEBHOOK_URL;

if (!ROOT_ID) {
  console.error('Missing root folder ID. Pass it as an argument or set GOOGLE_DRIVE_FOLDER_ID.');
  process.exit(1);
}

if (!webhookUrl) {
  console.error('Missing webhook URL. Pass it as an argument or set GOOGLE_DRIVE_WEBHOOK_URL.');
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
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function getRootMeta(folderId: string): Promise<DriveFile> {
  const res = await drive.files.get({
    fileId: folderId,
    fields: 'driveId',
    supportsAllDrives: true,
  });
  return res.data as DriveFile;
}

async function register() {
  const token = process.env.GOOGLE_DRIVE_WEBHOOK_TOKEN;
  if (!token) {
    console.error('Missing GOOGLE_DRIVE_WEBHOOK_TOKEN in env.');
    process.exit(1);
  }

  const rootMeta = await getRootMeta(ROOT_ID);
  const startToken = await drive.changes.getStartPageToken({
    supportsAllDrives: true,
    driveId: rootMeta.driveId,
  });

  const channelId = randomUUID();
  const response = await drive.changes.watch({
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      token,
    },
    pageToken: startToken.data.startPageToken || undefined,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    driveId: rootMeta.driveId,
  });

  console.log('Drive webhook registered.');
  console.log('Channel ID:', response.data.id);
  console.log('Resource ID:', response.data.resourceId);
  console.log('Expiration:', response.data.expiration);
}

register().catch((error) => {
  console.error('Webhook registration failed:', error?.message || error);
  process.exit(1);
});
