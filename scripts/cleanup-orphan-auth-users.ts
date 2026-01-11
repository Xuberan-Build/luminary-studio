/**
 * Create auth users for public.users rows missing in auth.users.
 * Usage:
 *   npx tsx scripts/cleanup-orphan-auth-users.ts --dry-run
 *   npx tsx scripts/cleanup-orphan-auth-users.ts --apply
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE env vars. Check .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');

async function listAllAuthUsers() {
  const users = new Map<string, { id: string; email?: string | null }>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    data.users.forEach((user) => {
      users.set(user.id, { id: user.id, email: user.email });
      if (user.email) {
        users.set(user.email.toLowerCase(), { id: user.id, email: user.email });
      }
    });

    if (!data.users || data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function findOrphans() {
  const authIndex = await listAllAuthUsers();
  const { data: publicUsers, error } = await supabase
    .from('users')
    .select('id, email, name, created_at');

  if (error) {
    throw error;
  }

  const orphans = (publicUsers || []).filter((user) => {
    if (!user.email) return false;
    const emailKey = user.email.toLowerCase();
    return !authIndex.has(user.id) && !authIndex.has(emailKey);
  });

  return orphans;
}

async function createAuthUser(user: { id: string; email: string; name?: string | null }) {
  const payload = {
    id: user.id,
    email: user.email.toLowerCase(),
    email_confirm: true,
    password: `Temp-${user.id.split('-')[0]}-${Date.now()}`,
    user_metadata: {
      name: user.name || user.email.split('@')[0],
    },
  };

  const { data, error } = await supabase.auth.admin.createUser(payload as any);
  if (error) {
    throw error;
  }

  return data.user;
}

async function run() {
  const orphans = await findOrphans();

  if (orphans.length === 0) {
    console.log('✅ No orphan public.users found.');
    return;
  }

  console.log(`Found ${orphans.length} orphan public.users rows.`);

  if (!shouldApply) {
    orphans.slice(0, 25).forEach((user) => {
      console.log(`- ${user.email} (${user.id})`);
    });
    console.log('Dry run only. Re-run with --apply to create auth users.');
    return;
  }

  for (const orphan of orphans) {
    try {
      await createAuthUser(orphan);
      console.log(`✅ Created auth user for ${orphan.email}`);
    } catch (error: any) {
      console.error(`❌ Failed to create auth user for ${orphan.email}:`, error?.message || error);
    }
  }
}

run().catch((error) => {
  console.error('Cleanup failed:', error?.message || error);
  process.exit(1);
});
