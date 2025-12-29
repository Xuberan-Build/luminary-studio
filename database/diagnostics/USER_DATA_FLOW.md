# User Data Flow & Organization

## 📊 Current Data Architecture

### **User Journey → Data Generated**

```
User starts product
    ↓
Step 1: Upload Charts
    ↓
STORAGE: user-uploads bucket
    └── {user_id}/
        └── {session_id}/
            ├── chart1.pdf
            └── chart2.png
    ↓
DATABASE: uploaded_documents table
    └── Tracks: file_name, storage_path, user_id, session_id
    ↓
Vision API Extraction
    ↓
DATABASE: product_sessions.placements (JSONB)
    └── Stores: astrology{}, human_design{}
    ↓
Steps 2-5: User answers questions
    ↓
DATABASE: conversations table
    └── session_id, step_number, messages[] (JSONB array)
    ↓
Final Step: Generate Deliverable
    ↓
DATABASE: product_sessions.deliverable_content (TEXT)
    └── Full blueprint/report (400-500 words)
```

## 🗄️ Data Storage Breakdown

### **1. Storage Buckets**
```
user-uploads/
  └── {user_id}/           ← User isolation
      └── {session_id}/    ← Session isolation
          └── files        ← Chart PDFs/images
```

**Expected Organization:**
- ✅ User ID folder (privacy)
- ✅ Session ID subfolder (multiple products)
- ✅ Only authenticated users can upload
- ❓ Are orphaned files cleaned up?

### **2. Database Tables**

#### `product_sessions` (Core user data)
```sql
{
  id: uuid,
  user_id: uuid,              ← Links to auth.users
  product_slug: string,       ← Which product
  placements: jsonb,          ← Extracted chart data
  deliverable_content: text,  ← Final blueprint
  current_step: int,
  is_complete: boolean
}
```

#### `conversations` (Chat history)
```sql
{
  id: uuid,
  session_id: uuid,          ← Links to product_sessions
  step_number: int,
  messages: jsonb[]          ← Array of {role, content, timestamp}
}
```

#### `uploaded_documents` (File tracking)
```sql
{
  id: uuid,
  user_id: uuid,
  session_id: uuid,
  storage_path: string,      ← Path in bucket
  file_name: string,
  file_size: bigint
}
```

## 🔒 Privacy & Security Concerns

### **Questions to Answer:**

1. **Row Level Security (RLS)**
   - ✅ Is RLS enabled on all tables?
   - ✅ Can users only see their own data?
   - ❓ Are there any data leaks between users?

2. **Storage Bucket Security**
   - ✅ Are files private by default?
   - ✅ Can users only access their own files?
   - ❓ Are signed URLs time-limited?

3. **Data Retention**
   - ❓ When are old files deleted?
   - ❓ Are incomplete sessions cleaned up?
   - ❓ How long do we keep conversation history?

4. **Cross-User Data Sharing**
   - ❓ Can placements be copied between users? (Should be NO)
   - ❓ Can users see other users' deliverables? (Should be NO)
   - ✅ Each session is isolated by user_id

## 📈 Data Growth Over Time

### **Per User (estimated)**
```
Chart uploads:      2-5 MB  (2-3 PDFs)
Placements JSON:    5-10 KB
Conversations:      50-100 KB (5 steps × 3 follow-ups)
Deliverable:        5-10 KB (500 words)
---
Total per product:  ~2-5 MB per user
```

### **Scaling Concerns**
- 100 users × 3 products = ~600 MB - 1.5 GB ✅ Fine
- 1,000 users × 3 products = ~6-15 GB ✅ Still fine
- 10,000 users × 3 products = ~60-150 GB ⚠️ Need cleanup strategy

## 🧹 Recommended Cleanup Rules

### **Automatic Cleanup (not yet implemented)**

1. **Orphaned Files**
   - If `uploaded_documents` record deleted → delete file from storage
   - If session reset → delete old chart files

2. **Old Incomplete Sessions**
   - Sessions older than 30 days + not completed → archive or delete

3. **Duplicate Sessions**
   - If user starts same product twice → keep most recent
   - Option to "resume" previous session instead

4. **Conversation History**
   - Keep for completed sessions (valuable)
   - Delete for reset/abandoned sessions older than 30 days

## ✅ What's Working Well

1. ✅ User isolation via `user_id`
2. ✅ Session-based organization
3. ✅ Placements stored in database (no need to re-parse charts)
4. ✅ Conversation history saved for audit/improvement
5. ✅ Deliverables stored long-term

## 🔴 Potential Issues to Check

1. ❌ Orphaned files in storage (files without DB records)
2. ❌ Missing files (DB records without files)
3. ❌ Duplicate sessions for same user/product
4. ❌ No automatic cleanup of old data
5. ❌ No RLS policies documented
6. ❌ Storage bucket policies not verified

## 🎯 Next Steps

**Run the audit:**
```
/Users/studio/Projects/luminary-studio-nextjs/database/diagnostics/storage_and_data_audit.sql
```

This will show:
- Actual storage usage per user
- Orphaned files
- Missing files
- Privacy compliance
- Data distribution

After seeing the results, I'll create:
1. Cleanup migration (remove orphaned data)
2. RLS policies (ensure privacy)
3. Automated cleanup triggers (prevent future mess)
