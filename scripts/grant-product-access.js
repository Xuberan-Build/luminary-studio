// Script to grant product access to a user
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAccess() {
  const email = 'santos.93.aus@gmail.com';
  const productSlug = 'quantum-initiation';

  console.log('Finding user...');

  // Get user ID from auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers.users.find(u => u.email === email);

  if (!authUser) {
    console.error('User not found in auth.users');
    return;
  }

  console.log('User found:', authUser.id);

  // Ensure user exists in users table
  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!dbUser) {
    console.log('Creating user record in database...');
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || 'there'
      });

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }
    console.log('User record created!');
  }

  // Check if product access already exists
  const { data: existingAccess } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('product_slug', productSlug)
    .single();

  if (existingAccess) {
    console.log('Product access already exists!');
    return;
  }

  // Grant product access
  console.log('Granting product access...');
  const { data, error } = await supabase
    .from('product_access')
    .insert({
      user_id: authUser.id,
      product_slug: productSlug,
      access_granted: true,
      purchase_date: new Date().toISOString(),
      amount_paid: 0, // Test access
      stripe_session_id: 'test_manual_grant'
    })
    .select();

  if (error) {
    console.error('Error granting access:', error);
    return;
  }

  console.log('✅ Product access granted!');
  console.log('User can now access:', `/products/${productSlug}/experience`);
}

grantAccess();
