/**
 * Email Sequence Service
 * Handles scheduling, sending, and managing automated email sequences
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import type {
  EmailSequence,
  EmailSequenceInsert,
  EmailSequenceUpdate,
  EmailContent,
  SequenceType,
  TriggerEvent,
} from '@/types/database';

// Re-export types for convenience
export type { EmailContent, SequenceType, TriggerEvent };

export class EmailSequenceService {
  /**
   * Schedule an email to be sent after a delay
   */
  static async scheduleEmail(
    userId: string,
    sequenceType: SequenceType,
    triggerEvent: TriggerEvent,
    emailContent: EmailContent,
    delayMinutes: number = 30
  ): Promise<EmailSequence | null> {
    try {
      const now = new Date();
      const scheduledSendAt = new Date(now.getTime() + delayMinutes * 60 * 1000);

      const emailData: EmailSequenceInsert = {
        user_id: userId,
        sequence_type: sequenceType,
        trigger_event: triggerEvent,
        trigger_timestamp: now.toISOString(),
        scheduled_send_at: scheduledSendAt.toISOString(),
        delay_minutes: delayMinutes,
        email_content: emailContent,
      };

      // Upsert: if user already has this sequence type, update it
      const { data, error } = await supabaseAdmin
        .from('email_sequences')
        .upsert(emailData, {
          onConflict: 'user_id,sequence_type',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error('[EmailSequenceService] Failed to schedule email:', error);
        return null;
      }

      console.log(
        `[EmailSequenceService] Scheduled ${sequenceType} email for user ${userId} at ${scheduledSendAt.toISOString()}`
      );

      return data as EmailSequence;
    } catch (error) {
      console.error('[EmailSequenceService] Error scheduling email:', error);
      return null;
    }
  }

  /**
   * Get all emails ready to be sent (scheduled_send_at <= now and status = 'scheduled')
   */
  static async getEmailsToSend(limit: number = 50): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_sequences')
        .select('*')
        .eq('email_status', 'scheduled')
        .lte('scheduled_send_at', new Date().toISOString())
        .order('scheduled_send_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('[EmailSequenceService] Failed to fetch emails to send:', error);
        return [];
      }

      return (data as EmailSequence[]) || [];
    } catch (error) {
      console.error('[EmailSequenceService] Error fetching emails to send:', error);
      return [];
    }
  }

  /**
   * Check if email should still be sent
   * Returns false if user has enrolled in affiliate program or opted out
   */
  static async isEmailStillValid(userId: string): Promise<boolean> {
    try {
      // Check if user has enrolled or opted out
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('is_affiliate, affiliate_opted_out')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[EmailSequenceService] Failed to check user status:', userError);
        return false;
      }

      // Don't send if user already enrolled or opted out
      if (user.is_affiliate || user.affiliate_opted_out) {
        console.log(
          `[EmailSequenceService] Email no longer valid for user ${userId} (enrolled: ${user.is_affiliate}, opted out: ${user.affiliate_opted_out})`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('[EmailSequenceService] Error checking email validity:', error);
      return false;
    }
  }

  /**
   * Mark email as sent
   */
  static async markAsSent(emailId: string): Promise<boolean> {
    try {
      const update: EmailSequenceUpdate = {
        email_status: 'sent',
        sent_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from('email_sequences')
        .update(update)
        .eq('id', emailId);

      if (error) {
        console.error('[EmailSequenceService] Failed to mark email as sent:', error);
        return false;
      }

      console.log(`[EmailSequenceService] Marked email ${emailId} as sent`);
      return true;
    } catch (error) {
      console.error('[EmailSequenceService] Error marking email as sent:', error);
      return false;
    }
  }

  /**
   * Mark email as failed
   */
  static async markAsFailed(
    emailId: string,
    failureReason: string,
    incrementRetry: boolean = false
  ): Promise<boolean> {
    try {
      // Get current retry count if needed
      let retryCount = 0;
      if (incrementRetry) {
        const { data } = await supabaseAdmin
          .from('email_sequences')
          .select('retry_count')
          .eq('id', emailId)
          .single();

        retryCount = (data?.retry_count || 0) + 1;
      }

      const update: EmailSequenceUpdate = {
        email_status: 'failed',
        failed_at: new Date().toISOString(),
        failure_reason: failureReason,
        ...(incrementRetry && { retry_count: retryCount }),
      };

      const { error } = await supabaseAdmin
        .from('email_sequences')
        .update(update)
        .eq('id', emailId);

      if (error) {
        console.error('[EmailSequenceService] Failed to mark email as failed:', error);
        return false;
      }

      console.log(`[EmailSequenceService] Marked email ${emailId} as failed: ${failureReason}`);
      return true;
    } catch (error) {
      console.error('[EmailSequenceService] Error marking email as failed:', error);
      return false;
    }
  }

  /**
   * Mark email as cancelled
   */
  static async markAsCancelled(emailId: string): Promise<boolean> {
    try {
      const update: EmailSequenceUpdate = {
        email_status: 'cancelled',
      };

      const { error } = await supabaseAdmin
        .from('email_sequences')
        .update(update)
        .eq('id', emailId);

      if (error) {
        console.error('[EmailSequenceService] Failed to mark email as cancelled:', error);
        return false;
      }

      console.log(`[EmailSequenceService] Marked email ${emailId} as cancelled`);
      return true;
    } catch (error) {
      console.error('[EmailSequenceService] Error marking email as cancelled:', error);
      return false;
    }
  }

  /**
   * Cancel all pending emails for a user
   * Used when user enrolls or opts out
   */
  static async cancelPendingEmails(userId: string): Promise<number> {
    try {
      const { data, error } = await supabaseAdmin.rpc('cancel_user_pending_emails', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[EmailSequenceService] Failed to cancel pending emails:', error);
        return 0;
      }

      const cancelledCount = data || 0;
      console.log(`[EmailSequenceService] Cancelled ${cancelledCount} pending emails for user ${userId}`);

      return cancelledCount;
    } catch (error) {
      console.error('[EmailSequenceService] Error cancelling pending emails:', error);
      return 0;
    }
  }

  /**
   * Get email sequence by ID
   */
  static async getEmailById(emailId: string): Promise<EmailSequence | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_sequences')
        .select('*')
        .eq('id', emailId)
        .single();

      if (error) {
        console.error('[EmailSequenceService] Failed to get email by ID:', error);
        return null;
      }

      return data as EmailSequence;
    } catch (error) {
      console.error('[EmailSequenceService] Error getting email by ID:', error);
      return null;
    }
  }

  /**
   * Get user's email sequences
   */
  static async getUserEmailSequences(userId: string): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_sequences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[EmailSequenceService] Failed to get user email sequences:', error);
        return [];
      }

      return (data as EmailSequence[]) || [];
    } catch (error) {
      console.error('[EmailSequenceService] Error getting user email sequences:', error);
      return [];
    }
  }

  /**
   * Clean up old email sequences (retention policy)
   * Call this periodically via cron job
   */
  static async cleanupOldEmails(daysToKeep: number = 90): Promise<number> {
    try {
      const { data, error } = await supabaseAdmin.rpc('cleanup_old_email_sequences', {
        days_to_keep: daysToKeep,
      });

      if (error) {
        console.error('[EmailSequenceService] Failed to clean up old emails:', error);
        return 0;
      }

      const deletedCount = data || 0;
      console.log(`[EmailSequenceService] Cleaned up ${deletedCount} old email sequences`);

      return deletedCount;
    } catch (error) {
      console.error('[EmailSequenceService] Error cleaning up old emails:', error);
      return 0;
    }
  }
}
