#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFix() {
  console.log('🔧 Applying placements confirmation fix...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE OR REPLACE FUNCTION auto_copy_placements_to_new_session()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        previous_placements jsonb;
      BEGIN
        IF NEW.placements IS NOT NULL OR NEW.placements_confirmed = true THEN
          RETURN NEW;
        END IF;

        SELECT placements INTO previous_placements
        FROM product_sessions
        WHERE user_id = NEW.user_id
          AND placements_confirmed = true
          AND placements IS NOT NULL
          AND id != NEW.id
        ORDER BY created_at DESC
        LIMIT 1;

        IF previous_placements IS NOT NULL THEN
          NEW.placements := previous_placements;
          NEW.placements_confirmed := false;
        END IF;

        RETURN NEW;
      END;
      $$;
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
  console.log('✅ Users will now see confirmation gate for auto-copied placements\n');
}

applyFix();
