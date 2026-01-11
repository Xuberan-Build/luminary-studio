import { google } from 'googleapis';
import { PurchaseRecord } from '../email/sequence-manager';

/**
 * Fetch all purchases from Google Sheets
 */
export async function fetchPurchasesFromSheet(): Promise<PurchaseRecord[]> {
  const credentials = {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.includes('\\n')
      ? process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      : process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8';

  // Fetch all rows from Purchases sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Purchases!A:N', // Columns A-N (includes new email tracking columns)
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    return [];
  }

  // Skip header row
  const dataRows = rows.slice(1);

  // Map rows to PurchaseRecord objects
  return dataRows.map(row => {
    // Extract product slug from product name or GPT link
    // Assumes column D is product name, column G is GPT link
    const productName = row[3] || '';
    const gptLink = row[6] || '';

    // Try to extract slug from GPT link or infer from product name
    let productSlug = 'business-alignment'; // Default
    if (productName.includes('Structure')) {
      productSlug = 'quantum-structure-profit-scale';
    } else if (gptLink.includes('quantum-structure')) {
      productSlug = 'quantum-structure-profit-scale';
    }

    return {
      timestamp: row[0] || '',
      email: row[1] || '',
      name: row[2] || '',
      product: productName,
      productSlug,
      day1EmailSent: row[9] || '', // Column J
      day3EmailSent: row[10] || '', // Column K
      day7EmailSent: row[11] || '', // Column L
      sequenceStatus: row[13] || '', // Column N
    };
  });
}

/**
 * Update sheet with email send status
 */
export async function updateSheetEmailStatus(
  email: string,
  emailType: 'day1' | 'day3' | 'day7'
): Promise<void> {
  const credentials = {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.includes('\\n')
      ? process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      : process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8';

  // First, find the row for this email
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Purchases!B:N',
  });

  const rows = response.data.values || [];
  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  // Find the row index (add 2 to account for header row and 0-indexing)
  const rowIndex = dataRows.findIndex(row => row[0] === email);
  if (rowIndex === -1) {
    console.error(`Email not found in sheet: ${email}`);
    return;
  }

  const actualRowNumber = rowIndex + 2; // +1 for header, +1 for 1-based indexing
  const timestamp = new Date().toISOString();

  // Determine which column to update
  const columnMap = {
    day1: 'J', // Column J
    day3: 'K', // Column K
    day7: 'L', // Column L
  };

  const column = columnMap[emailType];
  const range = `Purchases!${column}${actualRowNumber}`;

  // Update the cell with timestamp
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[timestamp]],
    },
  });

  // Also update "Last Email Sent" column (M)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Purchases!M${actualRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[timestamp]],
    },
  });
}

/**
 * Update sheet to mark customer as unsubscribed
 */
export async function updateSheetUnsubscribe(email: string): Promise<void> {
  const credentials = {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.includes('\\n')
      ? process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      : process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8';

  // Find the row for this email
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Purchases!B:N',
  });

  const rows = response.data.values || [];
  const dataRows = rows.slice(1);

  const rowIndex = dataRows.findIndex(row => row[0] === email);
  if (rowIndex === -1) {
    console.error(`Email not found in sheet: ${email}`);
    return;
  }

  const actualRowNumber = rowIndex + 2;

  // Update Sequence Status column (N) to "unsubscribed"
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Purchases!N${actualRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['unsubscribed']],
    },
  });
}
