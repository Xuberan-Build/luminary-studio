// Quick script to check if user exists in database
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const email = 'santos.93.aus@gmail.com';

  console.log('Checking user:', email);

  // Check auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    const authUser = authUsers.users.find(u => u.email === email);
    console.log('\nAuth user:', authUser ? 'EXISTS' : 'NOT FOUND');
    if (authUser) {
      console.log('  - ID:', authUser.id);
      console.log('  - Email confirmed:', authUser.email_confirmed_at ? 'YES' : 'NO');
      console.log('  - Created at:', authUser.created_at);
    }
  }

  // Check our users table
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (dbError) {
    console.log('\nDatabase user: NOT FOUND');
    console.log('  Error:', dbError.message);
  } else {
    console.log('\nDatabase user: EXISTS');
    console.log('  - ID:', dbUser.id);
    console.log('  - Name:', dbUser.name);
  }
}

checkUser();
