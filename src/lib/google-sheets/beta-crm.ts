import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

type BetaEnrollmentRow = {
  email: string;
  name?: string | null;
  userId: string;
  betaParticipantId: string;
  cohortName: string;
  status: string;
  currentRite: string | null;
  enrollmentDate: string;
  programStartDate: string;
  programEndDate: string;
  notes?: string | null;
};

const TAB_NAME = 'Beta Participants';
const HEADERS = [
  'Enrollment Timestamp',
  'Email',
  'Name',
  'User ID',
  'Beta Participant ID',
  'Cohort',
  'Status',
  'Current Rite',
  'Program Start',
  'Program End',
  'Notes',
];

function getGoogleCredentials() {
  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  let fileCredentials: { client_email?: string; private_key?: string } | null = null;
  if (serviceAccountPath) {
    try {
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(process.cwd(), serviceAccountPath);
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      fileCredentials = JSON.parse(raw);
    } catch {
      fileCredentials = null;
    }
  }

  const client_email = fileCredentials?.client_email || process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let private_key = fileCredentials?.private_key || process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  if (private_key && private_key.includes('\\n')) {
    private_key = private_key.replace(/\\n/g, '\n');
  }
  return { client_email, private_key };
}

function getSpreadsheetId() {
  return (
    process.env.GOOGLE_CRM_SHEET_ID ||
    process.env.GOOGLE_SHEET_ID ||
    '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8'
  );
}

async function ensureTab(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = getSpreadsheetId();
  const sheetMeta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title))',
  });

  const existing = (sheetMeta.data.sheets || []).find(
    (sheet) => sheet.properties?.title === TAB_NAME
  );

  if (!existing?.properties?.sheetId) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: TAB_NAME,
              },
            },
          },
        ],
      },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TAB_NAME}!A1:K1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [HEADERS],
    },
  });
}

async function findExistingRow(
  sheets: ReturnType<typeof google.sheets>,
  email: string
): Promise<number | null> {
  const spreadsheetId = getSpreadsheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TAB_NAME}!B:B`,
  });

  const rows = response.data.values || [];
  const idx = rows.findIndex((row, index) => index > 0 && row[0] === email);
  return idx > -1 ? idx + 1 : null;
}

export async function appendBetaEnrollmentToCRM(payload: BetaEnrollmentRow): Promise<void> {
  const spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    return;
  }

  const credentials = getGoogleCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  await ensureTab(sheets);

  const existingRow = await findExistingRow(sheets, payload.email);
  const rowValues = [
    payload.enrollmentDate,
    payload.email,
    payload.name || '',
    payload.userId,
    payload.betaParticipantId,
    payload.cohortName,
    payload.status,
    payload.currentRite || '',
    payload.programStartDate,
    payload.programEndDate,
    payload.notes || '',
  ];

  if (existingRow) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB_NAME}!A${existingRow}:K${existingRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowValues],
      },
    });
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TAB_NAME}!A:K`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowValues],
    },
  });
}
