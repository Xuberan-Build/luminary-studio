#!/usr/bin/env node

/**
 * Prepare secrets for Netlify Functions
 *
 * This script decodes base64 service account credentials from environment variables
 * and writes them to files that can be bundled with the function.
 *
 * This avoids hitting AWS Lambda's 4KB environment variable size limit.
 */

const fs = require('fs');
const path = require('path');

const secretsDir = path.join(__dirname, '..', '.netlify-functions-data');

// Create directory if it doesn't exist
if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
  console.log('✅ Created secrets directory:', secretsDir);
}

// Write Gmail service account
if (process.env.GOOGLE_GMAIL_SERVICE_ACCOUNT_BASE64) {
  const gmailCredentials = Buffer.from(
    process.env.GOOGLE_GMAIL_SERVICE_ACCOUNT_BASE64,
    'base64'
  ).toString('utf-8');

  fs.writeFileSync(
    path.join(secretsDir, 'gmail-service-account.json'),
    gmailCredentials
  );
  console.log('✅ Wrote Gmail service account credentials');
} else {
  console.warn('⚠️  GOOGLE_GMAIL_SERVICE_ACCOUNT_BASE64 not found');
}

// Write Drive service account
if (process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64) {
  const driveCredentials = Buffer.from(
    process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64,
    'base64'
  ).toString('utf-8');

  fs.writeFileSync(
    path.join(secretsDir, 'drive-service-account.json'),
    driveCredentials
  );
  console.log('✅ Wrote Drive service account credentials');
} else {
  console.warn('⚠️  GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64 not found');
}

console.log('✅ Function secrets prepared successfully');
