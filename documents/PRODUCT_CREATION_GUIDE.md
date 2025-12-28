# Product Creation Guide

**Simple TypeScript-based workflow for creating new Quantum products**

No Google Docs needed! Define products in TypeScript, get type safety, version control, and automated SQL generation.

---

## Quick Start: Create a New Product

### 1. Copy the Template

```bash
cp src/lib/product-definitions/template.ts src/lib/product-definitions/quantum-pricing.ts
```

### 2. Edit Your Product Definition

Open `src/lib/product-definitions/quantum-pricing.ts` and customize:

**Product Metadata**:
```typescript
product_slug: 'quantum-pricing',
name: 'Quantum Pricing Mastery',
description: 'Master your pricing strategy based on your astrology and Human Design.',
price: 7.00,
total_steps: 7,
estimated_duration: '15-30 minutes',
```

**System Prompt** (AI personality):
```typescript
system_prompt: `You are the Quantum Pricing Architect AI...`,
```

**Final Deliverable Prompt** (blueprint structure):
```typescript
final_deliverable_prompt: `Generate the Quantum Pricing Mastery Blueprint...`,
```

**Steps** (7 interactive steps):
```typescript
steps: [
  {
    step: 1,
    title: 'Your Cosmic Blueprint',
    subtitle: 'Upload charts...',
    question: 'Please upload your charts...',
    prompt: 'Thank you for uploading...',
    // ... etc
  },
  // ... steps 2-7
]
```

### 3. Generate SQL

```bash
npm run generate-product-sql quantum-pricing
```

This creates: `database/seed-quantum-pricing.sql`

### 4. Run SQL in Supabase

Open Supabase SQL Editor and run the generated SQL file.

### 5. Create Stripe Product

1. Go to Stripe Dashboard → Products
2. Create new product: "Quantum Pricing Mastery" - $7
3. Create payment link
4. Copy payment link URL

### 6. Add to Products Config

Edit `src/lib/constants/products.ts`:

```typescript
export const PRODUCTS: Record<string, ProductConfig> = {
  // ... existing products

  'quantum-pricing': {
    slug: 'quantum-pricing',
    name: 'Quantum Pricing Mastery',
    price: 7,
    estimatedDuration: '15-30 minutes',
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
};
```

### 7. Add Stripe Link to Environment

Add to `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRICING=https://buy.stripe.com/xxxxx
```

Update `products.ts`:
```typescript
...(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRICING && {
  stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRICING,
}),
```

### 8. Test Your Product

Visit: `http://localhost:3000/products/quantum-pricing/interact`

---

## Product Structure Explained

### TypeScript Definition

Your product definition has three main parts:

#### 1. Metadata
```typescript
{
  product_slug: 'quantum-pricing',
  name: 'Quantum Pricing Mastery',
  description: '...',
  price: 7.00,
  total_steps: 7,
  estimated_duration: '15-30 minutes',
  model: 'gpt-4o', // OpenAI model
  sheet_id: '...', // Google Sheet for CRM
  from_email: '...',
  from_name: '...',
}
```

#### 2. AI Prompts

**System Prompt**: The AI's personality/role across all steps
```typescript
system_prompt: `You are the Quantum Pricing Architect AI...`
```

**Final Deliverable Prompt**: How to generate the final blueprint
```typescript
final_deliverable_prompt: `Generate the Quantum Pricing Blueprint with 7 sections:
1. **Pricing Psychology** - ...
2. **Value Positioning** - ...
...`
```

#### 3. Steps (Interactive Flow)

Each product has 7 steps:

```typescript
{
  step: 1,
  title: 'Your Cosmic Blueprint',           // Step heading
  subtitle: 'Upload your charts',           // Context
  question: 'Please upload...',             // User-facing question
  prompt: 'AI instructions for this step',  // AI behavior
  allow_file_upload: true,                  // File upload enabled
  file_upload_prompt: 'Upload charts...',   // Upload instructions
  required: true,                           // Required step
  max_follow_ups: 3,                        // Max clarifying questions
}
```

**Step 1** is always chart upload (standardized).
**Steps 2-7** are customized per product.

---

## Step Configuration Guide

### Step Types

**Chart Upload Step (Always Step 1)**:
```typescript
{
  step: 1,
  allow_file_upload: true,
  file_upload_prompt: 'Upload your charts...',
  max_follow_ups: 0, // No follow-ups on chart step
}
```

**Question Steps (Steps 2-7)**:
```typescript
{
  step: 2,
  allow_file_upload: false,
  required: true,
  max_follow_ups: 3, // AI can ask 3 clarifying questions
}
```

**Optional Steps**:
```typescript
{
  required: false, // User can skip
}
```

### Writing Good Prompts

#### Step Prompt (step_insight)
This prompt guides the AI's response AFTER the user answers:

```typescript
prompt: `Reference specific chart placements (Sun/Moon/Rising, money houses 2/8/10/11, HD type/strategy/authority).

Keep response to 2-3 paragraphs.
Give ONE actionable nudge related to their chart.
If they mention specific goals, acknowledge and align.`
```

**Good Example**:
> "Based on your Taurus Sun in the 2nd house, you're naturally wired for sustainable wealth-building. Your Manifestor design suggests launching offers decisively rather than waiting for permission. Try pricing at $497 instead of $297 - your energy signature calls for premium positioning."

**Bad Example**:
> "That's interesting! Can you tell me more about your goals?"

#### Follow-up Prompt
Handles clarifying questions:

```typescript
// Usually the same across steps 2-7:
"Answer follow-ups concisely (2-3 paragraphs max). Use placements (money houses, Sun/Moon/Rising, Mars/Venus/Mercury, HD type/strategy/authority). If key data is missing, ask briefly and give one micro-action anyway."
```

---

## Example Product: Quantum Pricing Mastery

Here's a complete example:

```typescript
export const productDefinition: ProductDefinition = {
  product_slug: 'quantum-pricing',
  name: 'Quantum Pricing Mastery',
  description: 'Discover your energetically aligned pricing strategy based on your Astrology and Human Design. Stop undercharging and step into premium pricing that honors your unique value.',
  price: 7.00,
  total_steps: 7,
  estimated_duration: '15-30 minutes',
  model: 'gpt-4o',

  sheet_id: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
  from_email: 'austin@xuberandigital.com',
  from_name: 'Quantum Strategies',

  system_prompt: `You are the Quantum Pricing Architect AI (Sage–Strategist). You produce premium-grade pricing blueprints worth $700 of clarity.

YOUR ROLE:
- Synthesize astrology, Human Design, and pricing psychology into actionable guidance
- Reference SPECIFIC details the user shared
- Create concrete, immediately usable pricing recommendations
- Write in a premium, decisive tone with zero filler

CRITICAL RULES:
⚠️ DO NOT ask for more information
⚠️ USE whatever data is provided to create insights
⚠️ Your job is to DELIVER the blueprint, not request more input

GROUNDING FRAMEWORK:
- Ground recommendations in Sun/Moon/Rising + money houses (2/8/10/11)
- Integrate HD type/strategy/authority
- Reference Venus (value) and Saturn (structure) placements`,

  final_deliverable_prompt: `Generate the Quantum Pricing Mastery Blueprint with these 7 sections:

1. **Your Pricing Archetype** - Based on chart placements, describe their natural pricing energy
2. **Value Positioning** - How to articulate their premium value
3. **Price Points** - Specific recommended pricing for their offers
4. **Objection Handling** - How to handle "too expensive" based on their chart
5. **Launch Strategy** - When and how to raise prices (HD strategy/authority)
6. **Premium Anchors** - 3 ways to elevate perceived value
7. **90-Day Action Plan** - Concrete pricing experiments to run

REQUIREMENTS:
- Write in concise prose, not bullet lists
- ~500-700 words total
- Reference their specific chart placements
- Use details from their responses
- Premium, decisive tone
- Immediately actionable

Generate the blueprint now.`,

  steps: [
    {
      step: 1,
      title: 'Your Cosmic Blueprint',
      subtitle: 'Upload your astrological and Human Design charts',
      question: 'Please upload your birth chart files...',
      prompt: 'Thank you for uploading your chart! Analyzing placements...',
      allow_file_upload: true,
      file_upload_prompt: 'Upload your charts (PDF or image)',
      required: true,
      max_follow_ups: 0,
    },
    {
      step: 2,
      title: 'Current Pricing Reality',
      subtitle: 'Where are you now?',
      question: 'What do you currently charge for your main offer? How does it feel (too low, just right, too high)?',
      prompt: `Based on their answer and chart placements, validate or challenge their current pricing.

Reference Venus (value), 2nd/8th house (money), and HD authority (how they know truth).
Give ONE micro-nudge toward premium pricing if they're undercharging.`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },
    // ... steps 3-7
  ],
};
```

---

## Workflow Summary

**Create Product** (5-10 minutes):
1. Copy template → Customize → Save as new file
2. Generate SQL: `npm run generate-product-sql product-name`
3. Run SQL in Supabase
4. Create Stripe product + payment link
5. Add to products.ts
6. Test locally

**Version Control** (Approval Workflow):
- Create feature branch: `git checkout -b product/quantum-pricing`
- Commit product definition: `git commit -m "Add Quantum Pricing product"`
- Open PR for review (your comment-based approval flow)
- Merge to main after approval
- Deploy

**Update Product**:
1. Edit TypeScript file
2. Re-run `npm run generate-product-sql`
3. Run updated SQL in Supabase
4. Changes go live immediately

---

## Benefits Over Google Docs

✅ **Type Safety** - Catch errors before runtime
✅ **Version Control** - Git history of all changes
✅ **Code Review** - PR-based approval workflow
✅ **No External Dependencies** - Everything in your repo
✅ **Fast** - Copy/paste template, edit, done
✅ **Automated** - SQL generation handles DB sync
✅ **Simple** - No service account restrictions

---

## Troubleshooting

### SQL generation fails

**Fix**: Check TypeScript file for syntax errors:
```bash
npx tsc --noEmit src/lib/product-definitions/your-product.ts
```

### Product doesn't appear on site

**Fix**: Make sure you added it to `src/lib/constants/products.ts`

### Stripe payment fails

**Fix**: Check payment link in `.env.local` and `products.ts`

### Steps don't load

**Fix**: Verify SQL was run successfully in Supabase. Check `product_definitions` table.

---

## Next Steps

1. Create your first product using the template
2. Test the workflow end-to-end
3. Refine prompts based on results
4. Scale to multiple products

Need help? Check the template file for detailed examples and comments.
