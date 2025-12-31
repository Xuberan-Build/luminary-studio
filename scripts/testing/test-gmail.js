/**
 * Gmail API Test Script
 *
 * Tests domain-wide delegation and email sending via Gmail API
 * Run: node test-gmail.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testGmailSend() {
  console.log('🔧 Testing Gmail API with Domain-Wide Delegation...\n');

  // Load service account key
  const keyPath = path.join(__dirname, '.secrets', 'gen-lang-client-0574010323-fa556c163dec.json');

  if (!fs.existsSync(keyPath)) {
    console.error('❌ Service account key not found at:', keyPath);
    process.exit(1);
  }

  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  console.log('✅ Service account key loaded');
  console.log('   Email:', key.client_email);
  console.log('   Project:', key.project_id);
  console.log('');

  // Get configuration from environment
  const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@xuberandigital.com';
  const fromName = process.env.GMAIL_FROM_NAME || 'Quantum Strategies';

  // IMPORTANT: Replace with your test email
  const testRecipient = process.argv[2] || 'your-email@example.com';

  if (testRecipient === 'your-email@example.com') {
    console.error('❌ Please provide a test email address:');
    console.error('   node test-gmail.js your-email@example.com');
    process.exit(1);
  }

  console.log('📧 Email Configuration:');
  console.log('   From:', `"${fromName}" <${fromEmail}>`);
  console.log('   To:', testRecipient);
  console.log('');

  try {
    // Create auth client with domain-wide delegation
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      subject: fromEmail, // Email to impersonate (must be in your Google Workspace)
    });

    console.log('🔐 Authenticating with Google...');
    await auth.authorize();
    console.log('✅ Authentication successful\n');

    const gmail = google.gmail({ version: 'v1', auth });

    // Create test email
    const emailContent = [
      `From: "${fromName}" <${fromEmail}>`,
      `To: ${testRecipient}`,
      'Subject: ✅ Gmail API Test - Domain-Wide Delegation Working!',
      'Content-Type: text/html; charset=utf-8',
      '',
      '<html>',
      '<body style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">',
      '  <div style="background: linear-gradient(135deg, #030048 0%, #1a0066 100%); color: #F8F5FF; padding: 40px; text-align: center; border-radius: 12px;">',
      '    <h1 style="margin: 0;">🎉 Gmail API Test Successful!</h1>',
      '  </div>',
      '  <div style="background: white; padding: 40px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">',
      '    <p>Great news! Your Gmail API setup is working correctly.</p>',
      '    <p><strong>Configuration Details:</strong></p>',
      '    <ul>',
      `      <li>Service Account: ${key.client_email}</li>`,
      `      <li>Project: ${key.project_id}</li>`,
      '      <li>Domain-Wide Delegation: ✅ Enabled</li>',
      '      <li>OAuth Scope: gmail.send</li>',
      '    </ul>',
      '    <p>You can now send automated emails from Quantum Strategies! 🚀</p>',
      '    <hr style="border: 1px solid #eee; margin: 30px 0;">',
      '    <p style="color: #666; font-size: 14px;">',
      '      This is a test email from your Quantum Strategies email automation setup.<br>',
      `      Sent at: ${new Date().toISOString()}`,
      '    </p>',
      '  </div>',
      '</body>',
      '</html>',
    ].join('\n');

    // Encode email in base64url format
    const encodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('📤 Sending test email...');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.data.id);
    console.log('');
    console.log('📬 Check your inbox at:', testRecipient);
    console.log('   (Check spam folder if not in inbox)');
    console.log('');
    console.log('🎉 Gmail API is ready for production!');

  } catch (error) {
    console.error('❌ Failed to send email\n');

    if (error.code === 403) {
      console.error('Authorization Error:');
      console.error('- Domain-wide delegation may not be fully propagated yet (wait 10-15 min)');
      console.error('- Verify OAuth scopes are authorized in Google Workspace Admin');
      console.error('- Ensure', fromEmail, 'exists in your Google Workspace');
    } else if (error.code === 401) {
      console.error('Authentication Error:');
      console.error('- Service account key may be invalid');
      console.error('- Check that Gmail API is enabled in the project');
    } else {
      console.error('Error:', error.message);
    }

    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testGmailSend();
