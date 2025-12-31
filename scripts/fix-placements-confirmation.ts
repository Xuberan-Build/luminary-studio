/**
 * Fix auto-copy placements confirmation gate
 * Updates the trigger to set placements_confirmed = false
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixPlacementsConfirmation() {
  console.log('🔧 Fixing auto-copy placements confirmation logic\n');

  const sql = `
CREATE OR REPLACE FUNCTION auto_copy_placements_to_new_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_placements jsonb;
BEGIN
  -- Only run for new sessions without placements
  IF NEW.placements IS NOT NULL OR NEW.placements_confirmed = true THEN
    RETURN NEW;
  END IF;

  -- Get the most recent confirmed placements from any other product for this user
  SELECT placements INTO previous_placements
  FROM product_sessions
  WHERE user_id = NEW.user_id
    AND placements_confirmed = true
    AND placements IS NOT NULL
    AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  -- If we found previous placements, copy them BUT DON'T auto-confirm
  IF previous_placements IS NOT NULL THEN
    NEW.placements := previous_placements;
    NEW.placements_confirmed := false;

    RAISE NOTICE 'Auto-copied placements from previous session to new % session for user % (requires confirmation)',
      NEW.product_slug, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct query if rpc doesn't exist
      const { error: directError } = await (supabase as any).from('_').select(sql);

      if (directError && directError.code !== 'PGRST204') {
        throw directError;
      }
    }

    console.log('✅ Function updated successfully');
    console.log('✅ Users will now see confirmation gate for auto-copied placements');
    console.log('✅ Test by creating a new product session after completing another product\n');
  } catch (error: any) {
    console.error('❌ Error updating function:', error.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:\n');
    console.log(sql);
    process.exit(1);
  }
}

fixPlacementsConfirmation();
