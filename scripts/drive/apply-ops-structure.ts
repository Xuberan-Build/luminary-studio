import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

const ROOT_ID = process.argv[2] || process.env.GOOGLE_DRIVE_FOLDER_ID;
if (!ROOT_ID) {
  console.error('Missing root folder ID. Pass it as an argument or set GOOGLE_DRIVE_FOLDER_ID.');
  process.exit(1);
}

const rootId: string = ROOT_ID;

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
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

async function findChildByName(parentId: string, name: string, mimeType: string) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name.replace(/'/g, "\\'")}' and mimeType = '${mimeType}' and trashed = false`,
    fields: 'files(id,name,mimeType)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return (res.data.files || [])[0] as DriveFile | undefined;
}

async function ensureFolder(parentId: string, name: string) {
  const existing = await findChildByName(parentId, name, 'application/vnd.google-apps.folder');
  if (existing) {
    return existing.id;
  }
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  return res.data.id as string;
}

async function ensureShortcut(parentId: string, name: string, targetId: string) {
  const existing = await findChildByName(parentId, name, 'application/vnd.google-apps.shortcut');
  if (existing) {
    return existing.id;
  }
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.shortcut',
      parents: [parentId],
      shortcutDetails: { targetId },
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  return res.data.id as string;
}

async function ensureSheet(parentId: string, title: string, tabs: string[]) {
  const existing = await findChildByName(parentId, title, 'application/vnd.google-apps.spreadsheet');
  if (existing) {
    return existing.id;
  }

  const created = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });

  const spreadsheetId = created.data.id as string;

  if (tabs.length > 0) {
    const requests = tabs.map((tab) => ({
      addSheet: { properties: { title: tab } },
    }));
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }

  return spreadsheetId;
}

async function moveFile(fileId: string, newParentId: string) {
  const file = await drive.files.get({
    fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });
  const previousParents = (file.data.parents || []).join(',');

  await drive.files.update({
    fileId,
    addParents: newParentId,
    removeParents: previousParents,
    fields: 'id, parents',
    supportsAllDrives: true,
  });
}

async function main() {
  console.log('Applying Ops structure updates...');

  const operations = await ensureFolder(rootId, 'Operations');
  const growth = await ensureFolder(rootId, 'Growth');
  const delivery = await ensureFolder(rootId, 'Delivery');

  const crmFolder = await ensureFolder(operations, 'CRM + BI');
  const deliveryProduct = await ensureFolder(delivery, 'Product');
  const builtProducts = await ensureFolder(delivery, 'Built Products');

  const productMetricsSheet = await ensureSheet(
    await ensureFolder(delivery, 'Product Metrics'),
    'Quantum Strategies - Product Metrics',
    ['Overview', 'Completion', 'Retention', 'Revenue']
  );

  const growthProducts = await ensureFolder(growth, 'Products');
  const deliveryPrds = await ensureFolder(deliveryProduct, 'PRDs');
  await ensureShortcut(growthProducts, 'Product PRDs (Shortcut)', deliveryPrds);

  const crmFile = await findChildByName(
    await ensureFolder(growth, 'Partnerships'),
    'Quantum Strategies - Customer CRM',
    'application/vnd.google-apps.spreadsheet'
  );

  if (crmFile) {
    await moveFile(crmFile.id, crmFolder);
    console.log('Moved CRM sheet into Operations/CRM + BI.');
  } else {
    console.log('CRM sheet not found under Growth/Partnerships; skipping move.');
  }

  console.log('Created/verified Built Products folder:', builtProducts);
  console.log('Created Product Metrics sheet:', productMetricsSheet);
  console.log('Ops structure updates complete.');
}

main().catch((error) => {
  console.error('Ops update failed:', error?.message || error);
  process.exit(1);
});
