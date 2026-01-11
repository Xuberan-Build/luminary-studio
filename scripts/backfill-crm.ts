/**
 * Backfill CRM sheets from Supabase (Purchases, Customers, Customer Insights).
 *
 * - Purchases sheet becomes authoritative for drips.
 * - Supabase is the source of truth for purchase data.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { PRODUCTS } from '../src/lib/constants/products';
import { syncCustomer, storeCustomerInsights } from '../src/lib/google-sheets/customer-sync';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const CRM_SHEET_ID =
  process.env.GOOGLE_CRM_SHEET_ID || '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8';

const SERVICE_ACCOUNT_FILE =
  process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
  path.resolve(__dirname, '../.secrets/quantum-aigent-ebaf71fed4d6.json');

process.env.GOOGLE_SERVICE_ACCOUNT_FILE = SERVICE_ACCOUNT_FILE;

const serviceAccount = (() => {
  if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
})();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const purchaseHeaders = [
  'Timestamp',
  'Email',
  'Name',
  'Product',
  'Amount',
  'Stripe Session ID',
  'GPT Link',
  'Email Sent',
  'Status',
  'Day 1 Email Sent',
  'Day 3 Email Sent',
  'Day 7 Email Sent',
  'Last Email Sent',
  'Sequence Status',
  'Product Slugs',
  'User ID',
  'Product Access IDs',
  'Purchase Date',
  'Amount Paid',
  'Stripe Payment Intent ID',
  'Stripe Customer ID',
];

function formatMoney(amount: number | null | undefined) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';
  return `$${Number(amount).toFixed(2)}`;
}

async function getSheetsClient() {
  const credentials = {
    client_email: serviceAccount?.client_email || process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: serviceAccount?.private_key || process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };
  if (credentials.private_key && credentials.private_key.includes('\\n')) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

async function ensurePurchaseHeaders(sheets: any) {
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Purchases!A1:U1',
  });
  const existing = (headerResponse.data.values || [])[0] || [];
  const matches = purchaseHeaders.every((h, i) => existing[i] === h);
  if (!matches) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: CRM_SHEET_ID,
      range: 'Purchases!A1:U1',
      valueInputOption: 'RAW',
      requestBody: { values: [purchaseHeaders] },
    });
  }
}

function buildPurchaseKey(email: string, product: string, purchaseDate: string) {
  return `${email}__${product}__${purchaseDate}`;
}

async function loadExistingPurchases(sheets: any) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Purchases!A:U',
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    return { sessionIds: new Set<string>(), fallbackKeys: new Set<string>() };
  }

  const header = rows[0] || [];
  const idx = {
    timestamp: header.indexOf('Timestamp'),
    email: header.indexOf('Email'),
    product: header.indexOf('Product'),
    sessionId: header.indexOf('Stripe Session ID'),
    purchaseDate: header.indexOf('Purchase Date'),
  };

  const sessionIds = new Set<string>();
  const fallbackKeys = new Set<string>();

  for (const row of rows.slice(1)) {
    const sessionId = row[idx.sessionId] || '';
    const email = row[idx.email] || '';
    const product = row[idx.product] || '';
    const purchaseDate = row[idx.purchaseDate] || row[idx.timestamp] || '';

    if (sessionId) {
      sessionIds.add(sessionId);
    } else if (email && product && purchaseDate) {
      fallbackKeys.add(buildPurchaseKey(email, product, purchaseDate));
    }
  }

  return { sessionIds, fallbackKeys };
}

async function loadExistingInsights(sheets: any) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Customer Insights!A:Z',
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    return new Set<string>();
  }

  const header = rows[0] || [];
  const idx = {
    email: header.indexOf('Email'),
    product: header.indexOf('Product'),
  };

  const keys = new Set<string>();
  for (const row of rows.slice(1)) {
    const email = row[idx.email] || '';
    const product = row[idx.product] || '';
    if (email && product) {
      keys.add(`${email}__${product}`);
    }
  }
  return keys;
}

async function main() {
  const sheets = await getSheetsClient();
  await ensurePurchaseHeaders(sheets);

  const { sessionIds, fallbackKeys } = await loadExistingPurchases(sheets);
  const existingInsights = await loadExistingInsights(sheets);

  console.log(`Existing purchase session IDs: ${sessionIds.size}`);
  console.log(`Existing purchase fallback keys: ${fallbackKeys.size}`);
  console.log(`Existing insight rows: ${existingInsights.size}`);

  const { data: accessRows, error: accessError } = await supabase
    .from('product_access')
    .select('id,user_id,product_slug,amount_paid,stripe_session_id,purchase_date,created_at');

  if (accessError) {
    throw new Error(`Failed to load product_access: ${accessError.message}`);
  }

  const userIds = Array.from(new Set((accessRows || []).map((row: any) => row.user_id).filter(Boolean)));
  const usersById = new Map<string, any>();

  if (userIds.length > 0) {
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id,email,name,stripe_customer_id,created_at')
      .in('id', userIds);

    if (userError) {
      throw new Error(`Failed to load users: ${userError.message}`);
    }

    (users || []).forEach((user: any) => usersById.set(user.id, user));
  }

  const rowsToAppend: any[] = [];
  let skipped = 0;

  for (const access of accessRows || []) {
    const user = usersById.get(access.user_id);
    const productConfig = PRODUCTS[access.product_slug];
    const productName = productConfig?.name || access.product_slug;
    const purchaseDate = access.purchase_date || access.created_at || new Date().toISOString();
    const timestamp = purchaseDate;
    const amountPaid = access.amount_paid ?? null;
    const sessionId = access.stripe_session_id || '';

    if (!user?.email) {
      skipped += 1;
      continue;
    }

    if (sessionId && sessionIds.has(sessionId)) {
      skipped += 1;
      continue;
    }

    const fallbackKey = buildPurchaseKey(user.email, productName, purchaseDate);
    if (!sessionId && fallbackKeys.has(fallbackKey)) {
      skipped += 1;
      continue;
    }

    rowsToAppend.push([
      timestamp,
      user.email,
      user.name || '',
      productName,
      formatMoney(amountPaid),
      sessionId,
      '',
      '',
      'Complete',
      '',
      '',
      '',
      '',
      '',
      access.product_slug,
      access.user_id,
      access.id,
      purchaseDate,
      amountPaid ?? '',
      '',
      user.stripe_customer_id || '',
    ]);
  }

  if (rowsToAppend.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: CRM_SHEET_ID,
      range: 'Purchases!A:U',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rowsToAppend },
    });
  }

  console.log(`Purchases appended: ${rowsToAppend.length}`);
  console.log(`Purchases skipped (existing or missing data): ${skipped}`);

  // Sync Customers sheet based on purchase data (chronological)
  const sortedAccess = [...(accessRows || [])].sort((a: any, b: any) => {
    const aDate = new Date(a.purchase_date || a.created_at || 0).getTime();
    const bDate = new Date(b.purchase_date || b.created_at || 0).getTime();
    return aDate - bDate;
  });

  for (const access of sortedAccess) {
    const user = usersById.get(access.user_id);
    if (!user?.email) continue;
    const productConfig = PRODUCTS[access.product_slug];
    const productName = productConfig?.name || access.product_slug;
    const purchaseDate = access.purchase_date || access.created_at || new Date().toISOString();
    const amountPaid = access.amount_paid ?? 0;

    await syncCustomer({
      email: user.email,
      name: user.name || user.email.split('@')[0],
      purchaseDate,
      product: productName,
      amount: amountPaid,
    });
  }

  // Backfill Customer Insights for completed sessions
  const { data: sessions, error: sessionError } = await supabase
    .from('product_sessions')
    .select('id,user_id,product_slug,completed_at,placements')
    .not('completed_at', 'is', null);

  if (sessionError) {
    throw new Error(`Failed to load product_sessions: ${sessionError.message}`);
  }

  let insightsAdded = 0;
  let insightsSkipped = 0;
  for (const session of sessions || []) {
    const user = usersById.get(session.user_id);
    if (!user?.email) continue;
    const productConfig = PRODUCTS[session.product_slug];
    const productName = productConfig?.name || session.product_slug;
    const key = `${user.email}__${productName}`;

    if (existingInsights.has(key)) {
      insightsSkipped += 1;
      continue;
    }

    const placements = session.placements || {};
    const astro = placements.astrology || {};
    const hd = placements.human_design || {};
    const segmentTags = [hd.type, astro.sun, astro.moon, astro.rising].filter(Boolean).join(',');

    await storeCustomerInsights({
      email: user.email,
      product: productName,
      completionDate: session.completed_at || new Date().toISOString(),
      completionStatus: 'completed',
      sunSign: astro.sun,
      moonSign: astro.moon,
      risingSign: astro.rising,
      hdType: hd.type,
      hdStrategy: hd.strategy,
      hdAuthority: hd.authority,
      hdProfile: hd.profile,
      segmentTags,
      notes: `Backfilled from session ${session.id}`,
    });

    insightsAdded += 1;
  }

  console.log(`Customer insights added: ${insightsAdded}`);
  console.log(`Customer insights skipped: ${insightsSkipped}`);
  console.log('✅ Backfill complete');
}

main().catch((err) => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});
