#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

async function applyFix() {
  console.log('🔧 Applying placements confirmation fix...\n');

  const sql = `
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
  `;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    console.log('✅ Function updated successfully!');
    console.log('✅ Users will now see confirmation gate for auto-copied placements\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/znpspiwsgztophzpoxub/sql\n');
    console.log(sql);
  }
}

applyFix();
