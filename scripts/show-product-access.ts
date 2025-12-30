/**
 * Show Product Access Report
 * Displays who has access to which products
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showProductAccess() {
  console.log('\n📊 PRODUCT ACCESS REPORT\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get all product access records with user details
    const { data: accessRecords, error: accessError } = await supabase
      .from('product_access')
      .select(`
        *,
        users:user_id (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (accessError) {
      console.error('❌ Error fetching product access:', accessError.message);
      process.exit(1);
    }

    if (!accessRecords || accessRecords.length === 0) {
      console.log('ℹ️  No product access records found\n');
      return;
    }

    console.log(`Found ${accessRecords.length} access records\n`);
    console.log('═══════════════════════════════════════════════════\n');

    // Group by product
    const byProduct: Record<string, any[]> = {};
    accessRecords.forEach(record => {
      if (!byProduct[record.product_slug]) {
        byProduct[record.product_slug] = [];
      }
      byProduct[record.product_slug].push(record);
    });

    // Display by product
    Object.entries(byProduct).forEach(([productSlug, records]) => {
      console.log(`📦 ${productSlug.toUpperCase()}`);
      console.log(`   (${records.length} users with access)\n`);

      records.forEach((record, i) => {
        const user = record.users;
        const email = user?.email || 'Unknown';
        const name = user?.name || 'No name';
        const amount = record.amount_paid ? `$${record.amount_paid}` : 'Free';
        const date = new Date(record.purchase_date || record.created_at).toLocaleDateString();
        const sessionId = record.stripe_session_id || 'N/A';

        console.log(`   ${i + 1}. ${name} (${email})`);
        console.log(`      Purchase: ${date} - ${amount}`);
        console.log(`      Session: ${sessionId.substring(0, 30)}${sessionId.length > 30 ? '...' : ''}`);
        console.log(`      Access: ${record.access_granted ? '✅ Granted' : '❌ Denied'}`);
        console.log();
      });

      console.log('─'.repeat(60));
      console.log();
    });

    // Summary by user
    console.log('═══════════════════════════════════════════════════\n');
    console.log('👤 SUMMARY BY USER\n');

    const byUser: Record<string, any[]> = {};
    accessRecords.forEach(record => {
      const email = record.users?.email || 'unknown';
      if (!byUser[email]) {
        byUser[email] = [];
      }
      byUser[email].push(record);
    });

    Object.entries(byUser).forEach(([email, records]) => {
      const name = records[0]?.users?.name || 'No name';
      const products = records.map(r => r.product_slug).join(', ');
      const totalPaid = records.reduce((sum, r) => sum + (parseFloat(r.amount_paid) || 0), 0);

      console.log(`   ${name} (${email})`);
      console.log(`   Products: ${products}`);
      console.log(`   Total Paid: $${totalPaid.toFixed(2)}`);
      console.log();
    });

    console.log('═══════════════════════════════════════════════════\n');

    // Recent purchases
    console.log('🕐 RECENT ACTIVITY (Last 10)\n');

    accessRecords.slice(0, 10).forEach((record, i) => {
      const user = record.users;
      const email = user?.email || 'Unknown';
      const date = new Date(record.created_at).toLocaleString();

      console.log(`   ${i + 1}. ${date}`);
      console.log(`      ${email} → ${record.product_slug}`);
      console.log(`      ${record.amount_paid ? `$${record.amount_paid}` : 'Free'}`);
      console.log();
    });

    console.log('═══════════════════════════════════════════════════\n');

    // Stats
    console.log('📈 STATISTICS\n');
    const totalUsers = Object.keys(byUser).length;
    const totalProducts = Object.keys(byProduct).length;
    const totalRevenue = accessRecords.reduce((sum, r) => sum + (parseFloat(r.amount_paid) || 0), 0);
    const freeAccess = accessRecords.filter(r => !r.amount_paid || parseFloat(r.amount_paid) === 0).length;
    const paidAccess = accessRecords.length - freeAccess;

    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Products with Access: ${totalProducts}`);
    console.log(`   Total Access Records: ${accessRecords.length}`);
    console.log(`   Paid Access: ${paidAccess}`);
    console.log(`   Free Access: ${freeAccess}`);
    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}\n`);

    console.log('═══════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showProductAccess()
  .then(() => {
    console.log('✅ Report complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
