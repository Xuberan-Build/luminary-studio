/**
 * Manually grant product access to a user
 * Usage: npx tsx scripts/grant-manual-access.ts <user-email> <product-slug>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAccess(userEmail: string, productSlug: string) {
  console.log(`\n🔍 Looking up user: ${userEmail}`);

  // Get user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .single();

  if (userError || !user) {
    console.error('❌ User not found:', userError?.message);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`);

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
    .eq('user_id', user.id)
    .eq('product_slug', productSlug)
    .single();

  if (existingAccess) {
    console.log('⚠️  User already has access to this product');

    // Update to ensure access_granted is true
    const { error: updateError } = await supabase
      .from('product_access')
      .update({
        access_granted: true,
        granted_at: new Date().toISOString(),
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
        user_id: user.id,
        product_slug: productSlug,
        access_granted: true,
        granted_at: new Date().toISOString(),
        payment_status: 'succeeded',
      })
      .select()
      .single();

    if (accessError) {
      console.error('❌ Failed to grant access:', accessError.message);
      process.exit(1);
    }

    console.log('✅ Product access granted!');
    console.log('\n📋 Access Details:');
    console.log(`   - User: ${user.email}`);
    console.log(`   - Product: ${product.name}`);
    console.log(`   - Access ID: ${newAccess.id}`);
  }

  console.log('\n✨ Done! User can now access the product.');
  console.log(`   Dashboard: https://quantumstrategies.online/dashboard`);
  console.log(`   Product: https://quantumstrategies.online/products/${productSlug}/experience`);
}

// Get command line arguments
const userEmail = process.argv[2];
const productSlug = process.argv[3] || 'quantum-initiation';

if (!userEmail) {
  console.error('Usage: npx tsx scripts/grant-manual-access.ts <user-email> [product-slug]');
  console.error('Example: npx tsx scripts/grant-manual-access.ts user@example.com quantum-initiation');
  process.exit(1);
}

grantAccess(userEmail, productSlug)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
