/**
 * Affiliate Program Enrollment API
 * Enrolls user in affiliate program with referral code and Stripe Connect account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createConnectAccount } from '@/lib/stripe/connect';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email!;

    // Check if already enrolled
    const { data: existingHierarchy } = await supabaseAdmin
      .from('referral_hierarchy')
      .select('id, referral_code')
      .eq('affiliate_id', userId)
      .single();

    if (existingHierarchy) {
      return NextResponse.json(
        { error: 'Already enrolled in affiliate program' },
        { status: 400 }
      );
    }

    // Check if user has opted out
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('affiliate_opted_out')
      .eq('id', userId)
      .single();

    if (user?.affiliate_opted_out) {
      // User previously opted out - clear opt-out flag to allow re-enrollment
      await supabaseAdmin
        .from('users')
        .update({ affiliate_opted_out: false })
        .eq('id', userId);
    }

    // Get referred_by_id from referral cookie if exists
    const referralCode = cookieStore.get('referral_code')?.value;
    let referredById = null;

    if (referralCode) {
      const { data: referrer } = await supabaseAdmin
        .from('referral_hierarchy')
        .select('affiliate_id')
        .eq('referral_code', referralCode)
        .single();

      if (referrer) {
        referredById = referrer.affiliate_id;
      }
    }

    // Generate unique referral code using database function
    const { data: codeResult, error: codeError } = await supabaseAdmin
      .rpc('generate_referral_code');

    if (codeError || !codeResult) {
      console.error('Error generating referral code:', codeError);
      throw new Error('Failed to generate referral code');
    }

    const newReferralCode = codeResult as string;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online';
    const referralLink = `${baseUrl}?ref=${newReferralCode}`;

    // Create referral_hierarchy record
    const { error: hierarchyError } = await supabaseAdmin
      .from('referral_hierarchy')
      .insert({
        affiliate_id: userId,
        referred_by_id: referredById,
        referral_code: newReferralCode,
        referral_link: referralLink,
        current_track: 'community_builder',
        enrolled_at: new Date().toISOString(),
      });

    if (hierarchyError) {
      console.error('Error creating referral hierarchy:', hierarchyError);
      throw new Error('Failed to create affiliate record');
    }

    // Update users table
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        is_affiliate: true,
        affiliate_enrolled_at: new Date().toISOString(),
        affiliate_opted_out: false,
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      throw new Error('Failed to update user status');
    }

    // Try to create Stripe Connect account (non-blocking)
    // If this fails, user can set up Stripe later from dashboard
    let stripeAccountId = null;
    let stripeError = null;

    try {
      const accountInfo = await createConnectAccount(userId, userEmail);
      stripeAccountId = accountInfo.accountId;
      console.log('Stripe Connect account created:', stripeAccountId);
    } catch (error: any) {
      console.error('Stripe Connect account creation failed (non-critical):', error);
      stripeError = error.message;
      // Continue anyway - user can set up Stripe later
    }

    return NextResponse.json({
      success: true,
      referralCode: newReferralCode,
      referralLink,
      stripeAccountId,
      stripeError: stripeError || undefined,
    });

  } catch (error: any) {
    console.error('Enrollment API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enroll in affiliate program' },
      { status: 500 }
    );
  }
}
