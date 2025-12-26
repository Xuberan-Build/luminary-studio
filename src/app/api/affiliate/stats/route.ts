/**
 * Get affiliate stats for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
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

    // Get affiliate stats using database function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_affiliate_stats', { p_affiliate_id: userId })
      .single();

    if (statsError) {
      console.error('Error fetching affiliate stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Get recent transactions
    const { data: recentTransactions } = await supabase
      .from('affiliate_transactions')
      .select(`
        id,
        created_at,
        amount_cents,
        direct_commission_cents,
        override_commission_cents,
        commission_status,
        direct_track,
        purchaser:users!affiliate_transactions_purchaser_id_fkey(email, name)
      `)
      .or(`direct_referrer_id.eq.${userId},override_referrer_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get dinner party pool status
    const { data: activePool } = await supabase
      .from('dinner_party_pools')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Format response
    return NextResponse.json({
      stats: {
        referralCode: stats?.referral_code || '',
        referralLink: stats?.referral_link || '',
        currentTrack: stats?.current_track || 'community_builder',
        totalEarningsCents: stats?.total_earnings_cents || 0,
        availableBalanceCents: stats?.available_balance_cents || 0,
        totalReferrals: stats?.total_referrals || 0,
        activeReferrals: stats?.active_referrals || 0,
        dinnerPartyCreditsCents: stats?.dinner_party_credits_cents || 0,
        stripeConnectOnboardingComplete: stats?.stripe_connect_onboarding_complete || false,
      },
      recentTransactions: recentTransactions || [],
      activePool: activePool || null,
    });

  } catch (error: any) {
    console.error('Affiliate stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
