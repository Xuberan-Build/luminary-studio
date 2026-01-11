create table if not exists public.content_index (
  doc_id text primary key,
  name text not null,
  mime_type text not null,
  path text not null,
  parent_id text,
  modified_time timestamptz,
  depth integer not null default 0,
  is_folder boolean not null default false,
  last_synced_at timestamptz not null default now()
);

create index if not exists content_index_path_idx on public.content_index (path);
