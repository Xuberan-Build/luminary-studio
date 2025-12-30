#!/usr/bin/env tsx

/**
 * Verify Database Schema
 * Checks if all required columns and features exist
 * Usage: npm run verify-schema
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

async function verifySchema() {
  console.log('\n🔍 Verifying Database Schema\n');
  console.log('='.repeat(60));

  try {
    // 1. Check if product_sessions has version columns
    console.log('\n📊 Checking product_sessions table:\n');

    const { data: sampleSession } = await supabase
      .from('product_sessions')
      .select('*')
      .limit(1)
      .single();

    if (sampleSession) {
      const hasVersion = 'version' in sampleSession;
      const hasParentSessionId = 'parent_session_id' in sampleSession;
      const hasIsLatestVersion = 'is_latest_version' in sampleSession;

      console.log(`  version: ${hasVersion ? '✅' : '❌'}`);
      console.log(`  parent_session_id: ${hasParentSessionId ? '✅' : '❌'}`);
      console.log(`  is_latest_version: ${hasIsLatestVersion ? '✅' : '❌'}`);

      if (!hasVersion || !hasParentSessionId || !hasIsLatestVersion) {
        console.log('\n  ⚠️  Session versioning migration NOT applied');
      } else {
        console.log('\n  ✅ Session versioning migration applied');
      }
    }

    // 2. Check if product_access has attempts columns
    console.log('\n📊 Checking product_access table:\n');

    const { data: sampleAccess } = await supabase
      .from('product_access')
      .select('*')
      .limit(1)
      .single();

    if (sampleAccess) {
      const hasFreeAttemptsUsed = 'free_attempts_used' in sampleAccess;
      const hasFreeAttemptsLimit = 'free_attempts_limit' in sampleAccess;

      console.log(`  free_attempts_used: ${hasFreeAttemptsUsed ? '✅' : '❌'}`);
      console.log(`  free_attempts_limit: ${hasFreeAttemptsLimit ? '✅' : '❌'}`);

      if (!hasFreeAttemptsUsed || !hasFreeAttemptsLimit) {
        console.log('\n  ⚠️  Free attempts tracking NOT applied');
      } else {
        console.log('\n  ✅ Free attempts tracking applied');
      }
    }

    // 3. Test database functions
    console.log('\n📊 Testing database functions:\n');

    // Test can_create_new_version
    try {
      const { data: testResult, error } = await supabase.rpc('can_create_new_version', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_product_slug: 'test'
      });

      if (!error) {
        console.log('  ✅ can_create_new_version() exists');
      } else {
        console.log('  ❌ can_create_new_version() - NOT FOUND');
      }
    } catch (e) {
      console.log('  ❌ can_create_new_version() - NOT FOUND');
    }

    // Test get_session_versions
    try {
      const { data: testResult, error } = await supabase.rpc('get_session_versions', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_product_slug: 'test'
      });

      if (!error && Array.isArray(testResult)) {
        console.log('  ✅ get_session_versions() exists');
      } else {
        console.log('  ❌ get_session_versions() - NOT FOUND');
      }
    } catch (e) {
      console.log('  ❌ get_session_versions() - NOT FOUND');
    }

    // Test create_session_version
    try {
      const { error } = await supabase.rpc('create_session_version', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_product_slug: 'test',
        p_parent_session_id: '00000000-0000-0000-0000-000000000000'
      });

      // We expect an error (user doesn't exist), but function should exist
      if (error && error.message.includes('does not exist')) {
        console.log('  ❌ create_session_version() - NOT FOUND');
      } else {
        console.log('  ✅ create_session_version() exists');
      }
    } catch (e) {
      console.log('  ❌ create_session_version() - NOT FOUND');
    }

    console.log('\n' + '='.repeat(60));

    // Summary
    console.log('\n📋 Summary:\n');
    console.log('Required migrations:');
    console.log('  1. ✅ Session Versioning (20251228200000) - You said this ran successfully');
    console.log('  2. ⚠️  Auto-copy Placements (20251228193644) - Need to check\n');

    console.log('Next steps:');
    console.log('  1. Apply auto-copy placements migration if missing');
    console.log('  2. Copy placements to all existing sessions');
    console.log('  3. Test that new products auto-copy placements\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

verifySchema();
