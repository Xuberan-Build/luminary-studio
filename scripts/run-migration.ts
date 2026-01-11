/**
 * Run a database migration
 * Usage: npx tsx scripts/run-migration.ts <migration-file>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(migrationFile: string) {
  console.log(`\n🔄 Running migration: ${migrationFile}\n`);

  // Read the migration file
  const migrationPath = path.resolve(__dirname, '../supabase/migrations', migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration content:');
  console.log('─'.repeat(80));
  console.log(sql);
  console.log('─'.repeat(80));
  console.log('\n⚠️  WARNING: This will modify your database!');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

  // Wait 3 seconds before running
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('🚀 Executing migration...\n');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      // If exec_sql doesn't exist, try direct execution via the REST API
      console.log('⚠️  exec_sql function not available, trying direct execution...\n');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Migration failed: ${response.status} - ${errorText}`);
      }

      console.log('✅ Migration executed successfully!\n');
    } else {
      console.log('✅ Migration executed successfully!\n');
      if (data) {
        console.log('📊 Result:', data);
      }
    }

    // Verify the trigger was created
    console.log('🔍 Verifying trigger creation...\n');
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('*')
      .like('tgname', '%auth_user%');

    if (!triggerError && triggers) {
      console.log(`✅ Found ${triggers.length} auth-related trigger(s)`);
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nYou may need to run this migration manually in the Supabase SQL Editor:');
    console.error(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql\n`);
    process.exit(1);
  }

  console.log('\n✨ Migration complete!\n');
  console.log('🔍 Next steps:');
  console.log('   1. Verify the trigger works by creating a test user');
  console.log('   2. Check that existing auth users now have records in public.users');
  console.log('   3. Test the login flow to ensure new users are auto-created\n');
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: npx tsx scripts/run-migration.ts <migration-file>');
  console.error('Example: npx tsx scripts/run-migration.ts 20251201000005_sync_auth_users_v2.sql');
  process.exit(1);
}

runMigration(migrationFile)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
