/**
 * Create an auth user that matches an existing public.users row.
 * Usage: npx tsx scripts/create-auth-user-from-public.ts <email> <temp-password>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAuthUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const { data: existing, error: publicError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', normalizedEmail)
    .single();

  if (publicError || !existing) {
    console.error('❌ No public.users record found for this email.');
    process.exit(1);
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 2000,
  });

  const matchingAuth = authUsers?.users.find((user) => user.email === normalizedEmail);
  if (matchingAuth) {
    console.log('✅ Auth user already exists:', matchingAuth.id);
    process.exit(0);
  }

  const createPayload = {
    id: existing.id,
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: existing.name || normalizedEmail.split('@')[0],
    },
  };

  const { data, error } = await supabase.auth.admin.createUser(createPayload as any);
  if (!error && data?.user) {
    console.log('✅ Auth user created with matching ID:', data.user.id);
    process.exit(0);
  }

  console.error('⚠️ Failed to create auth user with matching ID:', error?.message);
  console.error('No changes were made. This likely means the admin API rejected the id field.');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: npx tsx scripts/create-auth-user-from-public.ts <email> <temp-password>');
  process.exit(1);
}

createAuthUser(email, password).catch((err) => {
  console.error('❌ Error:', err?.message || err);
  process.exit(1);
});
