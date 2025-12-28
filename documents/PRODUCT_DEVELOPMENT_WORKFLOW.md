# GPT Product Development Workflow

This document outlines the complete workflow for developing new GPT products using Google Docs and automated syncing to Supabase.

---

## 🎯 **Workflow Overview**

```
1. Create Google Doc from Template
   ↓
2. Fill in Product Details
   ↓
3. Review & Approve (comment-based)
   ↓
4. Run Sync Command
   ↓
5. Auto-generate Stripe Payment Link
   ↓
6. Create Landing Page
   ↓
7. Update Navigation
   ↓
8. Deploy to Production
```

---

## 📝 **Step 1: Create Product Document**

### **From Template:**
1. Open the template doc (ID in `GOOGLE_PRODUCT_TEMPLATE_DOC_ID`)
2. Make a copy: **File → Make a Copy**
3. Rename to: `[Product Name] - Product Template`
4. Move to Product Development folder
5. Share with service account: `quantum-drive-assist@quantum-gpt-assistant.iam.gserviceaccount.com`

### **Folder Structure:**
```
📁 Product Development/
├── 📄 Quantum Pricing Mastery - Product Template (DRAFT)
├── 📄 Quantum Authority - Product Template (APPROVED)
├── 📄 Quantum Messaging - Product Template (IN REVIEW)
└── 📁 Archive/
    └── 📄 Old versions...
```

---

## ✍️ **Step 2: Fill in Product Details**

### **Required Sections:**

#### **A. Product Metadata**
- Slug (lowercase-with-dashes, unique)
- Display name
- Price ($7 or $14 typically)
- Description (1-2 paragraphs)
- Landing page content

#### **B. System Prompt**
- Core AI persona
- Role definition
- Critical rules
- Grounding framework

#### **C. 7 Steps**
For each step, define:
- Title & subtitle
- Main question
- File upload (YES/NO)
- Required (YES/NO)
- Max follow-ups (0-3)
- Assistant response prompt (step_insight)
- Follow-up response prompt

#### **D. Final Deliverable Prompt**
- Section structure (7 sections typical)
- Word count target
- Tone requirements
- Specific instructions

#### **E. Configuration**
- CRM settings
- Navigation placement
- Status tracking

---

## 👥 **Step 3: Review & Approval Process**

### **Using Google Docs Comments:**

1. **DRAFT Status**
   - Add comment: `@reviewer Ready for review`
   - Tag reviewer in comments

2. **IN REVIEW Status**
   - Reviewer adds comments/suggestions
   - Use "Suggesting" mode for edits
   - Resolve comments as addressed

3. **APPROVED Status**
   - Reviewer adds comment: `APPROVED - Ready to sync`
   - Update Status section to: `APPROVED`
   - Add approval date and name

### **Approval Checklist:**
- [ ] Product slug is unique and follows naming convention
- [ ] All 7 steps have complete prompts
- [ ] System prompt is clear and actionable
- [ ] Final deliverable structure matches product goals
- [ ] Price point is appropriate for transformation
- [ ] Landing page copy is compelling
- [ ] No placeholder text remains

---

## 🔄 **Step 4: Sync to Supabase**

### **Run Sync Command:**
```bash
npm run sync-product [GOOGLE_DOC_ID]
```

Example:
```bash
npm run sync-product 1Abc123XYZ456
```

### **What This Does:**
1. **Reads Google Doc** using Docs API
2. **Parses structure** (headings, content, prompts)
3. **Validates data** (required fields, format)
4. **Inserts into Supabase:**
   - `product_definitions` table (product data + steps JSONB)
   - `prompts` table (system, step_insight, followup, final_briefing)
5. **Updates `products.ts`** (adds new product config)
6. **Returns summary** of what was created

### **Sync Output Example:**
```
✓ Parsed product: Quantum Pricing Mastery
✓ Found 7 steps
✓ Validated all prompts
✓ Inserted into product_definitions (ID: uuid-123)
✓ Created 4 prompts in prompts table
✓ Updated src/lib/constants/products.ts
→ Next: Create Stripe payment link
```

---

## 💳 **Step 5: Stripe Payment Link Setup**

### **Manual Method (Current):**
1. Go to [Stripe Dashboard → Payment Links](https://dashboard.stripe.com/payment-links)
2. Click **New**
3. Configure:
   - Name: [Product Name]
   - Price: $X
   - Success URL: `https://quantumstrategies.online/products/[slug]/interact?session_id={CHECKOUT_SESSION_ID}`
4. Copy payment link
5. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_STRIPE_PAYMENT_LINK_[SLUG_UPPER]=https://buy.stripe.com/...
   ```

### **Automated Method (Future):**
The sync command will:
1. Create Stripe product via API
2. Create payment link via API
3. Auto-add to `.env.local`
4. Commit changes to git

---

## 🎨 **Step 6: Create Landing Page**

### **Option A: Generate from Template**
```bash
npm run generate-landing [product-slug]
```

This creates:
- `/src/app/(content)/products/[slug]/page.tsx`
- Uses template with product data from Supabase
- Includes: Hero, Features, Pricing, FAQ

### **Option B: Manual Creation**
1. Copy existing product landing page
2. Update all content from Google Doc
3. Replace product slug in imports
4. Update metadata (title, description)

### **Required Components:**
```tsx
import { ProductHeader } from '@/components/products/ProductHeader';
import { StripeCheckout } from '@/components/products/StripeCheckout';

// Get product config
const product = PRODUCTS.find(p => p.slug === 'your-slug');
```

---

## 🧭 **Step 7: Update Navigation**

### **Add to Navigation Config:**
`/src/components/layout/Navigation.tsx`

```tsx
const navLinks = [
  // ... existing links
  {
    label: 'Pricing Mastery',
    href: '/products/quantum-pricing-mastery',
    category: 'Products'
  }
];
```

### **Update Product Index:**
`/src/app/products/page.tsx`

Add product card to products listing page.

---

## 🚀 **Step 8: Deploy to Production**

### **Deployment Checklist:**
- [ ] Run `npm run build` locally (verify no errors)
- [ ] Test product experience in local dev
- [ ] Verify file uploads work (chart extraction)
- [ ] Test full flow: upload → steps → final deliverable
- [ ] Check Stripe payment link redirects correctly
- [ ] Commit all changes to git
- [ ] Push to main branch
- [ ] Verify Vercel deployment succeeds
- [ ] Test live site purchase flow
- [ ] Monitor Supabase logs for errors

### **Git Commit:**
```bash
git add .
git commit -m "feat: add [Product Name] GPT product

- Add product definition to Supabase
- Create landing page
- Configure Stripe payment link
- Update navigation"
git push
```

---

## 🔧 **Sync Command Details**

### **Implementation: `scripts/sync-product.ts`**

```typescript
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase/server';

async function syncProductFromDoc(docId: string) {
  // 1. Authenticate with Google Docs API
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/documents'],
  });

  // 2. Fetch document content
  const docs = google.docs({ version: 'v1', auth });
  const doc = await docs.documents.get({ documentId: docId });

  // 3. Parse document structure
  const product = parseProductDoc(doc.data);

  // 4. Validate required fields
  validateProduct(product);

  // 5. Insert into Supabase
  await insertProductDefinition(product);
  await insertPrompts(product);

  // 6. Update products.ts
  await updateProductsConfig(product);

  // 7. Return summary
  return {
    success: true,
    productSlug: product.slug,
    stepsCount: product.steps.length,
    promptsCreated: 4
  };
}
```

### **Parser Logic:**

The parser looks for specific heading patterns:

```
H1: Product Name → product.name
H2: "Product Metadata" → parse bullet points for slug, price, etc.
H2: "System Prompt" → product.system_prompt
H2: "Step 1: ..." → parse step details
  H3: "Step Title:" → step.title
  H3: "Main Question:" → step.question
  H3: "Assistant Response Prompt:" → step.prompt
...continue for all 7 steps...
H2: "Final Deliverable Prompt" → product.final_deliverable_prompt
```

---

## 📊 **Product Status Tracking**

### **Status Values:**
- **DRAFT** - Work in progress
- **IN REVIEW** - Ready for approval
- **APPROVED** - Ready to sync
- **SYNCED** - In Supabase, ready for landing page
- **LIVE** - Deployed to production
- **ARCHIVED** - Deprecated/removed

### **Tracking in Google Doc:**
Update the Status section at bottom of doc:
```
## Status
Status: APPROVED
Created By: Austin Santos
Created Date: 2025-01-15
Approved By: [Name]
Approval Date: 2025-01-16
Synced Date: 2025-01-16
Live Date: 2025-01-17
```

---

## 🎯 **Best Practices**

### **Prompts:**
- Keep step_insight prompts concise (2-3 paragraphs)
- Always include "one actionable nudge"
- Reference specific chart placements
- Align with stated revenue/transformation goals

### **Steps:**
- Use Steps 1-7 format (proven to work)
- Step 1 always file upload (chart extraction)
- Steps 2-7 build toward final deliverable
- Max 3 follow-ups per step (prevents infinite loops)

### **Final Deliverable:**
- 7 sections typical (proven format)
- 500-700 words total
- Premium, decisive tone
- Immediately actionable
- Specific to user's situation

### **Naming Conventions:**
- Product slug: `lowercase-with-dashes`
- Display name: `Title Case With Spaces`
- File names: `QuantumPricingMastery` (PascalCase)
- Env vars: `STRIPE_PAYMENT_LINK_PRICING` (UPPER_SNAKE_CASE)

---

## 🔐 **Security Notes**

### **Service Account Access:**
- Only grant Editor access (not Owner)
- Use folder-level sharing when possible
- Revoke access to archived products
- Rotate service account keys annually

### **Environment Variables:**
- Never commit `.env.local` to git
- Use Vercel environment variables for production
- Keep Stripe webhook secrets secure
- Rotate API keys if compromised

---

## 🐛 **Troubleshooting**

### **Sync Command Fails:**
- Verify doc is shared with service account
- Check doc ID is correct (get from URL)
- Ensure all required sections exist
- Review console error messages

### **Product Not Showing:**
- Run `npm run build` to verify no TypeScript errors
- Check `products.ts` was updated correctly
- Verify Supabase insert succeeded
- Clear Next.js cache: `rm -rf .next`

### **Stripe Link Not Working:**
- Verify success URL is correct
- Check payment link is active in Stripe
- Ensure env var name matches product slug
- Test in incognito window (clear cookies)

---

## 📈 **Future Enhancements**

### **Phase 2:**
- [ ] Auto-generate Stripe payment links via API
- [ ] Auto-create landing pages from template
- [ ] Webhook to sync on Google Doc changes
- [ ] Version control for product iterations
- [ ] A/B testing for prompts

### **Phase 3:**
- [ ] Visual product builder UI
- [ ] Prompt testing/validation tools
- [ ] Analytics dashboard per product
- [ ] Customer feedback integration
- [ ] Multi-language support

---

## 📚 **Related Documentation**

- [Product System Architecture](./GOOGLE_DOCS_PRODUCT_TEMPLATE.md)
- [Google Sheets Integration](./TECHNICAL_SPECIFICATIONS.md)
- [Affiliate System](./AFFILIATE_SYSTEM_COMPLETE.md)
- [Architecture Improvements](./ARCHITECTURE_IMPROVEMENTS.md)

---

# Quick Reference

## Commands
```bash
# Sync product from Google Doc
npm run sync-product [DOC_ID]

# Generate landing page (future)
npm run generate-landing [SLUG]

# Test product locally
npm run dev
# Visit: http://localhost:3000/products/[slug]
```

## Environment Variables
```bash
GOOGLE_PRODUCT_FOLDER_ID=15Jde1m6c7geOeYEmO49ChAvJO1AOaCxf
GOOGLE_PRODUCT_TEMPLATE_DOC_ID=[template-doc-id]
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_[SLUG]=https://buy.stripe.com/...
```

## Service Account
```
quantum-drive-assist@quantum-gpt-assistant.iam.gserviceaccount.com
```

---

**Last Updated:** 2025-01-15
**Maintained By:** Development Team
