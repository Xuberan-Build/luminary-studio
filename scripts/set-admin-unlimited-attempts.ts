#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setUnlimitedAttempts() {
  console.log('🔧 Setting unlimited attempts for admin user\n');

  // Get admin user ID
  const { data: authUser } = await supabase.auth.admin.listUsers();
  const adminUser = authUser.users.find(u => u.email === 'santos.93.aus@gmail.com');

  if (!adminUser) {
    console.log('❌ Admin user not found');
    return;
  }

  console.log(`✅ Found admin: ${adminUser.email}\n`);

  // Update product_access to set unlimited attempts
  const { data, error } = await supabase
    .from('product_access')
    .update({
      free_attempts_used: 0,
      free_attempts_limit: 999999
    })
    .eq('user_id', adminUser.id)
    .select('product_slug, free_attempts_used, free_attempts_limit');

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Updated ${data?.length || 0} product access records:\n`);

  if (data) {
    data.forEach(record => {
      console.log(`   ${record.product_slug}:`);
      console.log(`      • attempts_used: ${record.free_attempts_used}`);
      console.log(`      • attempts_limit: ${record.free_attempts_limit}\n`);
    });
  }

  console.log('✅ Admin now has unlimited attempts on all products!');
}

setUnlimitedAttempts().catch(console.error);
