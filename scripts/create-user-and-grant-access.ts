/**
 * Create user record and grant product access
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserAndGrantAccess(email: string, productSlug: string) {
  console.log(`\n🔍 Looking up auth user: ${email}`);

  // Get auth user
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users.find(u => u.email === email);

  if (!authUser) {
    console.error('❌ Auth user not found');
    process.exit(1);
  }

  console.log(`✅ Found auth user: ${authUser.email} (ID: ${authUser.id})`);

  // Check if user exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  let userId = authUser.id;

  if (!existingUser) {
    console.log('\n📝 Creating user record in users table...');

    // Create user record
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
        created_at: authUser.created_at,
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Failed to create user:', userError.message);
      process.exit(1);
    }

    console.log(`✅ User record created: ${newUser.email}`);
  } else {
    console.log(`✅ User record already exists`);
  }

  // Check if product exists
  const { data: product, error: productError } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', productSlug)
    .single();

  if (productError || !product) {
    console.error('❌ Product not found:', productError?.message);
    process.exit(1);
  }

  console.log(`✅ Found product: ${product.name}`);

  // Check if access already exists
  const { data: existingAccess } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', userId)
    .eq('product_slug', productSlug)
    .single();

  if (existingAccess) {
    console.log('⚠️  User already has access to this product');

    // Update to ensure access_granted is true
    const { error: updateError } = await supabase
      .from('product_access')
      .update({
        access_granted: true,
      })
      .eq('id', existingAccess.id);

    if (updateError) {
      console.error('❌ Failed to update access:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Updated existing access record');
  } else {
    // Create new access record
    console.log('\n📝 Creating product access...');

    const { data: newAccess, error: accessError } = await supabase
      .from('product_access')
      .insert({
        user_id: userId,
        product_slug: productSlug,
        access_granted: true,
        purchase_date: new Date().toISOString(),
        amount_paid: 7.00,
      })
      .select()
      .single();

    if (accessError) {
      console.error('❌ Failed to grant access:', accessError.message);
      console.error('Error details:', accessError);
      process.exit(1);
    }

    console.log('✅ Product access granted!');
  }

  console.log('\n✨ Done! User setup complete.');
  console.log(`\n📋 Summary:`);
  console.log(`   - User: ${email}`);
  console.log(`   - User ID: ${userId}`);
  console.log(`   - Product: ${product.name}`);
  console.log(`\n🔗 Links:`);
  console.log(`   Dashboard: https://quantumstrategies.online/dashboard`);
  console.log(`   Product: https://quantumstrategies.online/products/${productSlug}/experience`);
}

const email = process.argv[2];
const productSlug = process.argv[3] || 'quantum-initiation';

if (!email) {
  console.error('Usage: npx tsx scripts/create-user-and-grant-access.ts <email> [product-slug]');
  process.exit(1);
}

createUserAndGrantAccess(email, productSlug)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
