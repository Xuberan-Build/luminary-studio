import { google } from 'googleapis';

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Send email via Gmail API with service account impersonation
 */
export async function sendEmail(params: EmailParams): Promise<string> {
  // Load Gmail service account credentials
  const credentials = {
    client_email: process.env.GOOGLE_GMAIL_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_GMAIL_PRIVATE_KEY,
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Gmail API credentials not configured');
  }

  // Create JWT auth with impersonation
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: params.fromEmail, // Impersonate this email
  });

  const gmail = google.gmail({ version: 'v1', auth });

  // Compose multipart email (HTML + plain text)
  const email = [
    `From: "${params.fromName}" <${params.fromEmail}>`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="boundary123"',
    '',
    '--boundary123',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    params.text,
    '',
    '--boundary123',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    params.html,
    '',
    '--boundary123--',
  ].join('\n');

  // Encode email for Gmail API
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

  return result.data.id || 'sent';
}
