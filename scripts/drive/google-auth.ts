import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export type GoogleCredentials = {
  clientEmail: string;
  privateKey: string;
};

export function getGoogleCredentials(): GoogleCredentials {
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
    clientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL || '',
    privateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY || '',
  };
}

export function buildJwt(scopes: string[]) {
  const credentials = getGoogleCredentials();
  let privateKey = credentials.privateKey;

  if (!credentials.clientEmail || !privateKey) {
    throw new Error('Missing Google credentials. Check GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_DRIVE_CLIENT_EMAIL/GOOGLE_DRIVE_PRIVATE_KEY.');
  }

  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return new google.auth.JWT({
    email: credentials.clientEmail,
    key: privateKey,
    scopes,
  });
}

export function buildDriveClient(scopes: string[] = ['https://www.googleapis.com/auth/drive']) {
  const auth = buildJwt(scopes);
  return google.drive({ version: 'v3', auth });
}

export function buildDocsClient(scopes: string[] = ['https://www.googleapis.com/auth/documents']) {
  const auth = buildJwt(scopes);
  return google.docs({ version: 'v1', auth });
}

export function buildSheetsClient(scopes: string[] = ['https://www.googleapis.com/auth/spreadsheets']) {
  const auth = buildJwt(scopes);
  return google.sheets({ version: 'v4', auth });
}
