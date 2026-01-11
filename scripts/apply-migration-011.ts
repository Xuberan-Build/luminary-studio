/**
 * Apply migration 011 - Fix auto-copy placements confirmation
 */

import { supabaseAdmin } from '../src/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  console.log('🔧 Applying migration 011: Fix auto-copy placements confirmation\n');

  const migrationPath = path.join(__dirname, '../supabase/migrations/20251230000003_fix_auto_copy_placements_confirmation.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    const { error } = await supabaseAdmin.rpc('exec', { sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully');
    console.log('✅ Users will now see confirmation gate for auto-copied placements\n');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
