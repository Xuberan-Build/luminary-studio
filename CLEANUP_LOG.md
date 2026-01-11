# Cleanup Log

This repo was cleaned up to consolidate documentation and migrations into the
current canonical structure. If you need any removed files, recover them from
git history.

## Removed in Cleanup

- `documents/` (legacy docs consolidated)
- `database/migrations/` (legacy SQL migrations consolidated under `supabase/migrations/`)

If you discover missing context, use:

```bash
git log -- <path>
git show <commit>:<path>
```
