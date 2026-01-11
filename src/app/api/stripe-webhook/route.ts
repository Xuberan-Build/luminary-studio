import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { google } from 'googleapis';
import { PRODUCTS, getProductBySlug } from '@/lib/constants/products';
import { supabaseAdmin } from '@/lib/supabase/server';
import { syncCustomer } from '@/lib/google-sheets/customer-sync';
import { processReferralCommission, linkPurchaserToReferrer } from '@/lib/affiliate/commission-processor';
import { createConnectAccount } from '@/lib/stripe/connect';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const adminEmail = process.env.STRIPE_ADMIN_NOTIFY_EMAIL || 'austin@xuberandigital.com';

function getGoogleCredentials() {
  const client_email = process.env.GOOGLE_GMAIL_CLIENT_EMAIL || process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let private_key = process.env.GOOGLE_GMAIL_PRIVATE_KEY || process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  if (private_key && private_key.includes('\\n')) {
    private_key = private_key.replace(/\\n/g, '\n');
  }
  return { client_email, private_key };
}

/**
 * Send GPT access email via Gmail API
 */
async function sendProductAccessEmail(params: {
  to: string;
  name: string;
  productName: string;
  productSlug: string;
  fromEmail: string;
  fromName: string;
  isBundle?: boolean;
  bundleSlug?: string;
}) {
  // Load Gmail service account from minimal env vars (avoids AWS Lambda 4KB limit)
  const credentials = getGoogleCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: params.fromEmail, // Impersonate this email
  });

  const gmail = google.gmail({ version: 'v1', auth });

  // Create HTML email
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online';
  const dashboardUrl = `${baseUrl}/dashboard`;
  const signupUrl = `${baseUrl}/signup`;
  const redirectPath = params.isBundle
    ? '/dashboard?bundle=orientation'
    : `/products/${params.productSlug}/experience`;
  const loginUrl = `${baseUrl}/login?redirect=${encodeURIComponent(redirectPath)}`;

  const bundleTitle = params.bundleSlug === 'declaration-rite-bundle'
    ? 'Declaration Bundle'
    : 'Orientation Bundle';

  const bundleDetailsHtml = params.bundleSlug === 'orientation-bundle'
    ? `
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;"><strong>Personal Alignment Orientation</strong> - Discover your life purpose through Astrology & Human Design</li>
          <li style="margin-bottom: 8px;"><strong>Business Alignment Orientation</strong> - Map your business model, offers, and pricing strategy</li>
          <li style="margin-bottom: 8px;"><strong>Brand Alignment Orientation</strong> - Unify who you are with how you show up</li>
        </ul>
        <p style="margin: 12px 0 0 0; color: #1565c0;">All three orientations are now available in your dashboard!</p>
      `
    : params.bundleSlug === 'declaration-rite-bundle'
      ? `
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;"><strong>Life Vision Declaration</strong> - Declare your moonshot and revenue target</li>
          <li style="margin-bottom: 8px;"><strong>Business Model Declaration</strong> - Design the system required to scale</li>
          <li style="margin-bottom: 8px;"><strong>Strategic Path Declaration</strong> - Choose your solo or partnership path</li>
        </ul>
        <p style="margin: 12px 0 0 0; color: #1565c0;">All three declarations are now available in your dashboard!</p>
      `
      : '';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #030048 0%, #1a0066 100%);
      color: #F8F5FF;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      background: #6C5CE7;
      color: white !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      background: #5b4bc4;
    }
    .instructions {
      background: #e8f5e9;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #4caf50;
    }
    .instructions h3 {
      margin: 0 0 12px 0;
      color: #2e7d32;
      font-size: 18px;
    }
    .instructions ol {
      margin: 0;
      padding-left: 20px;
    }
    .instructions li {
      margin-bottom: 8px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #6C5CE7;
      text-decoration: none;
    }
    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${params.productName}!</h1>
    </div>

    <div class="content">
      <p>Hi ${params.name},</p>

      <p><strong>Thank you for your purchase!</strong> Your personalized product experience is ready.</p>

      ${params.isBundle ? `
      <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2196f3;">
        <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 18px;">Your Complete ${bundleTitle} Includes:</h3>
        ${bundleDetailsHtml}
      </div>
      ` : ''}

      <div class="instructions">
        <h3>Getting Started (Simple 3-Step Process):</h3>
        <ol>
          <li><strong>Create your account</strong> - Use the same email you purchased with</li>
          <li><strong>Log in to begin</strong> - Use the login link below</li>
          <li><strong>Start your experience</strong> - You'll see ${params.isBundle ? 'all three orientation products' : `"${params.productName}"`} in your dashboard</li>
          <li><strong>Complete the guided process</strong> - Answer questions and receive your ${params.isBundle ? 'deliverables' : 'deliverable'}</li>
        </ol>
      </div>

      <div style="text-align: center;">
        <a href="${signupUrl}" class="button">Create Your Account</a>
      </div>

      <p style="margin-top: 8px; text-align: center;">
        Already have an account?
        <a href="${loginUrl}" style="color: #6C5CE7; text-decoration: none;">Log in here</a>
      </p>

      <p><strong>What to Expect:</strong></p>
      <ul>
        <li>Step-by-step guided questionnaire</li>
        <li>AI-powered insights based on your responses</li>
        <li>Personalized deliverable generated at the end</li>
        <li>Full progress tracking - pause and resume anytime</li>
      </ul>

      <hr>

      <p><strong>Need Help?</strong></p>
      <ul>
        <li><strong>First time?</strong> Create your account using the email: ${params.to}</li>
        <li><strong>Questions?</strong> Email us at ${params.fromEmail}</li>
        <li><strong>Technical issues?</strong> We're here to help!</li>
      </ul>

      <p style="margin-top: 32px;">Ready to get started? Log in to your dashboard and begin your personalized experience!</p>

      <p style="margin-top: 24px;">
        – Austin<br>
        <em>Quantum Strategies</em>
      </p>
    </div>

    <div class="footer">
      <p><strong>Quantum Strategies</strong> by Xuberan Digital</p>
      <p>
        <a href="https://www.quantumstrategies.online">quantumstrategies.online</a>
      </p>
      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        This email was sent because you purchased ${params.productName}.<br>
        If you have questions, reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Create plain text version
  const bundleDetailsText = params.bundleSlug === 'orientation-bundle'
    ? `
• Personal Alignment Orientation - Discover your life purpose through Astrology & Human Design
• Business Alignment Orientation - Map your business model, offers, and pricing strategy
• Brand Alignment Orientation - Unify who you are with how you show up

All three orientations are now available in your dashboard!
`
    : params.bundleSlug === 'declaration-rite-bundle'
      ? `
• Life Vision Declaration - Declare your moonshot and revenue target
• Business Model Declaration - Design the system required to scale
• Strategic Path Declaration - Choose your solo or partnership path

All three declarations are now available in your dashboard!
`
      : '';

  const emailText = `
Welcome to ${params.productName}!

Hi ${params.name},

Thank you for your purchase! Your personalized product experience is ready.

${params.isBundle ? `
YOUR COMPLETE ${bundleTitle.toUpperCase()} INCLUDES:

${bundleDetailsText}
` : ''}

GETTING STARTED (Simple 3-Step Process):

1. Create your account - Visit: ${signupUrl}
2. Log in to begin: ${loginUrl}
3. Start your experience - You'll see ${params.isBundle ? 'all three orientation products' : `"${params.productName}"`} in your dashboard
4. Complete the guided process - Answer questions and receive your ${params.isBundle ? 'deliverables' : 'deliverable'}

CREATE YOUR ACCOUNT:
${signupUrl}

ALREADY HAVE AN ACCOUNT?
Log in here: ${loginUrl}

WHAT TO EXPECT:
- Step-by-step guided questionnaire
- AI-powered insights based on your responses
- Personalized deliverable generated at the end
- Full progress tracking - pause and resume anytime

NEED HELP?
- First time? Create your account using the email: ${params.to}
- Questions? Email: ${params.fromEmail}
- Technical issues? We're here to help!

Ready to get started? Log in to your dashboard and begin your personalized experience!

– Austin
Quantum Strategies

---
Quantum Strategies by Xuberan Digital
quantumstrategies.online
  `.trim();

  // Compose email
  const email = [
    `From: "${params.fromName}" <${params.fromEmail}>`,
    `To: ${params.to}`,
    `Subject: Your ${params.productName} is Ready!`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary123"',
    '',
    '--boundary123',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    emailText,
    '',
    '--boundary123',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    emailHtml,
    '',
    '--boundary123--',
  ].join('\n');

  // Encode email
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send email
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
    },
  });

  return result.data.id;
}

/**
 * Send admin notification email about new purchase
 */
async function sendAdminNotification(params: {
  customerEmail: string;
  customerName: string;
  productName: string;
  amount: number;
  sessionId: string;
}) {
  const credentials = {
    ...getGoogleCredentials(),
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: 'austin@xuberandigital.com', // Send from your business email
  });

  const gmail = google.gmail({ version: 'v1', auth });

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 20px; }
    .header { background: #4caf50; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; }
    .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #4caf50; }
    .label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Purchase!</h1>
    </div>
    <div class="content">
      <div class="detail">
        <div class="label">Product:</div>
        <div>${params.productName}</div>
      </div>
      <div class="detail">
        <div class="label">Amount:</div>
        <div>$${params.amount.toFixed(2)}</div>
      </div>
      <div class="detail">
        <div class="label">Customer:</div>
        <div>${params.customerName}</div>
      </div>
      <div class="detail">
        <div class="label">Email:</div>
        <div>${params.customerEmail}</div>
      </div>
      <div class="detail">
        <div class="label">Session ID:</div>
        <div style="font-family: monospace; font-size: 12px;">${params.sessionId}</div>
      </div>
      <p style="margin-top: 20px; color: #666;">
        <a href="https://dashboard.stripe.com/test/payments">View in Stripe Dashboard →</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const emailText = `
NEW PURCHASE NOTIFICATION

Product: ${params.productName}
Amount: $${params.amount.toFixed(2)}
Customer: ${params.customerName}
Email: ${params.customerEmail}
Session: ${params.sessionId}

View in Stripe Dashboard:
https://dashboard.stripe.com/test/payments
  `.trim();

  const email = [
    `From: "Quantum Strategies Notifications" <austin@xuberandigital.com>`,
    `To: ${adminEmail}`,
    `Subject: New Purchase: ${params.productName} - $${params.amount.toFixed(2)}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary456"',
    '',
    '--boundary456',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    emailText,
    '',
    '--boundary456',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    emailHtml,
    '',
    '--boundary456--',
  ].join('\n');

  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
    },
  });
}

/**
 * Log purchase to Google Sheets CRM
 */
async function logToGoogleSheets(data: {
  timestamp: string;
  email: string;
  name: string;
  product: string;
  amount: string;
  sessionId: string;
  emailSent: string;
  status: string;
  sheetId: string;
  productSlugs?: string[];
  userId?: string;
  productAccessIds?: string[];
  purchaseDate?: string;
  amountPaid?: number;
  stripePaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
}) {
  // Load Drive service account from minimal env vars (avoids AWS Lambda 4KB limit)
  const credentials = getGoogleCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = data.sheetId;

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

  // Ensure header row matches expected format (safe to overwrite headers only)
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Purchases!A1:U1',
  });
  const existingHeaders = (headerResponse.data.values || [])[0] || [];
  const headersMatch = purchaseHeaders.every((header, index) => existingHeaders[index] === header);
  if (!headersMatch) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Purchases!A1:U1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [purchaseHeaders],
      },
    });
  }

  // Write to sheet columns A-I to match CRM structure:
  // A: Timestamp, B: Email, C: Name, D: Product, E: Amount, F: Stripe Session ID
  // G: GPT Link (empty, will be populated by automation later)
  // H: Email Sent, I: Status
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Purchases!A:U',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        data.timestamp,   // A: Timestamp
        data.email,       // B: Email
        data.name,        // C: Name
        data.product,     // D: Product
        data.amount,      // E: Amount
        data.sessionId,   // F: Stripe Session ID
        '',               // G: GPT Link (empty, for future automation)
        data.emailSent,   // H: Email Sent
        data.status,      // I: Status
        '',               // J: Day 1 Email Sent
        '',               // K: Day 3 Email Sent
        '',               // L: Day 7 Email Sent
        '',               // M: Last Email Sent
        '',               // N: Sequence Status
        (data.productSlugs || []).join(', '), // O: Product Slugs
        data.userId || '',                    // P: User ID
        (data.productAccessIds || []).join(', '), // Q: Product Access IDs
        data.purchaseDate || data.timestamp,  // R: Purchase Date
        data.amountPaid ?? '',                // S: Amount Paid
        data.stripePaymentIntentId || '',     // T: Stripe Payment Intent ID
        data.stripeCustomerId || '',          // U: Stripe Customer ID
      ]],
    },
  });
}

/**
 * Main webhook handler (Next.js API Route)
 */
export async function POST(request: NextRequest) {
  console.log('Stripe webhook received');

  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return NextResponse.json(
      { error: 'Missing signature or secret' },
      { status: 400 }
    );
  }

  // Read raw body for signature verification
  const body = await request.text();

  let stripeEvent: Stripe.Event;

  // Verify webhook signature
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;

    console.log('=== CHECKOUT SESSION COMPLETED ===');
    console.log('Session ID:', session.id);
    console.log('Customer Email:', session.customer_details?.email);
    console.log('Amount:', session.amount_total);
    console.log('Metadata:', session.metadata);
    console.log('Success URL:', session.success_url);
    console.log('==================================');

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'there';
    const amount = (session.amount_total || 0) / 100; // Convert cents to dollars

    if (!customerEmail) {
      console.error('No customer email found');
      return NextResponse.json(
        { error: 'No customer email' },
        { status: 400 }
      );
    }

    // Determine product from session metadata or success URL
    let productSlug = 'business-alignment'; // Default fallback

    // Try 1: Get from session metadata (if configured in Stripe payment link)
    if (session.metadata?.product_slug) {
      productSlug = session.metadata.product_slug;
      console.log('✅ Product detected from metadata:', productSlug);
    }
    // Try 2: Parse from success URL (e.g., /products/business-alignment/interact)
    else if (session.success_url) {
      const urlMatch = session.success_url.match(/\/products\/([^\/]+)\//);
      if (urlMatch && urlMatch[1]) {
        productSlug = urlMatch[1];
        console.log('✅ Product detected from success URL:', productSlug);
      } else {
        console.warn('⚠️ Could not parse product from success URL:', session.success_url);
        console.warn('⚠️ Using default fallback: business-alignment');
      }
    } else {
      console.warn('⚠️ No metadata or success URL found');
      console.warn('⚠️ Using default fallback: business-alignment');
      console.warn('⚠️ Session ID:', session.id);
    }

    // Get product configuration
    const product = getProductBySlug(productSlug);

    if (!product) {
      console.error('Product not found:', productSlug);
      return NextResponse.json(
        { error: `Product not found: ${productSlug}` },
        { status: 400 }
      );
    }

    console.log('Using product:', product.name);

    const timestamp = new Date().toISOString();
    let emailSent = '❌ Failed';
    let status = 'Payment Received';

    // Send product access email
    try {
      console.log('Sending email to:', customerEmail);

      await sendProductAccessEmail({
        to: customerEmail,
        name: customerName,
        productName: product.name,
        productSlug,
        fromEmail: product.fromEmail,
        fromName: product.fromName,
        isBundle: productSlug?.endsWith('bundle'),
        bundleSlug: productSlug?.endsWith('bundle') ? productSlug : undefined,
      });

      emailSent = '✅ Sent';
      status = 'Complete';

      console.log('Email sent successfully');

      // Send admin notification
      try {
        console.log(`Sending admin notification to ${adminEmail}`);
        await sendAdminNotification({
          customerEmail,
          customerName,
          productName: product.name,
          amount,
          sessionId: session.id,
        });
        console.log('✅ Admin notification sent');
      } catch (adminEmailError: any) {
        console.error('⚠️ Admin notification failed (customer email still sent):', adminEmailError.message);
        // Don't fail the whole webhook if admin notification fails
      }
    } catch (emailError: any) {
      console.error('Failed to send email:', emailError);
      emailSent = `❌ Failed: ${emailError.message}`;
      status = 'Email Failed';
    }

    // Grant product access in Supabase
    let userId: string | undefined;
    const productAccessIds: string[] = [];

    try {
      console.log('Granting product access in Supabase');

      // Check if user exists, create if not
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .single();

      userId = existingUser?.id;

      if (!userId) {
        // Create user account
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            email: customerEmail,
            name: customerName,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        userId = newUser.id;
        console.log('Created new user:', userId);
      }

      // Determine which products to grant access to
      let productsToGrant: string[];

      if (productSlug === 'orientation-bundle') {
        // Bundle grants access to all 3 orientation products
        productsToGrant = ['personal-alignment', 'business-alignment', 'brand-alignment'];
        console.log('🎁 Bundle purchase detected - granting access to all 3 products');
      } else if (productSlug === 'perception-rite-bundle') {
        productsToGrant = [
          'perception-rite-scan-1',
          'perception-rite-scan-2',
          'perception-rite-scan-3',
          'perception-rite-scan-4',
          'perception-rite-scan-5',
        ];
        console.log('🎁 Perception Rite bundle detected - granting access to all 5 scans');
      } else if (productSlug === 'declaration-rite-bundle') {
        productsToGrant = [
          'declaration-rite-life-vision',
          'declaration-rite-business-model',
          'declaration-rite-strategic-path',
        ];
        console.log('🎁 Declaration Rite bundle detected - granting access to all 3 declarations');
      } else {
        // Single product purchase
        productsToGrant = [productSlug];
      }

      // Grant product access for each product
      for (const slug of productsToGrant) {
        console.log('📝 Inserting product_access record:', {
          user_id: userId,
          product_slug: slug,
          stripe_session_id: session.id,
          amount_paid: amount,
        });

        const { data: accessData, error: accessError } = await supabaseAdmin
          .from('product_access')
          .insert({
            user_id: userId,
            product_slug: slug,
            stripe_session_id: session.id,
            amount_paid: amount,
            access_granted: true,
            purchase_date: timestamp,
            purchase_source: productSlug?.endsWith('bundle') ? 'bundle' : 'single',
            bundle_slug: productSlug?.endsWith('bundle') ? productSlug : null,
          })
          .select();

        if (accessError) {
          if (accessError.code === '23505') {
            // Duplicate key - user already has access
            console.log(`⚠️ User already has access to ${slug} (duplicate key), updating record`);

            const { error: updateError } = await supabaseAdmin
              .from('product_access')
              .update({
                stripe_session_id: session.id,
                amount_paid: amount,
                access_granted: true,
                purchase_date: timestamp,
                purchase_source: productSlug?.endsWith('bundle') ? 'bundle' : 'single',
                bundle_slug: productSlug?.endsWith('bundle') ? productSlug : null,
              })
              .eq('user_id', userId)
              .eq('product_slug', slug);

            if (updateError) {
              console.error(`❌ Failed to update existing access for ${slug}:`, updateError);
              throw updateError;
            }

            const { data: existingAccess } = await supabaseAdmin
              .from('product_access')
              .select('id')
              .eq('user_id', userId)
              .eq('product_slug', slug)
              .single();

            if (existingAccess?.id) {
              productAccessIds.push(existingAccess.id);
            }

            console.log(`✅ Updated existing access record for ${slug}`);
          } else {
            console.error(`❌ Failed to insert product_access for ${slug}:`, accessError);
            console.error('Error code:', accessError.code);
            console.error('Error message:', accessError.message);
            console.error('Error details:', accessError.details);
            throw accessError;
          }
        } else {
          console.log(`✅ Product access granted successfully for ${slug}`);
          console.log('Access record:', accessData);
          const insertedId = accessData?.[0]?.id;
          if (insertedId) {
            productAccessIds.push(insertedId);
          }
        }
      }
    } catch (supabaseError: any) {
      console.error('Failed to grant Supabase access:', supabaseError);
      // Don't fail the webhook if Supabase fails
    }

    // Create Stripe Connect account for new affiliate (auto-enrollment happens via DB trigger)
    if (userId) {
      try {
        console.log('Creating Stripe Connect account for affiliate');

        await createConnectAccount(userId, customerEmail);

        console.log('Stripe Connect account created successfully');
      } catch (connectError: any) {
        console.error('Failed to create Stripe Connect account:', connectError);
        // Don't fail the webhook if Connect account creation fails
      }

      // Process referral commission if referral code exists in session metadata
      try {
        const referralCode = session.metadata?.referral_code;

        if (referralCode && referralCode !== '') {
          console.log('Processing referral commission for code:', referralCode);

          // Link purchaser to referrer (sets referred_by_id)
          await linkPurchaserToReferrer(userId, referralCode);

          // Process commission splits and payouts
          await processReferralCommission({
            purchaserId: userId,
          purchaserEmail: customerEmail,
          referralCode,
          sessionId: session.id,
          paymentIntentId: session.payment_intent as string | null,
          amountCents: session.amount_total || 0,
          productSlug,
        });

        console.log('Referral commission processed successfully');
        } else {
          console.log('No referral code in session metadata');
        }
      } catch (referralError: any) {
        console.error('Failed to process referral commission:', referralError);
        // Don't fail the webhook if referral processing fails
      }
    }

    // Log to Google Sheets
    try {
      console.log('Logging to Google Sheets');

      await logToGoogleSheets({
        timestamp,
        email: customerEmail,
        name: customerName,
        product: product.name,
        amount: `$${amount}`,
        sessionId: session.id,
        emailSent,
        status,
        sheetId: product.sheetId,
        productSlugs: productsToGrant,
        userId,
        productAccessIds,
        purchaseDate: timestamp,
        amountPaid: amount,
        stripePaymentIntentId: session.payment_intent as string | null,
        stripeCustomerId: (session.customer as string | null) || null,
      });

      console.log('Logged to Google Sheets successfully');
    } catch (sheetError: any) {
      console.error('Failed to log to Google Sheets:', sheetError);
      // Don't fail the webhook if CRM logging fails
    }

    // Sync customer profile to Customers sheet
    try {
      console.log('Syncing customer profile');

      await syncCustomer({
        email: customerEmail,
        name: customerName,
        purchaseDate: timestamp,
        product: product.name,
        amount,
      });

      console.log('Customer profile synced successfully');
    } catch (syncError: any) {
      console.error('Failed to sync customer profile:', syncError);
      // Don't fail the webhook if customer sync fails
    }

    return NextResponse.json({
      received: true,
      email: emailSent,
      crm: 'logged',
    });
  }

  // Return 200 for other event types
  return NextResponse.json({ received: true });
}
