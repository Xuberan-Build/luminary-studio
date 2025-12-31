/**
 * Send access email to Latajah Lassus
 * One-time script to notify customer of resolved access issue
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function sendEmail() {
  console.log('\n📧 Sending email to Latajah Lassus...\n');

  const credentials = {
    client_email: process.env.GOOGLE_GMAIL_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_GMAIL_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    console.error('❌ Missing Gmail credentials in .env.local');
    console.error('   Need: GOOGLE_GMAIL_CLIENT_EMAIL and GOOGLE_GMAIL_PRIVATE_KEY');
    process.exit(1);
  }

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
      font-size: 18px;
    }
    .button:hover {
      background: #5b4bc4;
    }
    .info-box {
      background: #e8f5e9;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #4caf50;
    }
    .info-box h3 {
      margin: 0 0 12px 0;
      color: #2e7d32;
      font-size: 18px;
    }
    ul {
      margin: 16px 0;
      padding-left: 24px;
    }
    li {
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
      <h1>🎉 Your Personal Alignment Orientation is Ready!</h1>
    </div>

    <div class="content">
      <p>Hi Latajah,</p>

      <p>Thank you so much for your purchase of the <strong>Personal Alignment Orientation</strong>!</p>

      <p>We had a brief technical issue that delayed automatic access, but I've personally resolved it and your account is now active.</p>

      <div class="info-box">
        <h3>🚀 Click Here to Get Started:</h3>
        <div style="text-align: center; margin-top: 16px;">
          <a href="https://quantumstrategies.online/products/personal-alignment/experience" class="button">
            Access Your Product →
          </a>
        </div>
        <p style="margin-top: 16px; font-size: 14px; color: #666;">
          If you're not logged in, you'll be prompted to create an account first using <strong>thebrighteststarfire@gmail.com</strong>
        </p>
      </div>

      <p><strong>What to Expect:</strong></p>
      <ul>
        <li><strong>8 thoughtful questions</strong> about your personal alignment</li>
        <li><strong>AI-powered insights</strong> after each step</li>
        <li><strong>Personalized deliverable</strong> at the end</li>
        <li><strong>25-30 minutes</strong> total (pause and resume anytime)</li>
      </ul>

      <p><strong>💡 What You'll Get:</strong></p>
      <p>Your personalized <strong>Brand Alignment Blueprint</strong> will help you:</p>
      <ul>
        <li>Clarify who you are and how you show up</li>
        <li>Identify alignment gaps</li>
        <li>Create a unified personal brand strategy</li>
      </ul>

      <hr>

      <p><strong>❓ Need Help?</strong></p>
      <p>If you have any questions or run into any issues, just reply to this email. I'm here to help!</p>

      <p style="margin-top: 32px;">Thanks again for your purchase and patience during our technical hiccup. I'm excited for you to go through the experience!</p>

      <p style="margin-top: 24px;">
        Best,<br>
        Austin<br>
        <em>Quantum Strategies</em><br>
        <a href="mailto:austin@xuberandigital.com">austin@xuberandigital.com</a>
      </p>

      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        <strong>P.S.</strong> Your purchase helps support the development of more transformative tools. Thank you! 🙏
      </p>
    </div>

    <div class="footer">
      <p><strong>Quantum Strategies</strong> by Xuberan Digital</p>
      <p>
        <a href="https://www.quantumstrategies.online">quantumstrategies.online</a>
      </p>
      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        This email was sent because you purchased Personal Alignment Orientation.<br>
        If you have questions, reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const emailText = `
Your Personal Alignment Orientation is Ready!

Hi Latajah,

Thank you so much for your purchase of the Personal Alignment Orientation!

We had a brief technical issue that delayed automatic access, but I've personally resolved it and your account is now active.

HOW TO GET STARTED:

Click here to access your product:
https://quantumstrategies.online/products/personal-alignment/experience

If you're not logged in, you'll be prompted to create an account first using thebrighteststarfire@gmail.com

WHAT TO EXPECT:

• 8 thoughtful questions about your personal alignment
• AI-powered insights after each step
• Personalized deliverable at the end
• 25-30 minutes total (pause and resume anytime)

WHAT YOU'LL GET:

Your personalized Brand Alignment Blueprint will help you:
• Clarify who you are and how you show up
• Identify alignment gaps
• Create a unified personal brand strategy

NEED HELP?

If you have any questions or run into any issues, just reply to this email. I'm here to help!

Thanks again for your purchase and patience during our technical hiccup. I'm excited for you to go through the experience!

Best,
Austin
Quantum Strategies
austin@xuberandigital.com

P.S. Your purchase helps support the development of more transformative tools. Thank you! 🙏

---
Quantum Strategies by Xuberan Digital
quantumstrategies.online
  `.trim();

  const email = [
    `From: "Austin Santos - Quantum Strategies" <austin@xuberandigital.com>`,
    `To: thebrighteststarfire@gmail.com`,
    `Reply-To: austin@xuberandigital.com`,
    `Subject: Your Personal Alignment Orientation is Ready! 🎉`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary789"',
    '',
    '--boundary789',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    emailText,
    '',
    '--boundary789',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    emailHtml,
    '',
    '--boundary789--',
  ].join('\n');

  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.data.id}`);
    console.log(`   To: thebrighteststarfire@gmail.com`);
    console.log(`   From: austin@xuberandigital.com`);
    console.log('\n📬 Latajah should receive the email within 1-2 minutes.\n');
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    if (error.response) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

sendEmail()
  .then(() => {
    console.log('✅ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
