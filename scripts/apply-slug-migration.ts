#!/usr/bin/env tsx
/**
 * Rename product slug: quantum-initiation → business-alignment
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load from .env.local first, then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function renameslug() {
  console.log('\n🔄 Renaming product slug: quantum-initiation → business-alignment\n');

  // Step 1: Update product_definitions
  console.log('Updating product_definitions...');
  const { error: defError } = await supabase
    .from('product_definitions')
    .update({ product_slug: 'business-alignment' })
    .eq('product_slug', 'quantum-initiation');

  if (defError) {
    console.error('❌ Error updating product_definitions:', defError.message);
    process.exit(1);
  }

  // Step 2: Update product_access
  console.log('Updating product_access...');
  const { error: accessError } = await supabase
    .from('product_access')
    .update({ product_slug: 'business-alignment' })
    .eq('product_slug', 'quantum-initiation');

  if (accessError) {
    console.error('❌ Error updating product_access:', accessError.message);
    process.exit(1);
  }

  // Step 3: Update product_sessions
  console.log('Updating product_sessions...');
  const { error: sessionsError } = await supabase
    .from('product_sessions')
    .update({ product_slug: 'business-alignment' })
    .eq('product_slug', 'quantum-initiation');

  if (sessionsError) {
    console.error('❌ Error updating product_sessions:', sessionsError.message);
    process.exit(1);
  }

  // Verify updates
  const { data: defCheck } = await supabase
    .from('product_definitions')
    .select('product_slug')
    .eq('product_slug', 'business-alignment');

  const { data: accessCheck } = await supabase
    .from('product_access')
    .select('product_slug')
    .eq('product_slug', 'business-alignment');

  const { data: sessionsCheck } = await supabase
    .from('product_sessions')
    .select('product_slug')
    .eq('product_slug', 'business-alignment');

  console.log('\n✅ Product slug renamed successfully!\n');
  console.log('Tables Updated:');
  console.log(`  ✓ product_definitions: ${defCheck?.length || 0} records`);
  console.log(`  ✓ product_access: ${accessCheck?.length || 0} records`);
  console.log(`  ✓ product_sessions: ${sessionsCheck?.length || 0} records`);

  // Check for old slug
  const { data: oldCheck } = await supabase
    .from('product_definitions')
    .select('product_slug')
    .eq('product_slug', 'quantum-initiation');

  if (oldCheck && oldCheck.length > 0) {
    console.warn('\n⚠️  WARNING: Old slug still exists in database!');
  } else {
    console.log('\n✅ Old slug completely removed from database');
  }

  console.log('\n🎯 New URL: /products/business-alignment/experience\n');
  console.log('NOTE: You should add a redirect from /products/quantum-initiation/* to /products/business-alignment/* in your Next.js app.\n');
}

renameslug().catch(console.error);
