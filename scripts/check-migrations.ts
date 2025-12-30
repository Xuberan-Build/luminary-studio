#!/usr/bin/env tsx

/**
 * Check Applied Migrations
 * Shows which migrations have been applied to the database
 * Usage: npm run check-migrations
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type FuncExistsRow = {
  exists: boolean;
};

async function checkMigrations() {
  console.log('\n🔍 Checking Applied Migrations\n');
  console.log('='.repeat(60));

  try {
    // Check if supabase_migrations table exists
    const { data: migrations, error } = await supabase
      .from('supabase_migrations')
      .select('*')
      .order('version', { ascending: true });

    if (error) {
      console.error('\n❌ Error querying migrations table:', error.message);
      console.log('\nℹ️  This might mean:');
      console.log('  1. Supabase CLI migrations not initialized');
      console.log('  2. Using manual SQL migrations only');
      console.log('  3. Database connection issue\n');
      return;
    }

    console.log(`\n✅ Found ${migrations?.length || 0} applied migrations:\n`);

    if (migrations && migrations.length > 0) {
      migrations.forEach((m: any) => {
        console.log(`  ${m.version} - ${m.name || 'Unnamed'}`);
      });
    } else {
      console.log('  (No Supabase CLI migrations applied yet)');
    }

    // Check for our custom columns to verify manual migrations
    console.log('\n\n🔍 Checking for Custom Schema Changes:\n');

    // Check product_sessions for versioning columns
    const { data: sessionColumns, error: sessionError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'product_sessions'
          AND column_name IN ('version', 'parent_session_id', 'is_latest_version')
          ORDER BY column_name;
        `
      })
      .select();

    if (!sessionError && sessionColumns) {
      console.log('✅ Session Versioning Columns:');
      if (sessionColumns.length > 0) {
        sessionColumns.forEach((col: any) => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('  ❌ NOT FOUND - Session versioning migration not applied');
      }
    }

    // Check product_access for attempts columns
    const { data: accessColumns, error: accessError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'product_access'
          AND column_name IN ('free_attempts_used', 'free_attempts_limit')
          ORDER BY column_name;
        `
      })
      .select();

    if (!accessError && accessColumns) {
      console.log('\n✅ Free Attempts Columns:');
      if (accessColumns.length > 0) {
        accessColumns.forEach((col: any) => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('  ❌ NOT FOUND - Attempts tracking not applied');
      }
    }

    // Check for database functions
    console.log('\n\n🔍 Checking for Custom Functions:\n');

    const functions = [
      'create_session_version',
      'get_session_versions',
      'can_create_new_version',
      'auto_copy_placements_to_new_session'
    ];

    for (const funcName of functions) {
      const { data: funcExists } = await supabase
        .rpc('exec_sql', {
          query: `
            SELECT EXISTS (
              SELECT 1 FROM pg_proc
              WHERE proname = '${funcName}'
            ) as exists;
          `
        })
        .select()
        .single<FuncExistsRow>();

      if (funcExists?.exists) {
        console.log(`  ✅ ${funcName}()`);
      } else {
        console.log(`  ❌ ${funcName}() - NOT FOUND`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

checkMigrations();
