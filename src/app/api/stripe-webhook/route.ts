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

/**
 * Send GPT access email via Gmail API
 */
async function sendProductAccessEmail(params: {
  to: string;
  name: string;
  productName: string;
  fromEmail: string;
  fromName: string;
}) {
  // Load Gmail service account from minimal env vars (avoids AWS Lambda 4KB limit)
  const credentials = {
    client_email: process.env.GOOGLE_GMAIL_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_GMAIL_PRIVATE_KEY,
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: params.fromEmail, // Impersonate this email
  });

  const gmail = google.gmail({ version: 'v1', auth });

  // Create HTML email
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online'}/dashboard`;

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
      <h1>🎉 Welcome to ${params.productName}!</h1>
    </div>

    <div class="content">
      <p>Hi ${params.name},</p>

      <p><strong>Thank you for your purchase!</strong> Your personalized product experience is ready.</p>

      <div class="instructions">
        <h3>🚀 Getting Started (Simple 3-Step Process):</h3>
        <ol>
          <li><strong>Log in to your dashboard</strong> - Click the button below to access your account</li>
          <li><strong>Start your experience</strong> - You'll see "${params.productName}" in your dashboard</li>
          <li><strong>Complete the guided process</strong> - Answer questions and receive your deliverable</li>
        </ol>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Access Your Dashboard</a>
      </div>

      <p><strong>💡 What to Expect:</strong></p>
      <ul>
        <li>Step-by-step guided questionnaire</li>
        <li>AI-powered insights based on your responses</li>
        <li>Personalized deliverable generated at the end</li>
        <li>Full progress tracking - pause and resume anytime</li>
      </ul>

      <hr>

      <p><strong>❓ Need Help?</strong></p>
      <ul>
        <li><strong>First time?</strong> Create your account using the email: ${params.to}</li>
        <li><strong>Questions?</strong> Email us at ${params.fromEmail}</li>
        <li><strong>Technical issues?</strong> We're here to help!</li>
      </ul>

      <p style="margin-top: 32px;">Ready to get started? Log in to your dashboard and begin your personalized experience! ✨</p>

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
  const emailText = `
Welcome to ${params.productName}!

Hi ${params.name},

Thank you for your purchase! Your personalized product experience is ready.

GETTING STARTED (Simple 3-Step Process):

1. Log in to your dashboard - Visit: ${dashboardUrl}
2. Start your experience - You'll see "${params.productName}" in your dashboard
3. Complete the guided process - Answer questions and receive your deliverable

ACCESS YOUR DASHBOARD:
${dashboardUrl}

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
    `Subject: 🎉 Your ${params.productName} is Ready!`,
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
}) {
  // Load Drive service account from minimal env vars (avoids AWS Lambda 4KB limit)
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
  const spreadsheetId = data.sheetId;

  // Write to sheet columns A-I to match CRM structure:
  // A: Timestamp, B: Email, C: Name, D: Product, E: Amount, F: Stripe Session ID
  // G: GPT Link (empty, will be populated by automation later)
  // H: Email Sent, I: Status
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Purchases!A:I',
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

    console.log('Processing checkout session:', session.id);

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
    let productSlug = 'quantum-initiation'; // Default fallback

    // Try 1: Get from session metadata (if configured in Stripe payment link)
    if (session.metadata?.product_slug) {
      productSlug = session.metadata.product_slug;
      console.log('Product detected from metadata:', productSlug);
    }
    // Try 2: Parse from success URL (e.g., /products/quantum-initiation/interact)
    else if (session.success_url) {
      const urlMatch = session.success_url.match(/\/products\/([^\/]+)\//);
      if (urlMatch && urlMatch[1]) {
        productSlug = urlMatch[1];
        console.log('Product detected from success URL:', productSlug);
      }
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
        fromEmail: product.fromEmail,
        fromName: product.fromName,
      });

      emailSent = '✅ Sent';
      status = 'Complete';

      console.log('Email sent successfully');
    } catch (emailError: any) {
      console.error('Failed to send email:', emailError);
      emailSent = `❌ Failed: ${emailError.message}`;
      status = 'Email Failed';
    }

    // Grant product access in Supabase
    let userId: string | undefined;

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

      // Grant product access
      const { error: accessError } = await supabaseAdmin
        .from('product_access')
        .insert({
          user_id: userId,
          product_slug: productSlug,
          stripe_session_id: session.id,
          amount_paid: amount,
          access_granted: true,
          purchase_date: timestamp,
        });

      if (accessError && accessError.code !== '23505') {
        // Ignore duplicate key errors (user already has access)
        throw accessError;
      }

      console.log('Product access granted successfully');
    } catch (supabaseError: any) {
      console.error('Failed to grant Supabase access:', supabaseError);
      // Don't fail the webhook if Supabase fails
    }

    // Create Stripe Connect account for new affiliate (auto-enrollment happens via DB trigger)
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
