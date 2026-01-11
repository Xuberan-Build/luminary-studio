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
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function findChildByName(parentId: string, name: string, mimeType: string) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name.replace(/'/g, "\\'")}' and mimeType = '${mimeType}' and trashed = false`,
    fields: 'files(id,name,mimeType,parents)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return (res.data.files || [])[0] as DriveFile | undefined;
}

async function moveFolder(folderId: string, targetParentId: string) {
  const current = await drive.files.get({
    fileId: folderId,
    fields: 'parents,name',
    supportsAllDrives: true,
  });
  const previousParents = (current.data.parents || []).join(',');

  await drive.files.update({
    fileId: folderId,
    addParents: targetParentId,
    removeParents: previousParents,
    fields: 'id, parents',
    supportsAllDrives: true,
  });
  console.log(`Moved "${current.data.name}" to new parent.`);
}

async function main() {
  console.log('Moving assets into new structure...');

  const growth = await findChildByName(ROOT_ID, 'Growth', 'application/vnd.google-apps.folder');
  if (!growth) {
    throw new Error('Growth folder not found.');
  }

  const growthContentLibrary = await findChildByName(
    growth.id,
    'Content Library',
    'application/vnd.google-apps.folder'
  );
  const growthEvents = await findChildByName(
    growth.id,
    'Events',
    'application/vnd.google-apps.folder'
  );

  if (!growthContentLibrary || !growthEvents) {
    throw new Error('Required Growth subfolders missing (Content Library or Events).');
  }

  const legacyContent = await findChildByName(
    growth.id,
    'Content',
    'application/vnd.google-apps.folder'
  );

  if (legacyContent) {
    await moveFolder(legacyContent.id, growthContentLibrary.id);
  } else {
    console.log('Legacy Content folder not found; skipping.');
  }

  const ritualDinnerParty = await findChildByName(
    growth.id,
    'Ritual dinner party',
    'application/vnd.google-apps.folder'
  );

  if (ritualDinnerParty) {
    await moveFolder(ritualDinnerParty.id, growthEvents.id);
  } else {
    console.log('Ritual dinner party folder not found; skipping.');
  }

  console.log('Asset moves complete.');
}

main().catch((error) => {
  console.error('Move failed:', error?.message || error);
  process.exit(1);
});
