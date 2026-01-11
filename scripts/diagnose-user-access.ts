import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try multiple .env files in order
const envFiles = ['.env.production.local', '.env.local', '.env'];
for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    console.log(`📝 Loaded environment from ${file}\n`);
    break;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function diagnoseUserAccess(emailOrName: string) {
  console.log(`🔍 DIAGNOSING USER ACCESS`);
  console.log(`Search: ${emailOrName}\n`);

  // Get user by email or name
  const { data: authData } = await supabase.auth.admin.listUsers();
  const user = authData.users.find(
    (u) =>
      u.email?.toLowerCase().includes(emailOrName.toLowerCase()) ||
      u.user_metadata?.full_name?.toLowerCase().includes(emailOrName.toLowerCase())
  );

  if (!user) {
    console.log('❌ User not found');
    console.log('\n📋 Available users:');
    authData.users.forEach((u) => {
      console.log(`  - ${u.email} (${u.user_metadata?.full_name || 'No name'})`);
    });
    return;
  }

  const userId = user.id;
  console.log(`✓ User found:`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Name: ${user.user_metadata?.full_name || 'Not set'}`);
  console.log(`  ID: ${userId}\n`);

  // Check product access
  console.log(`📊 PRODUCT ACCESS:`);
  const { data: accessRecords } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!accessRecords || accessRecords.length === 0) {
    console.log('  ❌ NO PRODUCT ACCESS RECORDS\n');
  } else {
    accessRecords.forEach((access) => {
      console.log(`\n  Product: ${access.product_slug}`);
      console.log(`    Access Granted: ${access.access_granted ? '✅ YES' : '❌ NO'}`);
      console.log(`    Purchase ID: ${access.purchase_id || 'None'}`);
      console.log(`    Created: ${new Date(access.created_at).toLocaleString()}`);
      console.log(`    Started: ${access.started_at ? new Date(access.started_at).toLocaleString() : 'Never'}`);
      console.log(`    Free Attempts: ${access.free_attempts_remaining}`);
    });
  }

  // Check Stripe payments
  console.log(`\n\n💳 STRIPE PAYMENTS:`);
  const { data: payments } = await supabase
    .from('stripe_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!payments || payments.length === 0) {
    console.log('  ❌ NO PAYMENT RECORDS\n');
  } else {
    payments.forEach((payment) => {
      console.log(`\n  Payment ID: ${payment.id}`);
      console.log(`    Status: ${payment.status}`);
      console.log(`    Amount: $${(payment.amount / 100).toFixed(2)}`);
      console.log(`    Product: ${payment.product_slug || 'Not set'}`);
      console.log(`    Session ID: ${payment.stripe_session_id}`);
      console.log(`    Created: ${new Date(payment.created_at).toLocaleString()}`);
      console.log(`    Webhook Processed: ${payment.webhook_processed_at ? new Date(payment.webhook_processed_at).toLocaleString() : 'NOT PROCESSED'}`);
    });
  }

  // Check product sessions
  console.log(`\n\n📝 PRODUCT SESSIONS:`);
  const { data: sessions } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!sessions || sessions.length === 0) {
    console.log('  ❌ NO SESSIONS\n');
  } else {
    sessions.forEach((session) => {
      console.log(`\n  Product: ${session.product_slug}`);
      console.log(`    Session ID: ${session.id.substring(0, 8)}...`);
      console.log(`    Progress: Step ${session.current_step}/${session.total_steps}`);
      console.log(`    Placements Confirmed: ${session.placements_confirmed ? '✅' : '❌'}`);
      console.log(`    Created: ${new Date(session.created_at).toLocaleString()}`);
    });
  }

  console.log('\n\n🔧 DIAGNOSIS:');
  const hasPayment = payments && payments.length > 0;
  const hasAccess = accessRecords && accessRecords.some((a) => a.access_granted);
  const hasSession = sessions && sessions.length > 0;

  if (hasPayment && !hasAccess) {
    console.log('  ⚠️  ISSUE: Payment exists but NO access granted');
    console.log('  💡 SOLUTION: Webhook may have failed. Check webhook_processed_at.');
    console.log('  🛠️  ACTION: Manually grant access or re-trigger webhook.');
  } else if (!hasPayment && !hasAccess) {
    console.log('  ⚠️  ISSUE: No payment and no access');
    console.log('  💡 SOLUTION: User may not have completed checkout.');
  } else if (hasAccess && !hasSession) {
    console.log('  ✅ Access granted but user hasn\'t started product yet');
  } else if (hasAccess && hasSession) {
    console.log('  ✅ Everything looks good - user has access and session');
  }
}

const searchTerm = process.argv[2] || 'amira';
diagnoseUserAccess(searchTerm).catch(console.error);
