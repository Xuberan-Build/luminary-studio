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

type FolderSpec = {
  name: string;
  children?: FolderSpec[];
};

type SheetSpec = {
  title: string;
  tabs: string[];
  parentId: string;
};

const ROOT_ID = process.argv[2] || process.env.GOOGLE_DRIVE_FOLDER_ID;
if (!ROOT_ID) {
  console.error('Missing root folder ID. Pass it as an argument or set GOOGLE_DRIVE_FOLDER_ID.');
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
  try {
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
  } catch (error: any) {
    console.error(`Failed to create folder: ${name} (parent: ${parentId})`);
    throw error;
  }
}

async function ensureShortcut(parentId: string, name: string, targetId: string) {
  const existing = await findChildByName(parentId, name, 'application/vnd.google-apps.shortcut');
  if (existing) {
    return existing.id;
  }
  try {
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
  } catch (error: any) {
    console.error(`Failed to create shortcut: ${name} (parent: ${parentId}, target: ${targetId})`);
    throw error;
  }
}

async function ensureSheet(spec: SheetSpec) {
  const existing = await findChildByName(spec.parentId, spec.title, 'application/vnd.google-apps.spreadsheet');
  if (existing) {
    return existing.id;
  }

  let spreadsheetId = '';
  try {
    const created = await drive.files.create({
      requestBody: {
        name: spec.title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [spec.parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });
    spreadsheetId = created.data.id as string;
  } catch (error: any) {
    console.error(`Failed to create sheet: ${spec.title}`);
    throw error;
  }

  if (spec.tabs.length > 0) {
    const requests = spec.tabs.map((title) => ({
      addSheet: { properties: { title } },
    }));

    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
    } catch (error: any) {
      console.error(`Failed to add tabs to sheet: ${spec.title}`);
      throw error;
    }
  }

  return spreadsheetId;
}

const structure: FolderSpec[] = [
  {
    name: 'Operations',
    children: [
      { name: 'Ops Control' },
      { name: 'CRM + BI' },
      { name: 'Unit Economics' },
      { name: 'Playbooks + SOPs' },
      { name: 'Admin + Legal' },
      { name: 'PPC' },
      { name: 'Lifecycle + Retention' },
      { name: 'Email Marketing' },
    ],
  },
  {
    name: 'Growth',
    children: [
      { name: 'Content Library' },
      { name: 'Brand' },
      { name: 'Strategy' },
      { name: 'Partnerships' },
      { name: 'Events' },
      { name: 'PPC Campaigns' },
      { name: 'Email Campaigns' },
    ],
  },
  {
    name: 'Delivery',
    children: [
      {
        name: 'Product',
        children: [
          { name: 'PRDs' },
          { name: 'Definitions' },
          { name: 'Deliverable Templates' },
        ],
      },
      { name: 'Services + Partnerships' },
      { name: 'Customer Results' },
    ],
  },
];

async function createStructure(parentId: string, nodes: FolderSpec[], map: Record<string, string>, prefix = '') {
  for (const node of nodes) {
    const folderId = await ensureFolder(parentId, node.name);
    const key = prefix ? `${prefix}/${node.name}` : node.name;
    map[key] = folderId;
    if (node.children && node.children.length) {
      await createStructure(folderId, node.children, map, key);
    }
  }
}

async function main() {
  console.log('Bootstrapping Drive structure...');
  const folderMap: Record<string, string> = {};
  await createStructure(ROOT_ID, structure, folderMap);

  const sheetSpecs: SheetSpec[] = [
    {
      title: 'Quantum Strategies - Ops Control',
      tabs: ['Overview', 'Content Queue', 'Product Pipeline', 'Playbooks', 'Projects'],
      parentId: folderMap['Operations/Ops Control'],
    },
    {
      title: 'Quantum Strategies - PPC CNS',
      tabs: ['Campaign Registry', 'Creative Tests', 'Budget & ROAS'],
      parentId: folderMap['Operations/PPC'],
    },
    {
      title: 'Quantum Strategies - Lifecycle & Retention',
      tabs: ['Lifecycle Map', 'Retention Cohorts', 'Email Sequences', 'Upsell Paths'],
      parentId: folderMap['Operations/Lifecycle + Retention'],
    },
  ];

  const sheetIds: Record<string, string> = {};
  for (const spec of sheetSpecs) {
    const id = await ensureSheet(spec);
    sheetIds[spec.title] = id;
  }

  if (folderMap['Growth/Products'] && folderMap['Delivery/Product/PRDs']) {
    await ensureShortcut(folderMap['Growth/Products'], 'Product PRDs (Shortcut)', folderMap['Delivery/Product/PRDs']);
  }

  console.log('Folders created/verified:');
  Object.entries(folderMap).forEach(([key, id]) => {
    console.log(`- ${key}: ${id}`);
  });

  console.log('Sheets created/verified:');
  Object.entries(sheetIds).forEach(([title, id]) => {
    console.log(`- ${title}: ${id}`);
  });

  console.log('Bootstrap complete.');
}

main().catch((error) => {
  console.error('Bootstrap failed:', error?.message || error);
  process.exit(1);
});
