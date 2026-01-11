#!/usr/bin/env tsx
/**
 * Apply audit logging migrations to Supabase
 * Uses Supabase Management API to execute SQL
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

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function executeRawSQL(sql: string): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Split SQL into statements but keep multi-line statements together
  // We need to handle CREATE FUNCTION which can span many lines
  const statements: string[] = [];
  let currentStatement = '';
  let inFunction = false;
  let dollarQuoteCount = 0;

  const lines = sql.split('\n');

  for (const line of lines) {
    // Skip comment-only lines
    if (line.trim().startsWith('--')) {
      continue;
    }

    currentStatement += line + '\n';

    // Track if we're inside a function (between $$ or $function$)
    if (line.includes('$$') || line.includes('$function$')) {
      dollarQuoteCount++;
      if (dollarQuoteCount % 2 === 1) {
        inFunction = true;
      } else {
        inFunction = false;
      }
    }

    // Statement ends with semicolon, but only if not inside a function
    if (line.trim().endsWith(';') && !inFunction) {
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
    }
  }

  // Add final statement if any
  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim());
  }

  console.log(`\n📊 Parsed ${statements.length} SQL statements\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Show what we're executing
    const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);

    try {
      // Use Supabase's from() to execute raw SQL
      // This is a workaround - we create a custom RPC function first
      const { error } = await supabase.rpc('exec', { query: statement });

      if (error) {
        // Try direct execution via the SQL endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        console.log('✅');
      } else {
        console.log('✅');
      }
    } catch (err: any) {
      console.log('❌');
      console.error(`   Error: ${err.message}`);
      // Continue with next statement
    }
  }
}

async function main() {
  console.log('\n🚀 Applying Audit Logging Migrations to Supabase\n');
  console.log('═'.repeat(80));
  console.log(`📍 Project: ${projectRef}`);
  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log('═'.repeat(80));

  const migration1 = path.resolve(__dirname, '../supabase/migrations/20251230000001_audit_logging_system.sql');
  const migration2 = path.resolve(__dirname, '../supabase/migrations/20251230000002_audit_logging_enhancements.sql');

  console.log('\n⚠️  IMPORTANT: Supabase client does not support executing raw SQL directly.');
  console.log('Please use one of these methods instead:\n');

  console.log('📌 Method 1: Supabase SQL Editor (Recommended)');
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   2. Copy contents of: supabase/migrations/20251230000001_audit_logging_system.sql');
  console.log('   3. Paste and click "Run"');
  console.log('   4. Repeat with: supabase/migrations/20251230000002_audit_logging_enhancements.sql\n');

  console.log('📌 Method 2: psql Command Line');
  console.log('   1. Get your DATABASE_URL from Supabase Dashboard → Settings → Database');
  console.log('   2. Run:');
  console.log('      psql "postgresql://postgres:[YOUR-PASSWORD]@..." -f supabase/migrations/20251230000001_audit_logging_system.sql');
  console.log('      psql "postgresql://postgres:[YOUR-PASSWORD]@..." -f supabase/migrations/20251230000002_audit_logging_enhancements.sql\n');

  console.log('📌 Method 3: Supabase CLI');
  console.log('   1. Link project: supabase link --project-ref ' + projectRef);
  console.log('   2. Push migration: supabase db push\n');

  console.log('═'.repeat(80));
  console.log('\n📄 Migration Files:\n');
  console.log('1. ' + migration1);
  console.log('   Status: ' + (fs.existsSync(migration1) ? '✅ Ready' : '❌ Not found'));
  console.log('\n2. ' + migration2);
  console.log('   Status: ' + (fs.existsSync(migration2) ? '✅ Ready' : '❌ Not found'));

  console.log('\n💡 I recommend opening the Supabase SQL Editor and pasting the migrations.');
  console.log('   This is the quickest and safest method.\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
