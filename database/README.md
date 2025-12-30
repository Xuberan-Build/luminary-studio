# Database Documentation

## 📁 Current Structure

```
/database/
├── README.md                    ← You are here
├── schema.sql                   ← Initial database schema (reference only)
├── seed-*.sql                   ← Product definitions (Quantum, Personal Alignment, etc.)
├── migrations/                  ← OLD migration system (being deprecated)
│   ├── 001_affiliate_system_core.sql
│   ├── 002_enhance_users_for_affiliates.sql
│   ├── 007_test_account_auto_access.sql  ⚠️ DUPLICATE NUMBER
│   ├── 007_fix_rls_security.sql          ⚠️ DUPLICATE NUMBER
│   └── ... (messy, needs cleanup)
└── diagnostics/                 ← NEW: Database health checks
    ├── database_health_check.sql
    ├── storage_and_data_audit.sql
    ├── CLEANUP_PLAN.md
    └── USER_DATA_FLOW.md

/supabase/
├── config.toml                  ← Supabase CLI configuration
└── migrations/                  ← NEW: Official migration system (use this!)
    └── 20251228193644_auto_copy_placements_between_products.sql
```

## 🎯 What's What

### **1. Schema Files**

#### `schema.sql`
- **Purpose**: Initial database setup
- **When to use**: Reference only, already applied to production
- **Contains**: Tables (users, product_sessions, conversations, etc.)

#### `seed-*.sql` files
- **Purpose**: Insert product definitions into database
- **Files**:
  - `seed-quantum-initiation.sql` - Business Alignment Orientation
  - `seed-personal-alignment.sql` - Personal Alignment Orientation
  - `seed-products.sql` - Quantum Structure, Profit & Scale
- **When to use**: After creating a new product, run its seed file once
- **⚠️ Important**: These are data inserts, not migrations!

### **2. Migrations** (THE MESS)

We have **TWO** migration folders - this is the problem!

#### `/database/migrations/` ❌ OLD SYSTEM
- **Status**: Being deprecated
- **Problem**: Numbered migrations (001, 002, etc.)
- **Issues**:
  - Duplicate numbers (007 appears twice, 008 appears twice)
  - No automatic tracking of what's been applied
  - Not compatible with Supabase CLI
  - Can't tell which are in production vs local

#### `/supabase/migrations/` ✅ NEW SYSTEM
- **Status**: Official going forward
- **Format**: Timestamped (20251228193644_description.sql)
- **Benefits**:
  - No conflicts (unique timestamps)
  - Supabase CLI compatible
  - Version controlled
  - Can apply with `supabase db push`

**DECISION**: Use `/supabase/migrations/` for all new migrations!

### **3. Diagnostics** (NEW)

#### Purpose
Health checks and audits to understand what's in the database and storage buckets.

#### Files

**`database_health_check.sql`**
- Shows orphaned sessions, conversations, files
- Identifies duplicate sessions
- Checks for missing placements
- Summary statistics

**`storage_and_data_audit.sql`**
- Storage bucket usage per user
- Orphaned files (no DB record)
- Missing files (DB record but no file)
- Privacy compliance check
- Total data footprint

**`CLEANUP_PLAN.md`**
- Issues found in database
- Consolidation strategy
- Immediate actions needed
- Long-term organization plan

**`USER_DATA_FLOW.md`**
- How user data flows through the system
- Storage organization
- Privacy & security analysis
- Data retention recommendations

## 🚀 How to Use

### **Running Diagnostics**

**In Supabase SQL Editor**, copy and paste:

```sql
-- Check database health
-- Copy contents of: database/diagnostics/database_health_check.sql

-- Check storage and user data
-- Copy contents of: database/diagnostics/storage_and_data_audit.sql
```

### **Creating New Migrations**

**DON'T** create in `/database/migrations/`

**DO** use Supabase CLI:
```bash
# Create new migration
supabase migration new descriptive_name

# This creates: supabase/migrations/TIMESTAMP_descriptive_name.sql
# Edit the file, then apply:
supabase db push
```

### **Seeding Products**

When you create a new product:

1. Run the product definition script:
   ```bash
   npm run generate-product-sql product-name
   ```

2. This creates: `database/seed-product-name.sql`

3. Run in Supabase SQL Editor (copy/paste the file contents)

4. Product is now available in the app!

## 🗄️ Database Tables Overview

### **Core Tables**

**`users`**
- Extended auth.users with additional fields
- Tracks affiliate status, referral codes

**`product_definitions`**
- Stores product configurations
- Steps, prompts, system prompts
- One row per product

**`product_sessions`**
- User's progress through a product
- Stores placements (chart data)
- Stores deliverable (final blueprint)
- One row per user per product attempt

**`conversations`**
- Chat history for each step
- Messages stored as JSONB array
- One row per session per step

**`uploaded_documents`**
- Tracks files uploaded to storage
- Links files to sessions
- Metadata: file_name, size, path

**`product_access`**
- Who can access which products
- Purchase tracking
- Completion tracking

### **Affiliate Tables**

**`referral_hierarchy`**
- User referral relationships
- Referral codes and links
- Commission tracking tiers

**`affiliate_commissions`**
- Commission records per sale
- Status: pending, paid, cancelled

**`referral_clicks`**
- Track referral link clicks
- Analytics data

## 🔒 Storage Buckets

### **user-uploads**

**Structure:**
```
user-uploads/
  └── {user_id}/
      └── {session_id}/
          ├── chart1.pdf
          └── chart2.png
```

**Purpose**: Store user-uploaded birth charts and HD charts

**Security**: Private bucket, users can only access their own files

**Cleanup**: Should delete files when session is reset or deleted (not yet implemented)

## ⚠️ Known Issues

1. **Duplicate migrations** in `/database/migrations/`
2. **No tracking** of which migrations applied to production
3. **Orphaned data** - files/sessions/conversations without parent records
4. **No automated cleanup** of old/incomplete sessions
5. **Two migration systems** causing confusion

## ✅ Next Steps

1. **Run diagnostics** to see actual state:
   - `database_health_check.sql`
   - `storage_and_data_audit.sql`

2. **Create cleanup migration** based on diagnostic results

3. **Consolidate migrations**:
   - Move all from `/database/migrations/` to `/supabase/migrations/`
   - Add timestamps to avoid conflicts
   - Document which are already in production

4. **Set up migration tracking**:
   - Create `schema_migrations` table
   - Log each migration when applied
   - Prevent re-running migrations

5. **Automated cleanup**:
   - Trigger to delete orphaned files
   - Cron job to clean old incomplete sessions
   - Archive completed sessions after 90 days

## 📚 Reference Links

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Storage Buckets](https://supabase.com/docs/guides/storage)

## 🆘 Quick Commands

```bash
# Create migration
supabase migration new migration_name

# Apply migrations to remote
supabase db push

# Check database status
supabase db diff

# Generate TypeScript types
supabase gen types typescript --linked > src/lib/database.types.ts

# View remote database
supabase db remote commit
```

---

**Last Updated**: 2025-12-28
**Maintainer**: Claude + Austin Santos
