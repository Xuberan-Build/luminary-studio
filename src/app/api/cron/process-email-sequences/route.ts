import { NextRequest, NextResponse } from 'next/server';
import { fetchPurchasesFromSheet, updateSheetEmailStatus } from '@/lib/google-sheets/sheet-manager';
import {
  determineEmailToSend,
  sendDay1Email,
  sendDay3Email,
  sendDay7Email,
  PurchaseRecord,
} from '@/lib/email/sequence-manager';

/**
 * Cron job to process email sequences
 * Runs daily via Vercel Cron
 *
 * To test locally:
 * curl http://localhost:3000/api/cron/process-email-sequences \
 *   -H "Authorization: Bearer your-cron-secret"
 */
export async function GET(request: NextRequest) {
  console.log('📧 Email sequence cron job started');

  // 1. Authenticate cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('⚠️  CRON_SECRET not configured');
    return NextResponse.json(
      { error: 'Cron not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('🚫 Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const results = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: [] as { email: string; error: string }[],
  };

  try {
    // 2. Fetch all purchases from Google Sheets
    console.log('📊 Fetching purchases from Google Sheets...');
    const purchases = await fetchPurchasesFromSheet();
    console.log(`✅ Found ${purchases.length} purchases`);

    // 3. Process each purchase
    for (const purchase of purchases) {
      results.processed++;

      try {
        // Determine which email (if any) to send
        const emailType = determineEmailToSend(purchase);

        if (!emailType) {
          results.skipped++;
          continue;
        }

        console.log(
          `📬 Sending ${emailType} email to ${purchase.email} (${purchase.product})`
        );

        // Send the appropriate email
        switch (emailType) {
          case 'day1':
            await sendDay1Email(purchase);
            break;
          case 'day3':
            await sendDay3Email(purchase);
            break;
          case 'day7':
            await sendDay7Email(purchase);
            break;
        }

        // Update sheet with send status
        await updateSheetEmailStatus(purchase.email, emailType);

        results.sent++;
        console.log(`✅ ${emailType} email sent to ${purchase.email}`);
      } catch (error: any) {
        console.error(
          `❌ Failed to process ${purchase.email}:`,
          error.message
        );
        results.errors.push({
          email: purchase.email,
          error: error.message,
        });
      }
    }

    console.log('📧 Email sequence cron job completed');
    console.log(
      `📊 Results: Processed: ${results.processed}, Sent: ${results.sent}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`
    );

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('💥 Cron job failed:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

// Disable static generation for cron routes
export const dynamic = 'force-dynamic';
