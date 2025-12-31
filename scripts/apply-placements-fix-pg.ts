#!/usr/bin/env tsx

import { Client } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function applyFix() {
  console.log('🔧 Applying placements confirmation fix...\n');

  // Use the connection pooler with session mode for DDL operations
  const connectionString = `postgresql://postgres.znpspiwsgztophzpoxub:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1`;

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

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

    await client.query(sql);
    console.log('✅ Function updated successfully!');
    console.log('✅ Users will now see confirmation gate for auto-copied placements\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyFix();
