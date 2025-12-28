# Affiliate Email Sequence - Implementation Plan

**Created:** 2025-12-27
**Based on:** Product Requirements Document v1.0
**Integration:** Aligns with REFACTORING_PLAN.md service layer architecture

---

## 📋 Overview

Implement automated email sequence to invite users to join the affiliate program 30 minutes after completing their product deliverable. This implementation follows the service layer pattern from the refactoring plan.

**Success Criteria:**
- ✅ 40%+ enrollment rate from emails
- ✅ 95%+ email delivery success
- ✅ <10% opt-out rate
- ✅ Zero duplicate emails

---

## 🏗️ Architecture

### Service Layer Integration

```
New Services Created:
├── EmailSequenceService     # Core email sequence logic
├── EmailTemplateService     # Template rendering & personalization
└── CronService              # Cron job orchestration

Existing Services Used:
├── GmailService (lib/email/gmail-sender.ts)
└── SupabaseAdmin (lib/supabase/server.ts)

New Database Table:
└── email_sequences          # Stores scheduled emails

New API Routes:
├── POST /api/products/final-briefing (updated)
├── GET /api/cron/process-email-sequences (new)
└── GET /api/affiliate/opt-out (new)
```

---

## 📁 File Structure

```
/database/migrations/
  └── 009_email_sequences.sql                    # ✨ NEW

/src/lib/services/
  ├── EmailSequenceService.ts                    # ✨ NEW
  └── EmailTemplateService.ts                    # ✨ NEW

/src/lib/email/
  ├── gmail-sender.ts                            # EXISTS
  ├── templates/
  │   └── affiliate-invitation.ts                # ✨ NEW

/src/app/api/
  ├── products/final-briefing/route.ts           # UPDATE
  ├── cron/process-email-sequences/route.ts      # ✨ NEW
  └── affiliate/opt-out/route.ts                 # ✨ NEW

/src/types/
  └── database.ts                                # UPDATE (add EmailSequence type)
```

---

## 🗄️ Phase 1: Database Migration

### File: `database/migrations/009_email_sequences.sql`

```sql
-- ============================================================================
-- Migration 009: Email Sequences System
-- Description: Automated email sequences for affiliate program invitations
-- Author: Austin (Quantum Strategies)
-- Date: 2025-12-27
-- ============================================================================

-- Create email_sequences table
CREATE TABLE IF NOT EXISTS public.email_sequences (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Sequence Configuration
  sequence_type TEXT NOT NULL,              -- 'affiliate_invitation'
  trigger_event TEXT NOT NULL,              -- 'deliverable_completed'
  trigger_timestamp TIMESTAMPTZ NOT NULL,   -- When deliverable was completed
  scheduled_send_at TIMESTAMPTZ NOT NULL,   -- When to send (trigger + delay)

  -- Email Status
  email_status TEXT NOT NULL DEFAULT 'scheduled',
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Email Content (JSONB for flexibility)
  email_content JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email_status CHECK (
    email_status IN ('scheduled', 'sent', 'failed', 'cancelled')
  ),
  CONSTRAINT unique_user_sequence UNIQUE(user_id, sequence_type)
);

-- Indexes for performance
CREATE INDEX idx_email_sequences_user_id
  ON email_sequences(user_id);

CREATE INDEX idx_email_sequences_scheduled_send
  ON email_sequences(scheduled_send_at)
  WHERE email_status = 'scheduled';

CREATE INDEX idx_email_sequences_status
  ON email_sequences(email_status);

CREATE INDEX idx_email_sequences_sent_at
  ON email_sequences(sent_at)
  WHERE sent_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own email sequences"
  ON email_sequences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON email_sequences FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_sequences_updated_at
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_sequences_updated_at();

-- Comments for documentation
COMMENT ON TABLE email_sequences IS
  'Stores automated email sequences (e.g., affiliate invitations after deliverable completion)';

COMMENT ON COLUMN email_sequences.sequence_type IS
  'Type of email sequence: affiliate_invitation, etc.';

COMMENT ON COLUMN email_sequences.trigger_event IS
  'Event that triggered the sequence: deliverable_completed, etc.';

COMMENT ON COLUMN email_sequences.email_content IS
  'JSONB containing: {product_name, product_slug, deliverable_preview, user_first_name}';

-- Verify migration
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'email_sequences') = 1,
    'email_sequences table not created';

  ASSERT (SELECT COUNT(*) FROM information_schema.table_constraints
          WHERE table_name = 'email_sequences' AND constraint_type = 'UNIQUE') >= 1,
    'UNIQUE constraint not created';

  RAISE NOTICE 'Migration 009 completed successfully';
END $$;
```

---

## 💾 Phase 2: TypeScript Types

### File: `src/types/database.ts` (UPDATE)

Add these interfaces to the existing file:

```typescript
// Email Sequence types
export interface EmailSequence {
  id: string;
  user_id: string;
  sequence_type: EmailSequenceType;
  trigger_event: string;
  trigger_timestamp: string;
  scheduled_send_at: string;
  email_status: EmailStatus;
  sent_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  email_content: EmailContent;
  created_at: string;
  updated_at: string;
}

export type EmailSequenceType = 'affiliate_invitation';

export type EmailStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';

export interface EmailContent {
  product_name: string;
  product_slug: string;
  deliverable_preview: string;
  user_first_name: string;
  user_email: string;
}
```

---

## 🔧 Phase 3: EmailSequenceService

### File: `src/lib/services/EmailSequenceService.ts` (NEW)

```typescript
import { supabaseAdmin } from '@/lib/supabase/server';
import { EmailSequence, EmailSequenceType, EmailContent } from '@/types/database';

export class EmailSequenceService {
  /**
   * Schedule an email sequence for a user
   *
   * @param userId - User's UUID
   * @param sequenceType - Type of sequence ('affiliate_invitation')
   * @param triggerEvent - Event that triggered sequence ('deliverable_completed')
   * @param delayMinutes - Minutes to wait before sending (default: 30)
   * @param emailContent - Personalized email data
   */
  static async scheduleEmail(
    userId: string,
    sequenceType: EmailSequenceType,
    triggerEvent: string,
    emailContent: EmailContent,
    delayMinutes: number = 30
  ): Promise<EmailSequence | null> {
    try {
      // Check if user already has a scheduled email of this type
      const { data: existing } = await supabaseAdmin
        .from('email_sequences')
        .select('id, email_status')
        .eq('user_id', userId)
        .eq('sequence_type', sequenceType)
        .maybeSingle();

      if (existing) {
        console.log(`[EmailSequenceService] User ${userId} already has ${sequenceType} email (status: ${existing.email_status})`);
        return null;
      }

      // Check if user is already enrolled (no point sending email)
      const { data: referralHierarchy } = await supabaseAdmin
        .from('referral_hierarchy')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (referralHierarchy) {
        console.log(`[EmailSequenceService] User ${userId} already enrolled as affiliate, skipping email`);
        return null;
      }

      // Check if user opted out
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('affiliate_opted_out')
        .eq('id', userId)
        .maybeSingle();

      if (user?.affiliate_opted_out) {
        console.log(`[EmailSequenceService] User ${userId} opted out of affiliate program`);
        return null;
      }

      // Calculate scheduled send time
      const triggerTimestamp = new Date();
      const scheduledSendAt = new Date(triggerTimestamp.getTime() + delayMinutes * 60 * 1000);

      // Insert email sequence
      const { data, error } = await supabaseAdmin
        .from('email_sequences')
        .insert({
          user_id: userId,
          sequence_type: sequenceType,
          trigger_event: triggerEvent,
          trigger_timestamp: triggerTimestamp.toISOString(),
          scheduled_send_at: scheduledSendAt.toISOString(),
          email_status: 'scheduled',
          email_content: emailContent,
        })
        .select()
        .single();

      if (error) {
        console.error('[EmailSequenceService] Error scheduling email:', error);
        throw error;
      }

      console.log(`[EmailSequenceService] Scheduled ${sequenceType} email for user ${userId} at ${scheduledSendAt.toISOString()}`);
      return data;
    } catch (error) {
      console.error('[EmailSequenceService] Error in scheduleEmail:', error);
      // Don't throw - we don't want to fail deliverable generation if email scheduling fails
      return null;
    }
  }

  /**
   * Get emails ready to send (scheduled time has passed)
   *
   * @param limit - Max emails to fetch (default: 50)
   */
  static async getEmailsToSend(limit: number = 50): Promise<EmailSequence[]> {
    const { data, error } = await supabaseAdmin
      .from('email_sequences')
      .select('*')
      .eq('email_status', 'scheduled')
      .lte('scheduled_send_at', new Date().toISOString())
      .order('scheduled_send_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[EmailSequenceService] Error fetching emails to send:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Check if email should still be sent (user hasn't enrolled or opted out since scheduling)
   */
  static async isEmailStillValid(emailSequence: EmailSequence): Promise<boolean> {
    // Check if user enrolled
    const { data: referralHierarchy } = await supabaseAdmin
      .from('referral_hierarchy')
      .select('id')
      .eq('user_id', emailSequence.user_id)
      .maybeSingle();

    if (referralHierarchy) {
      console.log(`[EmailSequenceService] User ${emailSequence.user_id} enrolled since scheduling, cancelling email`);
      return false;
    }

    // Check if user opted out
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('affiliate_opted_out')
      .eq('id', emailSequence.user_id)
      .maybeSingle();

    if (user?.affiliate_opted_out) {
      console.log(`[EmailSequenceService] User ${emailSequence.user_id} opted out since scheduling, cancelling email`);
      return false;
    }

    return true;
  }

  /**
   * Mark email as sent
   */
  static async markAsSent(emailId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('email_sequences')
      .update({
        email_status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', emailId);

    if (error) {
      console.error('[EmailSequenceService] Error marking email as sent:', error);
      throw error;
    }
  }

  /**
   * Mark email as failed
   */
  static async markAsFailed(emailId: string, reason: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('email_sequences')
      .update({
        email_status: 'failed',
        failed_at: new Date().toISOString(),
        failure_reason: reason,
      })
      .eq('id', emailId);

    if (error) {
      console.error('[EmailSequenceService] Error marking email as failed:', error);
      throw error;
    }
  }

  /**
   * Mark email as cancelled (user enrolled or opted out before send)
   */
  static async markAsCancelled(emailId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('email_sequences')
      .update({
        email_status: 'cancelled',
      })
      .eq('id', emailId);

    if (error) {
      console.error('[EmailSequenceService] Error marking email as cancelled:', error);
      throw error;
    }
  }

  /**
   * Cancel all pending emails for a user (called when user opts out)
   */
  static async cancelPendingEmails(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('email_sequences')
      .update({
        email_status: 'cancelled',
      })
      .eq('user_id', userId)
      .eq('email_status', 'scheduled');

    if (error) {
      console.error('[EmailSequenceService] Error cancelling pending emails:', error);
      throw error;
    }

    console.log(`[EmailSequenceService] Cancelled pending emails for user ${userId}`);
  }
}
```

---

## 📧 Phase 4: Email Template Service

### File: `src/lib/services/EmailTemplateService.ts` (NEW)

```typescript
import { EmailContent } from '@/types/database';

export class EmailTemplateService {
  /**
   * Generate affiliate invitation email
   */
  static generateAffiliateInvitation(emailContent: EmailContent, userId: string): {
    subject: string;
    text: string;
    html: string;
  } {
    const {
      user_first_name,
      product_name,
      deliverable_preview,
    } = emailContent;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online';
    const affiliateLink = `${baseUrl}/dashboard/affiliate/welcome?source=email&seq=affiliate_invitation&uid=${userId}`;
    const optOutLink = `${baseUrl}/api/affiliate/opt-out?user_id=${userId}&source=email`;

    const subject = `${user_first_name}, you just proved this works. Want to earn from it? 💰`;

    const text = `
Hi ${user_first_name},

Congrats on completing ${product_name}! 🎉

You just experienced firsthand how powerful this blueprint is. Now here's the thing...

What if you could earn while helping others get the same clarity you just got?

Our affiliate program lets you:

✅ Earn 30-60% commission on every sale (that's $2.10 - $4.20 per $7 product)
✅ Build passive income by sharing something you actually believe in
✅ Get paid for conversations you'd probably have anyway
✅ No inventory, no customer service, no complicated setup

Here's your deliverable preview (just so you remember how good this is):

"${deliverable_preview}"

You know what it's like to get this level of insight. Imagine being the person who helps someone else experience that same breakthrough.

Ready to turn your experience into income?

👉 Set Up Your Affiliate Link in 2 Minutes: ${affiliateLink}

Three ways to earn:
• Community Builder Track: 30% direct commissions + 40% to dinner party pool
• High Performer Track: 40% direct commissions + 30% to dinner party pool
• Independent Track: 60% direct commissions (keep it all)

Not interested? No worries - just ignore this email and enjoy your blueprint.

But if you're curious about building an income stream while helping others transform their business...

Set Up Your Link Here: ${affiliateLink}

To your quantum success,
Austin
Quantum Strategies

P.S. - The link you'll get is personalized to you. Every time someone uses it to purchase, you get paid. It's that simple.

---

Not interested in the affiliate program? Click here to opt out: ${optOutLink}

Quantum Strategies
support@quantumstrategies.online
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join Our Affiliate Program</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px;">Ready to Earn?</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your experience is valuable. Let's monetize it.</p>
  </div>

  <p>Hi <strong>${user_first_name}</strong>,</p>

  <p>Congrats on completing <strong>${product_name}</strong>! 🎉</p>

  <p>You just experienced firsthand how powerful this blueprint is. Now here's the thing...</p>

  <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold; color: #667eea;">What if you could earn while helping others get the same clarity you just got?</p>
  </div>

  <p>Our affiliate program lets you:</p>

  <ul style="list-style: none; padding: 0;">
    <li style="padding: 8px 0; padding-left: 30px; position: relative;">
      <span style="position: absolute; left: 0; color: #667eea;">✅</span>
      Earn <strong>30-60% commission</strong> on every sale (that's $2.10 - $4.20 per $7 product)
    </li>
    <li style="padding: 8px 0; padding-left: 30px; position: relative;">
      <span style="position: absolute; left: 0; color: #667eea;">✅</span>
      Build passive income by sharing something you actually believe in
    </li>
    <li style="padding: 8px 0; padding-left: 30px; position: relative;">
      <span style="position: absolute; left: 0; color: #667eea;">✅</span>
      Get paid for conversations you'd probably have anyway
    </li>
    <li style="padding: 8px 0; padding-left: 30px; position: relative;">
      <span style="position: absolute; left: 0; color: #667eea;">✅</span>
      No inventory, no customer service, no complicated setup
    </li>
  </ul>

  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
    <p style="margin: 0 0 5px 0; font-weight: bold; color: #856404;">Your deliverable preview:</p>
    <p style="margin: 0; font-style: italic; color: #856404;">"${deliverable_preview}"</p>
  </div>

  <p>You know what it's like to get this level of insight. Imagine being the person who helps someone else experience that same breakthrough.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${affiliateLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
      Set Up Your Affiliate Link in 2 Minutes →
    </a>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0; font-weight: bold;">Three ways to earn:</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>Community Builder:</strong> 30% direct + 40% to dinner party pool</li>
      <li><strong>High Performer:</strong> 40% direct + 30% to dinner party pool</li>
      <li><strong>Independent:</strong> 60% direct (keep it all)</li>
    </ul>
  </div>

  <p>Not interested? No worries - just ignore this email and enjoy your blueprint.</p>

  <p>But if you're curious about building an income stream while helping others transform their business...</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${affiliateLink}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">
      Yes, Show Me How to Get Started
    </a>
  </div>

  <p>To your quantum success,<br>
  <strong>Austin</strong><br>
  Quantum Strategies</p>

  <p style="font-size: 12px; color: #999;">P.S. - The link you'll get is personalized to you. Every time someone uses it to purchase, you get paid. It's that simple.</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <p style="font-size: 12px; color: #666; text-align: center;">
    Not interested in the affiliate program? <a href="${optOutLink}" style="color: #667eea;">Click here to opt out</a>
  </p>

  <p style="font-size: 12px; color: #999; text-align: center;">
    Quantum Strategies<br>
    <a href="mailto:support@quantumstrategies.online" style="color: #667eea;">support@quantumstrategies.online</a>
  </p>

</body>
</html>
    `.trim();

    return { subject, text, html };
  }

  /**
   * Extract first name from full name
   */
  static getFirstName(fullName: string | null): string {
    if (!fullName) return 'there';
    const parts = fullName.trim().split(' ');
    return parts[0] || 'there';
  }

  /**
   * Truncate deliverable to preview length
   */
  static getDeliverablePreview(deliverable: string, maxLength: number = 200): string {
    if (deliverable.length <= maxLength) return deliverable;

    // Find last complete sentence within limit
    const truncated = deliverable.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > maxLength * 0.7) {
      // If we're close enough to limit, use the sentence boundary
      return deliverable.substring(0, lastPeriod + 1);
    }

    // Otherwise just truncate and add ellipsis
    return truncated.trim() + '...';
  }
}
```

---

## 🔄 Phase 5: Update Final Briefing Route

### File: `src/app/api/products/final-briefing/route.ts` (UPDATE)

Add email scheduling after successful deliverable generation:

```typescript
import { EmailSequenceService } from '@/lib/services/EmailSequenceService';
import { EmailTemplateService } from '@/lib/services/EmailTemplateService';

export async function POST(req: Request) {
  try {
    // ... existing code for generating briefing ...

    // Update product_sessions.deliverable
    await supabaseAdmin
      .from('product_sessions')
      .update({
        deliverable: briefing,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    // ✨ NEW: Schedule affiliate invitation email
    try {
      // Get user data for email
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, name')
        .eq('id', session.user_id)
        .single();

      if (user) {
        const emailContent = {
          product_name: productName || 'Quantum Initiation',
          product_slug: productSlug || 'quantum-initiation',
          deliverable_preview: EmailTemplateService.getDeliverablePreview(briefing),
          user_first_name: EmailTemplateService.getFirstName(user.name),
          user_email: user.email,
        };

        await EmailSequenceService.scheduleEmail(
          session.user_id,
          'affiliate_invitation',
          'deliverable_completed',
          emailContent,
          30 // 30 minutes delay
        );

        console.log(`[final-briefing] Scheduled affiliate invitation for user ${session.user_id}`);
      }
    } catch (emailError) {
      // Log but don't fail the request
      console.error('[final-briefing] Error scheduling email:', emailError);
    }

    return NextResponse.json({ briefing });
  } catch (err: any) {
    console.error('final-briefing error', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate briefing' }, { status: 500 });
  }
}
```

---

## ⏰ Phase 6: Email Processing Cron Job

### File: `src/app/api/cron/process-email-sequences/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { EmailSequenceService } from '@/lib/services/EmailSequenceService';
import { EmailTemplateService } from '@/lib/services/EmailTemplateService';
import { sendEmail } from '@/lib/email/gmail-sender';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for cron job

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[process-email-sequences] Starting email processing...');

    // Fetch emails ready to send
    const emailsToSend = await EmailSequenceService.getEmailsToSend(50);

    console.log(`[process-email-sequences] Found ${emailsToSend.length} emails to process`);

    const results = {
      sent: 0,
      cancelled: 0,
      failed: 0,
      skipped: 0,
    };

    // Process each email
    for (const emailSequence of emailsToSend) {
      try {
        // Check if email should still be sent
        const isValid = await EmailSequenceService.isEmailStillValid(emailSequence);

        if (!isValid) {
          await EmailSequenceService.markAsCancelled(emailSequence.id);
          results.cancelled++;
          continue;
        }

        // Generate email content
        let emailData: { subject: string; text: string; html: string };

        if (emailSequence.sequence_type === 'affiliate_invitation') {
          emailData = EmailTemplateService.generateAffiliateInvitation(
            emailSequence.email_content,
            emailSequence.user_id
          );
        } else {
          console.warn(`[process-email-sequences] Unknown sequence type: ${emailSequence.sequence_type}`);
          results.skipped++;
          continue;
        }

        // Send email
        const emailSent = await sendEmail({
          to: emailSequence.email_content.user_email,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
        });

        if (emailSent) {
          await EmailSequenceService.markAsSent(emailSequence.id);
          results.sent++;
          console.log(`[process-email-sequences] ✅ Sent email to ${emailSequence.email_content.user_email}`);
        } else {
          await EmailSequenceService.markAsFailed(emailSequence.id, 'Gmail API returned false');
          results.failed++;
          console.error(`[process-email-sequences] ❌ Failed to send email to ${emailSequence.email_content.user_email}`);
        }
      } catch (error: any) {
        console.error(`[process-email-sequences] Error processing email ${emailSequence.id}:`, error);
        await EmailSequenceService.markAsFailed(emailSequence.id, error.message || 'Unknown error');
        results.failed++;
      }
    }

    console.log('[process-email-sequences] Processing complete:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[process-email-sequences] Cron job error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to process email sequences',
    }, { status: 500 });
  }
}
```

---

## 🚫 Phase 7: Opt-Out Endpoint

### File: `src/app/api/affiliate/opt-out/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { EmailSequenceService } from '@/lib/services/EmailSequenceService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const source = searchParams.get('source') || 'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: 'Invalid user_id format' }, { status: 400 });
    }

    console.log(`[opt-out] User ${userId} opting out (source: ${source})`);

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, affiliate_opted_out')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already opted out
    if (user.affiliate_opted_out) {
      console.log(`[opt-out] User ${userId} already opted out`);

      // Redirect to dashboard with message
      const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL);
      redirectUrl.searchParams.set('message', 'already_opted_out');

      return NextResponse.redirect(redirectUrl);
    }

    // Transaction: Update user + Cancel pending emails
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        affiliate_opted_out: true,
        first_affiliate_visit: new Date().toISOString(), // Record when they declined
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[opt-out] Error updating user:', updateError);
      throw updateError;
    }

    // Cancel all pending email sequences
    await EmailSequenceService.cancelPendingEmails(userId);

    console.log(`[opt-out] ✅ User ${userId} successfully opted out`);

    // Redirect to dashboard with confirmation
    const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL);
    redirectUrl.searchParams.set('message', 'opted_out_success');

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('[opt-out] Error:', error);
    return NextResponse.json({
      error: 'Failed to process opt-out',
      details: error.message,
    }, { status: 500 });
  }
}
```

---

## ⚙️ Phase 8: Vercel Configuration

### File: `vercel.json` (UPDATE or CREATE)

```json
{
  "crons": [
    {
      "path": "/api/cron/process-email-sequences",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule Explanation:**
- `*/5 * * * *` = Every 5 minutes
- Cron format: `minute hour day month weekday`

**Alternative Schedules:**
- Every 10 minutes: `*/10 * * * *`
- Every 15 minutes: `*/15 * * * *`
- Every 30 minutes: `*/30 * * * *`

---

## 📊 Phase 9: Analytics Queries

### File: `scripts/analytics/email-sequences.sql` (NEW)

Create this file for reporting queries:

```sql
-- ============================================================================
-- Email Sequence Analytics Queries
-- ============================================================================

-- 1. Overall Email Performance
SELECT
  email_status,
  COUNT(*) AS count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM email_sequences
WHERE sequence_type = 'affiliate_invitation'
GROUP BY email_status
ORDER BY count DESC;

-- 2. Enrollment Rate from Emails
WITH email_sent AS (
  SELECT
    user_id,
    sent_at
  FROM email_sequences
  WHERE sequence_type = 'affiliate_invitation'
    AND email_status = 'sent'
),
enrolled_after_email AS (
  SELECT
    es.user_id,
    es.sent_at,
    rh.created_at AS enrolled_at
  FROM email_sent es
  JOIN referral_hierarchy rh ON rh.user_id = es.user_id
  WHERE rh.created_at > es.sent_at
)
SELECT
  COUNT(DISTINCT es.user_id) AS total_emails_sent,
  COUNT(DISTINCT eae.user_id) AS enrolled_after_email,
  ROUND(100.0 * COUNT(DISTINCT eae.user_id) / COUNT(DISTINCT es.user_id), 2) AS enrollment_rate_pct
FROM email_sent es
LEFT JOIN enrolled_after_email eae ON eae.user_id = es.user_id;

-- 3. Average Time to Enrollment
WITH enrollments_from_email AS (
  SELECT
    es.user_id,
    es.sent_at,
    rh.created_at AS enrolled_at,
    EXTRACT(EPOCH FROM (rh.created_at - es.sent_at))/3600 AS hours_to_enroll
  FROM email_sequences es
  JOIN referral_hierarchy rh ON rh.user_id = es.user_id
  WHERE es.email_status = 'sent'
    AND rh.created_at > es.sent_at
)
SELECT
  ROUND(AVG(hours_to_enroll), 2) AS avg_hours_to_enroll,
  ROUND(MIN(hours_to_enroll), 2) AS min_hours,
  ROUND(MAX(hours_to_enroll), 2) AS max_hours,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hours_to_enroll), 2) AS median_hours
FROM enrollments_from_email;

-- 4. Opt-Out Rate
SELECT
  COUNT(DISTINCT CASE WHEN email_status = 'cancelled'
    AND EXISTS(SELECT 1 FROM users WHERE id = user_id AND affiliate_opted_out = TRUE)
    THEN user_id END) AS opted_out_count,
  COUNT(DISTINCT user_id) AS total_scheduled,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN email_status = 'cancelled'
    AND EXISTS(SELECT 1 FROM users WHERE id = user_id AND affiliate_opted_out = TRUE)
    THEN user_id END) / COUNT(DISTINCT user_id), 2) AS opt_out_rate_pct
FROM email_sequences
WHERE sequence_type = 'affiliate_invitation';

-- 5. Email Processing Timeline
SELECT
  DATE(scheduled_send_at) AS scheduled_date,
  COUNT(*) AS total_scheduled,
  SUM(CASE WHEN email_status = 'sent' THEN 1 ELSE 0 END) AS sent,
  SUM(CASE WHEN email_status = 'failed' THEN 1 ELSE 0 END) AS failed,
  SUM(CASE WHEN email_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
  SUM(CASE WHEN email_status = 'scheduled' THEN 1 ELSE 0 END) AS pending
FROM email_sequences
WHERE sequence_type = 'affiliate_invitation'
GROUP BY DATE(scheduled_send_at)
ORDER BY scheduled_date DESC
LIMIT 30;

-- 6. Delivery Success Rate
SELECT
  ROUND(100.0 * SUM(CASE WHEN email_status = 'sent' THEN 1 ELSE 0 END) /
    (SUM(CASE WHEN email_status = 'sent' THEN 1 ELSE 0 END) +
     SUM(CASE WHEN email_status = 'failed' THEN 1 ELSE 0 END)), 2) AS delivery_success_rate_pct,
  SUM(CASE WHEN email_status = 'sent' THEN 1 ELSE 0 END) AS sent_count,
  SUM(CASE WHEN email_status = 'failed' THEN 1 ELSE 0 END) AS failed_count
FROM email_sequences
WHERE sequence_type = 'affiliate_invitation'
  AND email_status IN ('sent', 'failed');

-- 7. Failed Emails (For Manual Review)
SELECT
  id,
  user_id,
  email_content->>'user_email' AS email,
  email_content->>'user_first_name' AS first_name,
  failed_at,
  failure_reason
FROM email_sequences
WHERE email_status = 'failed'
ORDER BY failed_at DESC
LIMIT 20;

-- 8. Hourly Distribution (When do emails get sent?)
SELECT
  EXTRACT(HOUR FROM sent_at) AS hour_of_day,
  COUNT(*) AS emails_sent
FROM email_sequences
WHERE email_status = 'sent'
GROUP BY EXTRACT(HOUR FROM sent_at)
ORDER BY hour_of_day;
```

---

## ✅ Testing Checklist

### Unit Tests

```typescript
// tests/services/EmailSequenceService.test.ts
describe('EmailSequenceService', () => {
  it('should schedule email for eligible user', async () => {
    // Test scheduling logic
  });

  it('should not schedule email if user already enrolled', async () => {
    // Test enrollment check
  });

  it('should not schedule email if user opted out', async () => {
    // Test opt-out check
  });

  it('should cancel email if user enrolls before send', async () => {
    // Test cancellation logic
  });
});

// tests/services/EmailTemplateService.test.ts
describe('EmailTemplateService', () => {
  it('should generate correct email content', () => {
    const content = EmailTemplateService.generateAffiliateInvitation(mockEmailContent, 'user-id');
    expect(content.subject).toContain('John');
    expect(content.text).toContain('Quantum Initiation');
  });

  it('should truncate deliverable preview to 200 chars', () => {
    const preview = EmailTemplateService.getDeliverablePreview(longText);
    expect(preview.length).toBeLessThanOrEqual(203); // 200 + '...'
  });
});
```

### Integration Tests

```typescript
// tests/integration/email-sequence-flow.test.ts
describe('Email Sequence Flow', () => {
  it('should schedule email when deliverable generated', async () => {
    // Call final-briefing API
    // Verify email_sequences record created
  });

  it('should send email when cron runs', async () => {
    // Create scheduled email
    // Call cron endpoint
    // Verify email status = 'sent'
  });

  it('should handle opt-out correctly', async () => {
    // Schedule email
    // Call opt-out endpoint
    // Verify email cancelled and user opted out
  });
});
```

### Manual Testing Checklist

- [ ] Schedule email for test user
- [ ] Verify email appears in database with correct timestamp
- [ ] Wait for scheduled time (or mock time)
- [ ] Trigger cron job manually
- [ ] Verify email sent to test inbox
- [ ] Check email formatting on desktop
- [ ] Check email formatting on mobile
- [ ] Click affiliate link, verify redirect
- [ ] Click opt-out link, verify user opted out
- [ ] Verify no duplicate emails sent
- [ ] Test edge case: user deletes account after scheduling
- [ ] Test edge case: user enrolls manually before email sends

---

## 🚀 Deployment Plan

### Pre-Deployment

**Week 1: Development & Staging**
1. [ ] Create database migration
2. [ ] Implement EmailSequenceService
3. [ ] Implement EmailTemplateService
4. [ ] Update final-briefing route
5. [ ] Create cron job endpoint
6. [ ] Create opt-out endpoint
7. [ ] Deploy to staging
8. [ ] Run database migration in staging
9. [ ] Test complete flow in staging

**Week 2: Testing & Refinement**
1. [ ] Send test emails to team
2. [ ] Verify email rendering (10+ email clients)
3. [ ] Test all edge cases
4. [ ] Review analytics queries
5. [ ] Set up monitoring/alerting
6. [ ] Prepare rollback plan

### Production Deployment

**Phase 1: Soft Launch (10% traffic)**
1. [ ] Set `CRON_SECRET` in production env vars
2. [ ] Deploy code to production
3. [ ] Run database migration
4. [ ] Enable cron job (Vercel dashboard)
5. [ ] Monitor first 24 hours closely
6. [ ] Send to 10% of users (feature flag or random sampling)

**Phase 2: Ramp Up (50% traffic)**
- If Phase 1 metrics hit targets (>30% enrollment, <5% failed emails)
- Enable for 50% of users
- Continue monitoring

**Phase 3: Full Release (100% traffic)**
- If Phase 2 metrics stable
- Enable for all users
- Remove feature flag

### Rollback Plan

**If issues occur:**
1. Disable Vercel Cron immediately (dashboard)
2. Mark all pending emails as 'cancelled'
3. Investigate root cause
4. Fix and re-test in staging
5. Re-enable with phased rollout

**Rollback SQL:**
```sql
-- Cancel all pending emails
UPDATE email_sequences
SET email_status = 'cancelled'
WHERE email_status = 'scheduled';
```

---

## 📈 Success Metrics (4-Week Review)

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Target |
|--------|--------|--------|--------|--------|--------|
| Emails Sent | - | - | - | - | - |
| Enrollment Rate | - | - | - | - | 40%+ |
| Delivery Success | - | - | - | - | 95%+ |
| Opt-Out Rate | - | - | - | - | <10% |
| Avg Time to Enroll | - | - | - | - | <24hrs |

**Go/No-Go Decision:**
- ✅ **Success:** Enrollment ≥35%, Delivery ≥95%, Opt-out ≤10%
  → Make email sequence primary enrollment method

- ⚠️ **Marginal:** Enrollment 25-34%
  → A/B test email variations

- ❌ **Failure:** Enrollment <25%
  → Investigate and potentially revert

---

## 🔮 Future Enhancements

### V2 Features (Post-Launch)

**Multi-Touch Sequence:**
```typescript
// Email 1: 30 min after deliverable (current)
// Email 2: 24 hours later if not enrolled (reminder)
// Email 3: 7 days later if not enrolled (social proof)

sequence_type: 'affiliate_invitation_2' | 'affiliate_invitation_3'
```

**Dynamic Timing:**
```typescript
// Send at user's optimal time (ML-based)
const optimalHour = await predictOptimalSendTime(userId);
```

**A/B Testing:**
```sql
ALTER TABLE email_sequences ADD COLUMN variant TEXT; -- 'control', 'test_a', 'test_b'
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Emails not sending**
- Check: Vercel Cron enabled?
- Check: `CRON_SECRET` set?
- Check: Gmail API quota not exceeded?
- Check: Database has pending emails?

**Issue: Duplicate emails**
- Verify: UNIQUE constraint on (user_id, sequence_type)
- Check: Cron job not running multiple times?

**Issue: High opt-out rate**
- Review: Email copy too pushy?
- Check: Sending too soon after deliverable?
- Test: Different value propositions

### Monitoring Queries

```sql
-- Check cron health (should have recent activity)
SELECT MAX(sent_at) FROM email_sequences WHERE email_status = 'sent';

-- Check pending count
SELECT COUNT(*) FROM email_sequences WHERE email_status = 'scheduled';

-- Check failure rate (last 7 days)
SELECT
  COUNT(*) FILTER (WHERE email_status = 'failed') AS failed,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE email_status = 'failed') / COUNT(*), 2) AS fail_rate_pct
FROM email_sequences
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

**Implementation Complete When:**
- [ ] All 9 phases implemented
- [ ] All tests passing
- [ ] Deployed to production
- [ ] Cron running successfully
- [ ] First emails sent and delivered
- [ ] Analytics tracking enrollment rate
- [ ] Team can monitor and debug issues

---

**Total Estimated Time:** 3-4 weeks
**Risk Level:** Low-Medium
**Dependencies:** Gmail API, Vercel Cron
**Impact:** High (expected 40% improvement in affiliate enrollment)