#!/usr/bin/env tsx
/**
 * Apply audit logging migrations to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSql(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

async function applyMigration(migrationPath: string, migrationName: string) {
  console.log(`\n📄 Applying migration: ${migrationName}`);
  console.log('─'.repeat(80));

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split SQL into individual statements (rough split on semicolons)
  // This is needed because Supabase doesn't support multi-statement queries via RPC
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments and empty statements
    if (statement.trim().startsWith('--') || statement.trim() === ';') {
      continue;
    }

    process.stdout.write(`Executing statement ${i + 1}/${statements.length}... `);

    try {
      // Execute SQL directly using Supabase's SQL editor endpoint
      // This is a workaround since there's no direct exec_sql RPC by default
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: statement }),
      });

      if (response.ok) {
        console.log('✅');
        successCount++;
      } else {
        const errorText = await response.text();
        console.log('❌');
        console.log(`   Error: ${errorText}`);
        errorCount++;
      }
    } catch (err: any) {
      console.log('❌');
      console.log(`   Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  return errorCount === 0;
}

async function main() {
  console.log('\n🚀 Applying Audit Logging Migrations to Supabase\n');
  console.log('═'.repeat(80));
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log('═'.repeat(80));

  const migrations = [
    {
      path: path.resolve(__dirname, '../database/migrations/009_audit_logging_system.sql'),
      name: '009_audit_logging_system',
    },
    {
      path: path.resolve(__dirname, '../database/migrations/010_audit_logging_enhancements.sql'),
      name: '010_audit_logging_enhancements',
    },
  ];

  console.log('\n⚠️  Note: Supabase does not support executing raw SQL via the client library.');
  console.log('You need to apply migrations manually using one of these methods:\n');
  console.log('1. Supabase Dashboard → SQL Editor → Copy/paste migration SQL');
  console.log('2. Use psql with DATABASE_URL connection string');
  console.log('3. Use Supabase CLI: supabase db push\n');

  console.log('📋 Migration files to apply:\n');
  migrations.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   Path: ${m.path}`);
    console.log(`   Exists: ${fs.existsSync(m.path) ? '✅' : '❌'}\n`);
  });

  console.log('═'.repeat(80));
  console.log('\n🔗 Quick Links:\n');
  console.log(`Supabase Dashboard: ${supabaseUrl.replace('https://', 'https://app.')}/project/_/sql`);
  console.log('\n💡 Recommended: Copy the SQL from each migration file and paste into');
  console.log('   the Supabase SQL Editor in your dashboard.\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
