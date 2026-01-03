import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envFiles = ['.env.production.local', '.env.local', '.env'];
for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    break;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function grantAccess(email: string, productSlug: string) {
  console.log(`\n🔧 GRANTING ACCESS`);
  console.log(`Email: ${email}`);
  console.log(`Product: ${productSlug}\n`);

  const { data: authData } = await supabase.auth.admin.listUsers();
  const user = authData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.log('❌ User not found');
    console.log('\nAvailable users:');
    authData.users.forEach((u) => console.log(`  - ${u.email}`));
    return;
  }

  console.log(`✓ User: ${user.id}\n`);

  const { data: existing } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_slug', productSlug)
    .single();

  if (existing?.access_granted) {
    console.log('✅ User already has access');
    return;
  }

  if (existing) {
    await supabase
      .from('product_access')
      .update({ access_granted: true, purchase_id: 'MANUAL', free_attempts_remaining: 2 })
      .eq('id', existing.id);
  } else {
    await supabase.from('product_access').insert({
      user_id: user.id,
      product_slug: productSlug,
      access_granted: true,
      purchase_id: 'MANUAL',
      free_attempts_remaining: 2,
    });
  }

  console.log('✅ ACCESS GRANTED\n');
  console.log(`User can now access: https://quantumstrategies.online/products/${productSlug}/experience\n`);
}

const email = process.argv[2];
const product = process.argv[3];

if (!email || !product) {
  console.log('\nUsage: npm run grant-access <email> <product>\n');
  console.log('Products: personal-alignment, business-alignment, brand-alignment\n');
  console.log('Example: npm run grant-access amiraespann@gmail.com personal-alignment\n');
  process.exit(1);
}

grantAccess(email, product).catch(console.error);
