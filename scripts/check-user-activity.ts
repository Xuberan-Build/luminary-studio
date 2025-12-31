#!/usr/bin/env tsx
/**
 * Check user's product access attempts and session activity
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserActivity(email: string) {
  console.log('\n🔍 Checking activity for:', email);
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

  console.log('\n👤 User Information:');
  console.log(`   Name: ${user.full_name || user.name || 'N/A'}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);

  // Get product access
  const { data: access } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', user.id);

  console.log('\n\n🔐 Product Access:');
  console.log('─'.repeat(60));
  if (access && access.length > 0) {
    access.forEach((a) => {
      console.log(`\n   Product: ${a.product_slug}`);
      console.log(`   Access Granted: ${a.access_granted ? '✅' : '❌'}`);
      console.log(`   Purchase Date: ${a.purchase_date ? new Date(a.purchase_date).toLocaleString() : 'N/A'}`);
      console.log(`   Amount Paid: $${(a.amount_paid / 100).toFixed(2)}`);
      console.log(`   Stripe Session: ${a.stripe_session_id || 'N/A'}`);
    });
  } else {
    console.log('   No product access found');
  }

  // Get user sessions
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  console.log('\n\n📊 User Sessions:');
  console.log('─'.repeat(60));
  if (sessions && sessions.length > 0) {
    console.log(`   Total Sessions: ${sessions.length}\n`);

    sessions.forEach((session, index) => {
      console.log(`   Session ${index + 1}:`);
      console.log(`   ├─ ID: ${session.id}`);
      console.log(`   ├─ Product: ${session.product_slug}`);
      console.log(`   ├─ Current Step: ${session.current_step_number} of ${session.total_steps}`);
      console.log(`   ├─ Progress: ${Math.round((session.current_step_number / session.total_steps) * 100)}%`);
      console.log(`   ├─ Status: ${session.status || 'active'}`);
      console.log(`   ├─ Created: ${new Date(session.created_at).toLocaleString()}`);
      console.log(`   └─ Last Updated: ${new Date(session.updated_at).toLocaleString()}`);

      // Show if this is a version
      if (session.parent_session_id) {
        console.log(`   └─ Version: Child of ${session.parent_session_id}`);
      }

      console.log('');
    });

    // Check for deliverables
    const { data: deliverables } = await supabase
      .from('deliverables')
      .select('*')
      .in('session_id', sessions.map(s => s.id));

    if (deliverables && deliverables.length > 0) {
      console.log('\n📄 Deliverables Generated:');
      console.log('─'.repeat(60));
      deliverables.forEach((d) => {
        console.log(`\n   Session: ${d.session_id}`);
        console.log(`   Product: ${d.product_slug}`);
        console.log(`   Created: ${new Date(d.created_at).toLocaleString()}`);
        console.log(`   Content Length: ${d.content?.length || 0} characters`);
        console.log(`   Google Drive File: ${d.google_drive_file_id || 'Not uploaded'}`);
      });
    }

    // Check session responses (user's answers)
    const { data: responses } = await supabase
      .from('session_responses')
      .select('*')
      .in('session_id', sessions.map(s => s.id))
      .order('step_number', { ascending: true });

    if (responses && responses.length > 0) {
      console.log('\n\n💬 User Responses:');
      console.log('─'.repeat(60));

      const responsesBySession = responses.reduce((acc, r) => {
        if (!acc[r.session_id]) acc[r.session_id] = [];
        acc[r.session_id].push(r);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(responsesBySession).forEach(([sessionId, sessionResponses]) => {
        const session = sessions.find(s => s.id === sessionId);
        console.log(`\n   Session: ${session?.product_slug} (${sessionResponses.length} responses)`);

        sessionResponses.forEach((r) => {
          console.log(`   ├─ Step ${r.step_number}: ${r.response_text?.substring(0, 60)}${r.response_text?.length > 60 ? '...' : ''}`);
        });
      });
    }
  } else {
    console.log('   ❌ No sessions found - user has not started any products yet');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Activity check complete\n');
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/check-user-activity.ts <email>');
  process.exit(1);
}

checkUserActivity(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
