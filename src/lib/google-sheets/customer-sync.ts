import { google } from 'googleapis';

/**
 * Customer Sync Manager
 * Creates/updates customer records in the Customers sheet
 */

export interface CustomerData {
  email: string;
  name: string;
  purchaseDate: string;
  product: string;
  amount: number;
}

export interface CustomerInsightData {
  email: string;
  product: string;
  completionDate?: string;
  completionStatus?: 'started' | 'completed';

  // Astrological
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;

  // Human Design
  hdType?: string;
  hdStrategy?: string;
  hdAuthority?: string;
  hdProfile?: string;

  // Business
  businessModel?: string;
  currentOffers?: string;
  currentPricing?: string;
  idealClient?: string;
  revenueGoal?: string;
  painPoints?: string;

  // AI Insights
  whatToSell?: string;
  howToSell?: string;
  pricingModel?: string;
  keyStrengths?: string;
  nextSteps?: string;

  // Segmentation
  segmentTags?: string;
  notes?: string;
}

/**
 * Create or update customer in Customers sheet
 */
export async function syncCustomer(data: CustomerData): Promise<void> {
  const credentials = {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

  // Check if customer exists
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Customers!A:T',
  });

  const rows = response.data.values || [];
  const existingCustomerIndex = rows.findIndex((row, index) =>
    index > 0 && row[0] === data.email // Skip header row
  );

  if (existingCustomerIndex > -1) {
    // Update existing customer
    const actualRow = existingCustomerIndex + 1; // Convert to 1-based index
    const existingCustomer = rows[existingCustomerIndex];

    // Update: Last Purchase Date, increment Total Purchases, add to Lifetime Value
    const totalPurchases = parseInt(existingCustomer[4] || '0') + 1;
    const existingLTV = parseFloat(existingCustomer[5]?.replace('$', '') || '0');
    const newLTV = existingLTV + data.amount;
    const productsOwned = existingCustomer[6]
      ? `${existingCustomer[6]}, ${data.product}`
      : data.product;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Customers!D${actualRow}:H${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.purchaseDate,              // D: Last Purchase Date
          totalPurchases.toString(),      // E: Total Purchases
          `$${newLTV.toFixed(2)}`,       // F: Lifetime Value
          productsOwned,                  // G: Products Owned
          data.product,                   // H: Last Product
        ]],
      },
    });

    console.log(`✅ Updated existing customer: ${data.email}`);
  } else {
    // Create new customer
    const newCustomer = [
      data.email,                         // A: Email
      data.name,                          // B: Name
      data.purchaseDate,                  // C: First Purchase Date
      data.purchaseDate,                  // D: Last Purchase Date
      '1',                                // E: Total Purchases
      `$${data.amount.toFixed(2)}`,      // F: Lifetime Value
      data.product,                       // G: Products Owned
      data.product,                       // H: Last Product
      'Active',                           // I: Customer Status
      'New Customer',                     // J: Tags
      'active',                           // K: Sequence Status
      data.purchaseDate,                  // L: Last Email Date
      '5',                                // M: Engagement Score (default)
      'Direct',                           // N: Referral Source
      'America/Los_Angeles',              // O: Timezone
      'Email',                            // P: Preferred Contact
      '0',                                // Q: Support Tickets
      '',                                 // R: NPS Score
      'Complete Product Experience',      // S: Next Action
      'New customer from webhook sync',   // T: Notes
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Customers!A:T',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newCustomer],
      },
    });

    console.log(`✅ Created new customer: ${data.email}`);
  }
}

/**
 * Store customer insights from GPT product experience
 */
export async function storeCustomerInsights(data: CustomerInsightData): Promise<void> {
  const credentials = {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

  // Generate segment tags based on profile
  const tags = [];
  if (data.hdType) tags.push(data.hdType);
  if (data.sunSign) tags.push(data.sunSign);
  if (data.businessModel) tags.push(data.businessModel);
  const segmentTags = data.segmentTags || tags.join(',');

  const insightRow = [
    data.email,                           // A
    data.product,                         // B
    data.completionDate || new Date().toISOString().split('T')[0], // C
    data.completionStatus || 'completed', // D
    data.sunSign || '',                   // E
    data.moonSign || '',                  // F
    data.risingSign || '',                // G
    data.hdType || '',                    // H
    data.hdStrategy || '',                // I
    data.hdAuthority || '',               // J
    data.hdProfile || '',                 // K
    data.businessModel || '',             // L
    data.currentOffers || '',             // M
    data.currentPricing || '',            // N
    data.idealClient || '',               // O
    data.revenueGoal || '',               // P
    data.painPoints || '',                // Q
    data.whatToSell || '',                // R
    data.howToSell || '',                 // S
    data.pricingModel || '',              // T
    data.keyStrengths || '',              // U
    data.nextSteps || '',                 // V
    segmentTags,                          // W
    'pending',                            // X: Followup Status
    '',                                   // Y: Last Followup Date
    data.notes || '',                     // Z
  ];

  // Check if insights already exist for this email/product
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Customer Insights!A:B',
  });

  const rows = response.data.values || [];
  const existingIndex = rows.findIndex((row, index) =>
    index > 0 && row[0] === data.email && row[1] === data.product
  );

  if (existingIndex > -1) {
    // Update existing insights
    const actualRow = existingIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Customer Insights!A${actualRow}:Z${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [insightRow],
      },
    });
    console.log(`✅ Updated insights for: ${data.email}`);
  } else {
    // Append new insights
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Customer Insights!A:Z',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [insightRow],
      },
    });
    console.log(`✅ Stored new insights for: ${data.email}`);
  }

  // Also update customer tags in Customers sheet
  await updateCustomerTags(data.email, segmentTags);
}

/**
 * Update customer tags in Customers sheet
 */
async function updateCustomerTags(email: string, tags: string): Promise<void> {
  const credentials = {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE';

  // Find customer row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Customers!A:J',
  });

  const rows = response.data.values || [];
  const customerIndex = rows.findIndex((row, index) =>
    index > 0 && row[0] === email
  );

  if (customerIndex > -1) {
    const actualRow = customerIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Customers!J${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[tags]],
      },
    });
    console.log(`✅ Updated customer tags: ${email} → ${tags}`);
  }
}
