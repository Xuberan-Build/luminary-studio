import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envFiles = ['.env.production.local', '.env.local', '.env'];
for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    console.log(`📝 Loaded environment from ${file}\n`);
    break;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const scanSlugs = [
  'perception-rite-scan-1',
  'perception-rite-scan-2',
  'perception-rite-scan-3',
  'perception-rite-scan-4',
  'perception-rite-scan-5',
];

async function verifyByEmail(email: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', email)
    .single();

  if (userError || !user) {
    console.error('❌ User not found in users table.');
    return false;
  }

  console.log(`✓ User found: ${user.email} (${user.id})\n`);

  const { data: accessRecords } = await supabase
    .from('product_access')
    .select('product_slug, access_granted, stripe_session_id, purchase_source, bundle_slug, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return reportAccess(accessRecords || []);
}

async function verifyBySession(sessionId: string) {
  const { data: accessRecords } = await supabase
    .from('product_access')
    .select('product_slug, access_granted, stripe_session_id, purchase_source, bundle_slug, created_at')
    .eq('stripe_session_id', sessionId)
    .order('created_at', { ascending: false });

  if (!accessRecords || accessRecords.length === 0) {
    console.error('❌ No product_access records found for that session id.');
    return false;
  }

  return reportAccess(accessRecords);
}

function reportAccess(accessRecords: any[]) {
  console.log('📦 Perception Rite Access:\n');

  const accessMap = new Map(accessRecords.map((a) => [a.product_slug, a]));
  const hasBundle = accessRecords.some((a) => a.bundle_slug === 'perception-rite-bundle');

  scanSlugs.forEach((slug) => {
    const record = accessMap.get(slug);
    const status = record?.access_granted ? '✅ YES' : '❌ NO';
    console.log(`  ${slug}: ${status}`);
  });

  console.log(`\n  Bundle Access: ${hasBundle ? '✅ YES' : '❌ NO'}`);

  if (accessRecords.length > 0) {
    console.log('\n🔎 Access Records:');
    accessRecords.forEach((record) => {
      console.log(`  - ${record.product_slug} | granted: ${record.access_granted ? 'yes' : 'no'} | session: ${record.stripe_session_id || 'n/a'}`);
    });
  }

  const allScansGranted = scanSlugs.every((slug) => accessMap.get(slug)?.access_granted);
  if (!allScansGranted) {
    console.warn('\n⚠️  Missing access for one or more scans.');
  } else {
    console.log('\n✅ All scans have access.');
  }

  return allScansGranted || hasBundle;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: ts-node scripts/verify-perception-access.ts <email|stripe_session_id>');
    process.exit(1);
  }

  const ok = input.includes('@')
    ? await verifyByEmail(input)
    : await verifyBySession(input);

  process.exit(ok ? 0 : 2);
}

main().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(2);
});
