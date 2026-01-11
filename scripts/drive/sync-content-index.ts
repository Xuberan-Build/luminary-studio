import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

type FileRecord = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  parentId: string;
  path: string;
  depth: number;
  isFolder: boolean;
};

const auditPath = process.argv[2];
if (!auditPath) {
  console.error('Provide audit JSON path: npm run drive:sync-index -- <path>');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const raw = fs.readFileSync(auditPath, 'utf8');
const records = JSON.parse(raw) as FileRecord[];

async function sync() {
  const rows = records.map((r) => ({
    doc_id: r.id,
    name: r.name,
    mime_type: r.mimeType,
    path: r.path,
    parent_id: r.parentId || null,
    modified_time: r.modifiedTime ? new Date(r.modifiedTime).toISOString() : null,
    depth: r.depth,
    is_folder: r.isFolder,
    last_synced_at: new Date().toISOString(),
  }));

  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('content_index').upsert(chunk, { onConflict: 'doc_id' });
    if (error) {
      throw error;
    }
  }

  console.log(`Synced ${rows.length} records to content_index.`);
}

sync().catch((error) => {
  console.error('Content index sync failed:', error.message || error);
  process.exit(1);
});
