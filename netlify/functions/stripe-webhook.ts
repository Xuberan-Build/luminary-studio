import { Handler, HandlerEvent } from '@netlify/functions';
import Stripe from 'stripe';
import { google } from 'googleapis';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Product configuration (hardcoded to reduce env var size)
const PRODUCTS: Record<string, { name: string; gptLink: string; sheetId: string; fromEmail: string; fromName: string }> = {
  'quantum-initiation': {
    name: 'Business Alignment Orientation',
    gptLink: 'https://chatgpt.com/g/g-693966abf2ec81918f1f5c99802f7962-quantum-activation-initiation',
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
};

/**
 * Send GPT access email via Gmail API
 */
async function sendGPTAccessEmail(params: {
  to: string;
  name: string;
  productName: string;
  gptLink: string;
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
    .gpt-link {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #6C5CE7;
      margin: 24px 0;
      word-break: break-all;
    }
    .instructions {
      background: #fff8e1;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .instructions h3 {
      margin: 0 0 12px 0;
      color: #f57c00;
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

      <p><strong>Thank you for your purchase!</strong> Your AI Brand Strategist is ready and waiting for you.</p>

      <div class="instructions">
        <h3>📋 How to Access Your Custom GPT:</h3>
        <ol>
          <li><strong>You need ChatGPT Plus</strong> - Make sure you have an active ChatGPT Plus subscription ($20/month from OpenAI)</li>
          <li><strong>Click the button below</strong> or use the link to access your custom GPT</li>
          <li><strong>Bookmark it!</strong> Save the link so you can access it anytime</li>
          <li><strong>Start your session</strong> - The GPT will guide you through building your Quantum Blueprint</li>
        </ol>
      </div>

      <div style="text-align: center;">
        <a href="${params.gptLink}" class="button">🚀 Access Your GPT Now</a>
      </div>

      <div class="gpt-link">
        <strong>Your GPT Link:</strong><br>
        <a href="${params.gptLink}" style="color: #6C5CE7;">${params.gptLink}</a>
      </div>

      <p><strong>💡 What to Expect:</strong></p>
      <ul>
        <li>A conversational AI trained on the Quantum Business Framework</li>
        <li>Personalized insights based on your Astrology & Human Design</li>
        <li>Strategic guidance aligned with your unique energetic blueprint</li>
        <li>10-15 minute guided session to build your brand strategy</li>
      </ul>

      <hr>

      <p><strong>❓ Need Help?</strong></p>
      <ul>
        <li><strong>No ChatGPT Plus?</strong> <a href="https://openai.com/chatgpt/pricing" style="color: #6C5CE7;">Sign up here</a></li>
        <li><strong>Questions?</strong> Email us at ${params.fromEmail}</li>
        <li><strong>Lost this email?</strong> Check your spam folder or contact us</li>
      </ul>

      <p style="margin-top: 32px;">Ready to build your Quantum Blueprint? Click the button above and let's get started! ✨</p>

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

Thank you for your purchase! Your AI Brand Strategist is ready.

HOW TO ACCESS YOUR CUSTOM GPT:

1. You need ChatGPT Plus - Make sure you have an active ChatGPT Plus subscription ($20/month from OpenAI)
2. Click this link: ${params.gptLink}
3. Bookmark it so you can access it anytime
4. Start your session - The GPT will guide you through building your Quantum Blueprint

YOUR GPT LINK:
${params.gptLink}

WHAT TO EXPECT:
- A conversational AI trained on the Quantum Business Framework
- Personalized insights based on your Astrology & Human Design
- Strategic guidance aligned with your unique energetic blueprint
- 10-15 minute guided session to build your brand strategy

NEED HELP?
- No ChatGPT Plus? Sign up: https://openai.com/chatgpt/pricing
- Questions? Email: ${params.fromEmail}
- Lost this email? Check spam folder or contact us

Ready to build your Quantum Blueprint? Let's get started!

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
  gptLink: string;
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

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Purchases!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        data.timestamp,
        data.email,
        data.name,
        data.product,
        data.amount,
        data.sessionId,
        data.gptLink,
        data.emailSent,
        data.status,
      ]],
    },
  });
}

/**
 * Main webhook handler
 */
export const handler: Handler = async (event: HandlerEvent) => {
  console.log('Stripe webhook received');

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing signature or secret' }),
    };
  }

  let stripeEvent: Stripe.Event;

  // Verify webhook signature
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
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
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No customer email' }),
      };
    }

    // Determine product (for now, default to quantum-initiation)
    // In production, you'd get this from session metadata
    const productSlug = 'quantum-initiation';
    const product = PRODUCTS[productSlug];

    const timestamp = new Date().toISOString();
    let emailSent = '❌ Failed';
    let status = 'Payment Received';

    // Send GPT access email
    try {
      console.log('Sending email to:', customerEmail);

      await sendGPTAccessEmail({
        to: customerEmail,
        name: customerName,
        productName: product.name,
        gptLink: product.gptLink,
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
        gptLink: product.gptLink,
        emailSent,
        status,
        sheetId: product.sheetId,
      });

      console.log('Logged to Google Sheets successfully');
    } catch (sheetError: any) {
      console.error('Failed to log to Google Sheets:', sheetError);
      // Don't fail the webhook if CRM logging fails
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        received: true,
        email: emailSent,
        crm: 'logged',
      }),
    };
  }

  // Return 200 for other event types
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
