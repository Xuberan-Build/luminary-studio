#!/usr/bin/env tsx
/**
 * Normalize email casing/spacing in CRM Google Sheets and report data quality.
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SHEET_ID =
  process.env.GOOGLE_CRM_SHEET_ID ||
  process.env.GOOGLE_SHEET_ID ||
  '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8';

type SheetConfig = {
  name: string;
  range: string;
  emailCol: number;
  productCol?: number;
  purchaseDateCol?: number;
  amountCol?: number;
};

const SHEETS: SheetConfig[] = [
  { name: 'Customers', range: 'Customers!A:T', emailCol: 0 },
  { name: 'Customer Insights', range: 'Customer Insights!A:Z', emailCol: 0, productCol: 1 },
  { name: 'Purchases', range: 'Purchases!A:U', emailCol: 1, productCol: 3, purchaseDateCol: 17, amountCol: 18 },
  { name: 'Beta Participants', range: 'Beta Participants!A:K', emailCol: 1 },
];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

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

async function main() {
  const credentials = getGoogleCredentials();
  if (!credentials.client_email || !credentials.private_key) {
    console.error('Missing Google Sheets credentials.');
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  for (const config of SHEETS) {
    let response;
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: config.range,
      });
    } catch (error: any) {
      const message = error?.message || '';
      console.log(`\n${config.name} summary:`);
      console.log(`- skipped (missing tab or range): ${message}`);
      continue;
    }

    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log(`\n${config.name}: no rows`);
      continue;
    }

    const updates: { range: string; values: string[][] }[] = [];
    const keyCounts = new Map<string, number>();
    let missingEmail = 0;
    let missingProduct = 0;
    let missingPurchaseDate = 0;
    let missingAmount = 0;

    rows.forEach((row, index) => {
      if (index === 0) return;
      const emailRaw = row[config.emailCol] || '';
      if (!emailRaw) {
        missingEmail += 1;
        return;
      }

      const email = normalizeEmail(emailRaw);
      let key = email;
      if (config.productCol !== undefined && config.purchaseDateCol !== undefined) {
        const product = (row[config.productCol] || '').trim();
        const purchaseDate = (row[config.purchaseDateCol] || '').trim();
        key = `${email}::${product}::${purchaseDate}`;
      } else if (config.productCol !== undefined) {
        const product = (row[config.productCol] || '').trim();
        key = `${email}::${product}`;
      }
      keyCounts.set(key, (keyCounts.get(key) || 0) + 1);

      if (email !== emailRaw) {
        const colLetter = String.fromCharCode('A'.charCodeAt(0) + config.emailCol);
        updates.push({
          range: `${config.name}!${colLetter}${index + 1}`,
          values: [[email]],
        });
      }

      if (config.productCol !== undefined) {
        const product = (row[config.productCol] || '').trim();
        if (!product) missingProduct += 1;
      }

      if (config.purchaseDateCol !== undefined) {
        const purchaseDate = (row[config.purchaseDateCol] || '').trim();
        if (!purchaseDate) missingPurchaseDate += 1;
      }

      if (config.amountCol !== undefined) {
        const amount = (row[config.amountCol] || '').trim();
        if (!amount) missingAmount += 1;
      }
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }

    const duplicateKeys = Array.from(keyCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));

    console.log(`\n${config.name} summary:`);
    console.log(`- rows: ${rows.length - 1}`);
    console.log(`- updated emails: ${updates.length}`);
    console.log(`- missing emails: ${missingEmail}`);
    if (config.productCol !== undefined) {
      console.log(`- missing product: ${missingProduct}`);
    }
    if (config.purchaseDateCol !== undefined) {
      console.log(`- missing purchase date: ${missingPurchaseDate}`);
    }
    if (config.amountCol !== undefined) {
      console.log(`- missing amount: ${missingAmount}`);
    }
    const label =
      config.productCol !== undefined
        ? config.purchaseDateCol !== undefined
          ? 'duplicate email+product+date'
          : 'duplicate email+product'
        : 'duplicate emails';
    console.log(`- ${label}: ${duplicateKeys.length}`);
    duplicateKeys.slice(0, 10).forEach((d) => {
      console.log(`  - ${d.key} (${d.count})`);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
