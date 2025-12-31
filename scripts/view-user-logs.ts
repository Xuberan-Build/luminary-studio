#!/usr/bin/env tsx
/**
 * View comprehensive audit logs for a user
 * Shows all activity, errors, and troubleshooting information
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LogFilters {
  eventType?: string;
  eventStatus?: string;
  limit?: number;
  hoursAgo?: number;
}

async function viewUserLogs(email: string, filters: LogFilters = {}) {
  console.log('\n📜 User Audit Logs\n');
  console.log('═'.repeat(80));

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    console.log('\n❌ User not found');
    return;
  }

  console.log(`\n👤 User: ${user.full_name || user.name || 'N/A'}`);
  console.log(`📧 Email: ${user.email}`);
  console.log(`🆔 ID: ${user.id}`);
  console.log(`📅 Created: ${new Date(user.created_at).toLocaleString()}\n`);

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType);
  }

  if (filters.eventStatus) {
    query = query.eq('event_status', filters.eventStatus);
  }

  if (filters.hoursAgo) {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - filters.hoursAgo);
    query = query.gte('created_at', cutoff.toISOString());
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error('❌ Error fetching logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('ℹ️  No logs found for this user\n');
    return;
  }

  console.log(`📊 Found ${logs.length} log entries\n`);
  console.log('─'.repeat(80));

  // Group logs by date
  const logsByDate: Record<string, any[]> = {};
  logs.forEach(log => {
    const date = new Date(log.created_at).toLocaleDateString();
    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }
    logsByDate[date].push(log);
  });

  // Display logs grouped by date
  Object.entries(logsByDate).forEach(([date, dateLogs]) => {
    console.log(`\n📅 ${date}`);
    console.log('─'.repeat(80));

    dateLogs.forEach((log, index) => {
      const time = new Date(log.created_at).toLocaleTimeString();
      const status = log.event_status === 'success' ? '✅' :
                     log.event_status === 'error' ? '❌' :
                     log.event_status === 'pending' ? '⏳' : 'ℹ️';

      console.log(`\n${status} ${time} - ${log.event_type}/${log.event_action}`);

      if (log.event_status === 'error' && log.error_message) {
        console.log(`   ❌ Error: ${log.error_message}`);
      }

      if (log.request_path) {
        console.log(`   🔗 Path: ${log.request_method || 'GET'} ${log.request_path}`);
      }

      if (log.ip_address) {
        console.log(`   🌍 IP: ${log.ip_address}`);
      }

      if (log.response_status) {
        const statusColor = log.response_status >= 200 && log.response_status < 300 ? '✅' :
                           log.response_status >= 400 ? '❌' : 'ℹ️';
        console.log(`   ${statusColor} Response: ${log.response_status}`);
      }

      if (log.duration_ms) {
        console.log(`   ⏱️  Duration: ${log.duration_ms}ms`);
      }

      if (log.metadata && Object.keys(log.metadata).length > 0) {
        console.log(`   📦 Metadata:`, JSON.stringify(log.metadata, null, 2).split('\n').map(line => '      ' + line).join('\n').trim());
      }

      if (log.error_stack && process.argv.includes('--verbose')) {
        console.log(`   📚 Stack Trace:`);
        console.log(log.error_stack.split('\n').map((line: string) => '      ' + line).join('\n'));
      }
    });
  });

  console.log('\n' + '═'.repeat(80));

  // Summary statistics
  const errorCount = logs.filter(l => l.event_status === 'error').length;
  const successCount = logs.filter(l => l.event_status === 'success').length;

  console.log('\n📊 Summary:');
  console.log(`   Total Logs: ${logs.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Recent Errors:');
    logs
      .filter(l => l.event_status === 'error')
      .slice(0, 5)
      .forEach(log => {
        const time = new Date(log.created_at).toLocaleString();
        console.log(`   • ${time}: ${log.event_action} - ${log.error_message}`);
      });
  }

  // Show average response time
  const logsWithDuration = logs.filter(l => l.duration_ms);
  if (logsWithDuration.length > 0) {
    const avgDuration = logsWithDuration.reduce((sum, l) => sum + l.duration_ms, 0) / logsWithDuration.length;
    console.log(`\n⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  }

  console.log('\n💡 Tip: Use --verbose flag to see full stack traces');
  console.log('💡 Tip: Add --type=error to see only errors');
  console.log('💡 Tip: Add --hours=24 to see last 24 hours only\n');
}

// Parse command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/view-user-logs.ts <email> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --type=<event_type>    Filter by event type (api_request, auth, affiliate, product, error)');
  console.error('  --status=<status>      Filter by status (success, error, pending)');
  console.error('  --limit=<number>       Limit number of results');
  console.error('  --hours=<number>       Show logs from last N hours');
  console.error('  --verbose              Show full stack traces');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx scripts/view-user-logs.ts user@example.com');
  console.error('  npx tsx scripts/view-user-logs.ts user@example.com --type=error');
  console.error('  npx tsx scripts/view-user-logs.ts user@example.com --hours=24 --verbose');
  process.exit(1);
}

// Parse filters from command line
const filters: LogFilters = {};

process.argv.forEach(arg => {
  if (arg.startsWith('--type=')) {
    filters.eventType = arg.split('=')[1];
  }
  if (arg.startsWith('--status=')) {
    filters.eventStatus = arg.split('=')[1];
  }
  if (arg.startsWith('--limit=')) {
    filters.limit = parseInt(arg.split('=')[1]);
  }
  if (arg.startsWith('--hours=')) {
    filters.hoursAgo = parseInt(arg.split('=')[1]);
  }
});

viewUserLogs(email, filters)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
