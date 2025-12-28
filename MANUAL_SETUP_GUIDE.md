# Manual Template Setup Guide

Due to Google Cloud service account restrictions on consumer accounts, the service account cannot create Google Docs programmatically. This guide shows you how to manually create the template document (one-time setup, 5 minutes).

## Why Manual Setup?

**Service account CAN**:
- ✅ Read Google Docs
- ✅ Parse document content
- ✅ Create folders
- ✅ Sync to Supabase
- ✅ Generate Stripe payment links

**Service account CANNOT**:
- ❌ Create Google Docs (consumer account restriction)

By creating the template manually once, you unlock the full automated workflow for all future products.

---

## Step 1: Create Folder Structure

Run this command to create the folder structure automatically:

```bash
npm run create-folders
```

This creates:
- `Archive/` - For old/deprecated products
- `Drafts/` - For products in development
- `Approved/` - For production-ready products

---

## Step 2: Create Template Document

### 2.1 Open Product Development Folder

Go to: https://drive.google.com/drive/folders/15Jde1m6c7geOeYEmO49ChAvJO1AOaCxf

### 2.2 Create New Google Doc

1. Click "New" → Google Docs → Blank document
2. Name it: **PRODUCT TEMPLATE - MASTER COPY**

### 2.3 Copy Template Content

1. Open `PRODUCT_TEMPLATE_CONTENT.txt` in this repository
2. Copy ALL the content
3. Paste into your new Google Doc

### 2.4 Share with Service Account

1. Click the "Share" button in the top right
2. Add this email: `quantum-drive-assist@quantum-gpt-assistant.iam.gserviceaccount.com`
3. Set permission to: **Editor**
4. Uncheck "Notify people" (no need to send email)
5. Click "Share"

### 2.5 Get Document ID

1. Look at the URL in your browser
2. Format: `https://docs.google.com/document/d/DOCUMENT_ID_HERE/edit`
3. Copy the `DOCUMENT_ID_HERE` part

Example:
- URL: `https://docs.google.com/document/d/1abc123xyz456/edit`
- Document ID: `1abc123xyz456`

### 2.6 Add to Environment Variables

1. Open `.env.local` in your project
2. Add this line:

```bash
GOOGLE_PRODUCT_TEMPLATE_DOC_ID=YOUR_DOCUMENT_ID_HERE
```

Replace `YOUR_DOCUMENT_ID_HERE` with the ID you copied.

---

## Step 3: Test Document Reading

Run this command to verify the service account can read and parse your template:

```bash
npm run test-doc-parse
```

Expected output:
```
✓ Successfully read template document
✓ Parsed product metadata
✓ Found 7 steps
✓ Validation passed
```

If you see errors, check:
- Document is shared with service account (Editor permission)
- Document ID in `.env.local` is correct
- Template content matches the expected format

---

## Step 4: Create Example Product (Optional)

### 4.1 Make a Copy of Template

1. In Google Drive, right-click the template doc
2. Select "Make a copy"
3. Rename to: **Quantum Pricing Mastery - Product Template (DRAFT)**
4. Move to the `Drafts/` folder

### 4.2 Customize Content

Replace placeholders:
- `[PRODUCT NAME]` → `Pricing Mastery`
- `[slug]` → `pricing-mastery`
- `[Product Name]` → `Pricing Mastery`
- `[Role]` → `Pricing Architect`
- `[Archetype]` → `Strategist`
- `[deliverable type]` → `pricing blueprints`
- `[domain]` → `pricing`

### 4.3 Share with Service Account

Same process as Step 2.4 - share with service account (Editor permission)

### 4.4 Get Document ID

Copy the document ID from the URL

### 4.5 Test Parsing

```bash
npm run test-doc-parse YOUR_DOCUMENT_ID_HERE
```

---

## Workflow for Creating New Products

Once setup is complete, creating new products is simple:

### 1. Create New Product Document

1. Go to Drafts folder in Google Drive
2. Right-click template → "Make a copy"
3. Rename to your product name
4. Customize the content for your product
5. Share with service account (Editor permission)

### 2. Review & Approve

- Use Google Docs comments for feedback
- Team members can suggest edits
- Mark as approved when ready

### 3. Move to Approved Folder

Once approved, move the document to the `Approved/` folder

### 4. Sync to Production

Run the sync command with your document ID:

```bash
npm run sync-product YOUR_DOCUMENT_ID
```

This will:
- ✅ Read and parse the document
- ✅ Validate all required fields
- ✅ Create/update product in Supabase (`product_definitions` table)
- ✅ Create/update prompts in Supabase (`prompts` table)
- ✅ Generate Stripe payment link
- ✅ Update product navigation
- ✅ Deploy to production

### 5. Test Product

Visit: `https://quantumstrategies.online/products/YOUR_SLUG/interact`

---

## Troubleshooting

### "Permission denied" error

**Fix**: Make sure you shared the document with the service account:
- Email: `quantum-drive-assist@quantum-gpt-assistant.iam.gserviceaccount.com`
- Permission: Editor

### "Document not found" error

**Fix**: Check the document ID in your command or `.env.local` file matches the ID in the Google Docs URL

### "Invalid format" error

**Fix**: Make sure your document follows the template structure exactly:
- All required sections present (metadata, system prompt, steps 1-7, final deliverable)
- Section headings use exact wording from template
- Metadata fields use `Key: Value` format

### Parse validation fails

**Fix**: Run with verbose logging to see which fields are missing:

```bash
npm run test-doc-parse YOUR_DOCUMENT_ID -- --verbose
```

---

## Summary

**One-Time Setup** (5 minutes):
1. ✅ Create folders: `npm run create-folders`
2. ✅ Create template doc manually in Drive
3. ✅ Share with service account
4. ✅ Add document ID to `.env.local`
5. ✅ Test: `npm run test-doc-parse`

**For Each New Product** (automated):
1. Copy template → Customize → Share
2. Sync: `npm run sync-product DOCUMENT_ID`
3. Product goes live automatically

The manual doc creation is a small one-time cost that unlocks full automation for your entire product development pipeline.
