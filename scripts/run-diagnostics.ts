#!/usr/bin/env tsx

/**
 * Database Diagnostics Runner
 * Runs health checks against Supabase database
 * Usage: npm run diagnostics
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostics() {
  console.log('🔍 Running Database Health Check...\n');
  console.log('='.repeat(60));

  try {
    // 1. SUMMARY STATISTICS
    console.log('\n📊 SUMMARY STATISTICS\n');

    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase.from('product_definitions').select('*', { count: 'exact', head: true });
    const { count: totalSessions } = await supabase.from('product_sessions').select('*', { count: 'exact', head: true });
    const { data: completedSessions } = await supabase.from('product_sessions').select('id').eq('is_complete', true);
    const { count: totalConversations } = await supabase.from('conversations').select('*', { count: 'exact', head: true });
    const { count: totalFiles } = await supabase.from('uploaded_documents').select('*', { count: 'exact', head: true });
    const { data: accessGrants } = await supabase.from('product_access').select('id').eq('access_granted', true);

    console.log(`Total Users: ${totalUsers || 0}`);
    console.log(`Total Products: ${totalProducts || 0}`);
    console.log(`Total Sessions: ${totalSessions || 0}`);
    console.log(`Completed Sessions: ${completedSessions?.length || 0}`);
    console.log(`Total Conversations: ${totalConversations || 0}`);
    console.log(`Total Uploaded Files: ${totalFiles || 0}`);
    console.log(`Access Grants: ${accessGrants?.length || 0}`);

    // 2. DUPLICATE SESSIONS
    console.log('\n\n🔄 DUPLICATE SESSIONS (multiple sessions per user/product)\n');

    const { data: allSessions } = await supabase
      .from('product_sessions')
      .select('user_id, product_slug, id, created_at');

    if (allSessions) {
      const grouped = new Map<string, any[]>();
      allSessions.forEach(session => {
        const key = `${session.user_id}_${session.product_slug}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(session);
      });

      let duplicateCount = 0;
      for (const [key, sessions] of grouped.entries()) {
        if (sessions.length > 1) {
          duplicateCount++;
          const [userId, productSlug] = key.split('_');
          const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
          console.log(`  ${user?.email || 'Unknown'} - ${productSlug}: ${sessions.length} sessions`);
          sessions.forEach((s, i) => console.log(`    ${i + 1}. ${s.id} (${new Date(s.created_at).toLocaleDateString()})`));
        }
      }
      if (duplicateCount === 0) {
        console.log('  ✅ No duplicate sessions found');
      }
    }

    // 3. INCOMPLETE SESSIONS (>7 days old)
    console.log('\n\n⏳ INCOMPLETE SESSIONS (>7 days old)\n');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: incompleteSessions } = await supabase
      .from('product_sessions')
      .select('id, product_slug, current_step, total_steps, placements_confirmed, created_at, user_id')
      .eq('is_complete', false)
      .lt('created_at', sevenDaysAgo.toISOString());

    if (incompleteSessions && incompleteSessions.length > 0) {
      console.log(`  Found ${incompleteSessions.length} old incomplete sessions:\n`);
      for (const session of incompleteSessions.slice(0, 10)) {
        const { data: user } = await supabase.from('users').select('email').eq('id', session.user_id).single();
        const age = Math.floor((Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  - ${user?.email || 'Unknown'} - ${session.product_slug}`);
        console.log(`    Step ${session.current_step}/${session.total_steps}, ${age} days old, Placements: ${session.placements_confirmed ? 'Yes' : 'No'}`);
      }
      if (incompleteSessions.length > 10) {
        console.log(`  ... and ${incompleteSessions.length - 10} more`);
      }
    } else {
      console.log('  ✅ No old incomplete sessions found');
    }

    // 4. SESSIONS MISSING PLACEMENTS
    console.log('\n\n📋 SESSIONS MISSING PLACEMENTS (current_step > 1 but no placements)\n');

    const { data: sessionsWithoutPlacements } = await supabase
      .from('product_sessions')
      .select('id, product_slug, current_step, placements_confirmed, created_at, user_id')
      .gt('current_step', 1)
      .or('placements_confirmed.eq.false,placements.is.null');

    if (sessionsWithoutPlacements && sessionsWithoutPlacements.length > 0) {
      console.log(`  ⚠️  Found ${sessionsWithoutPlacements.length} sessions:\n`);
      for (const session of sessionsWithoutPlacements.slice(0, 5)) {
        const { data: user } = await supabase.from('users').select('email').eq('id', session.user_id).single();
        console.log(`  - ${user?.email || 'Unknown'} - ${session.product_slug} (Step ${session.current_step})`);
      }
    } else {
      console.log('  ✅ All sessions have placements');
    }

    // 5. STORAGE USAGE BY USER
    console.log('\n\n💾 STORAGE USAGE BY USER\n');

    const { data: uploads } = await supabase
      .from('uploaded_documents')
      .select('user_id, file_size');

    if (uploads && uploads.length > 0) {
      const userStorage = new Map<string, number>();
      uploads.forEach(upload => {
        const current = userStorage.get(upload.user_id) || 0;
        userStorage.set(upload.user_id, current + (upload.file_size || 0));
      });

      for (const [userId, totalSize] of Array.from(userStorage.entries()).slice(0, 10)) {
        const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
        const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
        const { count } = await supabase.from('uploaded_documents').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        console.log(`  ${user?.email || 'Unknown'}: ${count} files, ${sizeMB} MB`);
      }
    } else {
      console.log('  No uploaded files found');
    }

    // 6. ORPHANED CONVERSATIONS
    console.log('\n\n🗨️  ORPHANED CONVERSATIONS (no matching session)\n');

    const { data: allConvos } = await supabase.from('conversations').select('id, session_id, step_number');
    const { data: allSessionIds } = await supabase.from('product_sessions').select('id');

    if (allConvos && allSessionIds) {
      const sessionIdSet = new Set(allSessionIds.map(s => s.id));
      const orphaned = allConvos.filter(c => !sessionIdSet.has(c.session_id));

      if (orphaned.length > 0) {
        console.log(`  ⚠️  Found ${orphaned.length} orphaned conversations`);
        orphaned.slice(0, 5).forEach(c => {
          console.log(`    - Session ${c.session_id}, Step ${c.step_number}`);
        });
      } else {
        console.log('  ✅ No orphaned conversations');
      }
    }

    // 7. ORPHANED UPLOADED DOCUMENTS
    console.log('\n\n📎 ORPHANED UPLOADED DOCUMENTS (no matching session)\n');

    const { data: allUploads } = await supabase.from('uploaded_documents').select('id, session_id, file_name');

    if (allUploads && allSessionIds) {
      const sessionIdSet = new Set(allSessionIds.map(s => s.id));
      const orphaned = allUploads.filter(u => !sessionIdSet.has(u.session_id));

      if (orphaned.length > 0) {
        console.log(`  ⚠️  Found ${orphaned.length} orphaned file records`);
        orphaned.slice(0, 5).forEach(u => {
          console.log(`    - ${u.file_name} (session: ${u.session_id})`);
        });
      } else {
        console.log('  ✅ No orphaned file records');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Diagnostics Complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error running diagnostics:', error.message);
    if (error.details) console.error('Details:', error.details);
    process.exit(1);
  }
}

runDiagnostics();
