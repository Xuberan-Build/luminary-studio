/**
 * Check if a user exists in the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser(email: string) {
  console.log(`\n🔍 Searching for user: ${email}\n`);

  // Check in users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  console.log('Users table results:', users?.length || 0, 'records');
  if (users && users.length > 0) {
    users.forEach((user, index) => {
      console.log(`\n  User ${index + 1}:`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Name: ${user.name || 'N/A'}`);
      console.log(`    Created: ${user.created_at}`);
    });
  }

  // Check in auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  const matchingAuthUsers = authUsers?.users.filter(u => u.email === email);

  console.log('\n\nAuth users results:', matchingAuthUsers?.length || 0, 'records');
  if (matchingAuthUsers && matchingAuthUsers.length > 0) {
    matchingAuthUsers.forEach((user, index) => {
      console.log(`\n  Auth User ${index + 1}:`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`    Created: ${user.created_at}`);
    });
  }

  // Check product access
  if (users && users.length > 0) {
    const { data: access } = await supabase
      .from('product_access')
      .select('*')
      .eq('user_id', users[0].id);

    console.log('\n\nProduct Access:', access?.length || 0, 'records');
    if (access && access.length > 0) {
      access.forEach((a, index) => {
        console.log(`\n  Access ${index + 1}:`);
        console.log(`    Product: ${a.product_slug}`);
        console.log(`    Granted: ${a.access_granted}`);
        console.log(`    Payment Status: ${a.payment_status}`);
      });
    }
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/check-user.ts <email>');
  process.exit(1);
}

checkUser(email).then(() => process.exit(0));
