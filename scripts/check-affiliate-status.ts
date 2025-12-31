#!/usr/bin/env tsx
/**
 * Check user's affiliate enrollment status
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAffiliateStatus(email: string) {
  console.log('\n🔍 Checking affiliate status for:', email);
  console.log('═'.repeat(60));

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    console.log('\n❌ User not found');
    return;
  }

  console.log('\n👤 User Info:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.full_name || user.name}`);
  console.log(`   Is Affiliate: ${user.is_affiliate ? '✅' : '❌'}`);
  console.log(`   Opted Out: ${user.affiliate_opted_out ? '✅' : '❌'}`);
  console.log(`   First Visit: ${user.first_affiliate_visit || 'Never'}`);

  // Check referral_hierarchy
  const { data: hierarchy } = await supabase
    .from('referral_hierarchy')
    .select('*')
    .eq('affiliate_id', user.id)
    .single();

  console.log('\n\n🌲 Referral Hierarchy:');
  if (hierarchy) {
    console.log(`   ✅ Record exists`);
    console.log(`   Referral Code: ${hierarchy.referral_code}`);
    console.log(`   Current Track: ${hierarchy.current_track}`);
    console.log(`   Referred By: ${hierarchy.referred_by_id || 'None (root)'}`);
    console.log(`   Direct Sponsor: ${hierarchy.direct_sponsor_id || 'None'}`);
    console.log(`   Created: ${new Date(hierarchy.created_at).toLocaleString()}`);
  } else {
    console.log(`   ❌ No referral_hierarchy record found`);
    console.log(`   User will be redirected to /dashboard/affiliate/welcome`);
  }

  // Check Stripe Connect
  const { data: stripeAccount } = await supabase
    .from('stripe_connect_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  console.log('\n\n💳 Stripe Connect:');
  if (stripeAccount) {
    console.log(`   ✅ Account exists`);
    console.log(`   Account ID: ${stripeAccount.stripe_account_id}`);
    console.log(`   Onboarding Complete: ${stripeAccount.onboarding_complete ? '✅' : '❌'}`);
    console.log(`   Payouts Enabled: ${stripeAccount.payouts_enabled ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ No Stripe Connect account`);
  }

  // Check commissions
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', user.id);

  console.log('\n\n💰 Commissions:');
  console.log(`   Total: ${commissions?.length || 0}`);
  if (commissions && commissions.length > 0) {
    const totalCents = commissions.reduce((sum, c) => sum + (c.direct_commission_cents || 0) + (c.override_commission_cents || 0), 0);
    console.log(`   Total Earned: $${(totalCents / 100).toFixed(2)}`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Check complete\n');
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/check-affiliate-status.ts <email>');
  process.exit(1);
}

checkAffiliateStatus(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
