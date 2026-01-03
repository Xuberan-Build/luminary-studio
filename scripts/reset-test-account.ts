import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try multiple .env files in order
const envFiles = ['.env.production.local', '.env.local', '.env'];
let envLoaded = false;

for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    envLoaded = true;
    console.log(`📝 Loaded environment from ${file}`);
    break;
  }
}

if (!envLoaded) {
  console.error('❌ No .env file found');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment file');
  console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`);
  console.error(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓' : '✗'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function resetTestAccount() {
  const testEmail = 'santos.93.aus@gmail.com';

  console.log(`\n🔄 Resetting test account: ${testEmail}\n`);

  // Get user via auth admin API
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching users:', authError);
    process.exit(1);
  }

  const user = authData.users.find(u => u.email === testEmail);

  if (!user) {
    console.log('❌ User not found');
    console.log('Available users:', authData.users.map(u => u.email));
    process.exit(1);
  }

  const userId = user.id;
  console.log(`✓ Found user ID: ${userId}`);

  // Get current sessions count
  const { data: sessions } = await supabase
    .from('product_sessions')
    .select('id, product_slug, completed_at')
    .eq('user_id', userId);

  console.log(`\n📊 Current state:`);
  console.log(`  - Total sessions: ${sessions?.length || 0}`);

  if (sessions) {
    const completed = sessions.filter(s => s.completed_at).length;
    console.log(`  - Completed: ${completed}`);
    console.log(`  - In progress: ${sessions.length - completed}`);
  }

  // Delete all sessions for fresh start
  const { error: deleteError } = await supabase
    .from('product_sessions')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('❌ Error deleting sessions:', deleteError);
    process.exit(1);
  }

  console.log(`\n✅ Reset complete!`);
  console.log(`  - All sessions deleted`);
  console.log(`  - Product access preserved`);
  console.log(`  - User can start fresh\n`);
}

resetTestAccount().catch(console.error);
