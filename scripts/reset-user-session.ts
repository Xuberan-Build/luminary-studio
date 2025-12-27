/**
 * Reset a user's product session to start fresh
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetSession(email: string, productSlug: string) {
  console.log(`\n🔄 Resetting session for ${email} on ${productSlug}\n`);

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email}`);

  // Delete existing session
  const { error: deleteError } = await supabase
    .from('product_sessions')
    .delete()
    .eq('user_id', user.id)
    .eq('product_slug', productSlug);

  if (deleteError) {
    console.error('❌ Error deleting session:', deleteError);
  } else {
    console.log('✅ Deleted old session');
  }

  // Delete uploaded files from storage
  const { data: files } = await supabase.storage
    .from('chart-uploads')
    .list(`${user.id}/${productSlug}`);

  if (files && files.length > 0) {
    const filePaths = files.map(f => `${user.id}/${productSlug}/${f.name}`);
    await supabase.storage.from('chart-uploads').remove(filePaths);
    console.log(`✅ Deleted ${files.length} uploaded files`);
  }

  console.log('\n✨ Session reset complete!');
  console.log(`\nUser can now visit: https://quantumstrategies.online/products/${productSlug}/experience`);
  console.log('They will start fresh at the upload stage.\n');
}

const email = process.argv[2];
const productSlug = process.argv[3] || 'quantum-initiation';

if (!email) {
  console.error('Usage: npx tsx scripts/reset-user-session.ts <email> [product-slug]');
  process.exit(1);
}

resetSession(email, productSlug)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
