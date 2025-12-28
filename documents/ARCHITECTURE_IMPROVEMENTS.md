# Architecture Improvements & Recommendations

**Created:** 2025-12-27
**Purpose:** Document architectural improvements for modularity, scalability, and maintainability

---

## 📋 Executive Summary

This document outlines specific architectural improvements to make the codebase more:
- **Modular:** Separate concerns, reusable components
- **Scalable:** Support multiple products without code duplication
- **Maintainable:** Clear patterns, single source of truth
- **Type-safe:** Comprehensive TypeScript types

---

## 🏗️ Current Architecture Overview

### Strengths
- ✅ Clear separation of API routes and components
- ✅ Supabase for database, auth, and storage
- ✅ Database-driven product configuration
- ✅ Comprehensive conversation tracking

### Areas for Improvement
- ⚠️ Multi-source prompting (database + hardcoded fallbacks)
- ⚠️ Product-specific language hardcoded in API routes
- ⚠️ Duplicate AI request logic across routes
- ⚠️ Missing TypeScript types for database schemas
- ⚠️ PDF generation coupled to component

---

## 🔍 Identified Issues

### 1. Multi-Source Prompting Complexity

**Current State:**
Prompts are loaded from 3 different sources with no clear hierarchy:

1. **Database: `product_definitions.system_prompt`**
   ```sql
   -- Seed file: database/seed-quantum-initiation.sql
   system_prompt: 'You are the Quantum Brand Architect AI...'
   ```

2. **Database: `prompts` table**
   ```sql
   -- Migration: database/update-prompts-quantum-initiation.sql
   INSERT INTO prompts (product_slug, scope, step_number, prompt)
   VALUES ('quantum-initiation', 'step_insight', null, '...');
   ```

3. **Hardcoded Fallbacks in API Routes**
   ```typescript
   // src/app/api/products/step-insight/route.ts line 75-77
   const basePrompt = dbPrompt || 'Respond after the user answers...';
   ```

**Problems:**
- Unclear which source takes precedence
- Difficult to update prompts (need to check multiple places)
- Fallbacks may drift from database versions
- No way to track prompt versions/changes

**Impact:**
- Maintenance burden when updating wizard personality
- Risk of inconsistent behavior across environments
- Harder to A/B test prompts

---

### 2. Product-Specific Language Hardcoded

**Current State:**
Multiple API routes contain hardcoded references to "Quantum Brand Architect":

```typescript
// src/app/api/products/step-insight/route.ts line 80
const context = `
You are the Quantum Brand Architect AI (Sage–Magician). ${basePrompt}
`;

// src/app/api/products/final-briefing/route.ts line 112
const systemPrompt = dbPrompt ||
  `You are the Quantum Brand Architect AI (Sage–Magician).
   You produce premium-grade blueprints worth $700 of clarity.`;
```

**Problems:**
- Can't reuse these routes for other products with different branding
- Price ($700) hardcoded in prompts
- Persona/voice is product-specific, not configurable

**Impact:**
- Need to duplicate/fork API routes for new products
- Can't white-label or rebrand without code changes
- Scaling to multiple products requires code duplication

---

### 3. Duplicate AI Request Logic

**Current State:**
Similar OpenAI API call patterns repeated across 4 different routes:

```typescript
// Repeated in step-insight, followup-response, final-briefing, extract-placements
const completion = await openai.chat.completions.create({
  model: DEFAULT_MODEL,
  messages: [...],
  max_completion_tokens: 10000,
});
const content = completion.choices[0].message.content || '';
```

**Problems:**
- Error handling duplicated
- Token limit logic duplicated
- Model selection logic duplicated
- Difficult to add features (logging, retries, rate limiting) uniformly

**Impact:**
- Bug fixes need to be applied to multiple files
- Inconsistent behavior across different API routes
- Harder to add observability/monitoring

---

### 4. Missing TypeScript Types

**Current State:**
Database schemas referenced with `any` types:

```typescript
// src/app/api/products/final-briefing/route.ts line 24-28
const userResponses = (conversations || [])
  .flatMap((c: any) =>
    ((c.messages as any[]) || [])
      .filter((m: any) => m.role === 'user')
      .map((m: any) => `Step ${c.step_number}: ${m.content}`)
  )
```

**Problems:**
- No type safety for database queries
- Easy to introduce bugs with wrong property names
- IDE autocomplete doesn't work
- Harder to refactor

**Impact:**
- Runtime errors from typos
- Slower development (manual reference to schema)
- Harder to onboard new developers

---

### 5. PDF Generation Coupled to Component

**Current State:**
PDF generation logic embedded in DeliverableView component:

```typescript
// src/components/product-experience/DeliverableView.tsx lines 61-126
const handleDownload = () => {
  const pdf = new jsPDF();
  // 65 lines of PDF formatting logic mixed with component
};
```

**Problems:**
- Can't reuse for other deliverables
- Hard to test PDF generation independently
- Component has too many responsibilities

**Impact:**
- Need to duplicate PDF logic for other products
- Can't generate PDFs server-side if needed
- Component bloat

---

## 🎯 Improvement Recommendations

### Priority 1: Consolidate Prompting Architecture

**Goal:** Single source of truth for all prompts with clear fallback hierarchy

**Implementation:**

#### Step 1: Create PromptService Class

**File:** `/src/lib/ai/PromptService.ts` (NEW)

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export type PromptScope = 'system' | 'step_insight' | 'followup' | 'final_briefing';

interface PromptConfig {
  productSlug: string;
  scope: PromptScope;
  stepNumber?: number | null;
}

interface PromptData {
  prompt: string;
  source: 'database' | 'fallback';
  productName?: string;
  brandPersona?: string;
}

export class PromptService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Load prompt with clear hierarchy:
   * 1. Database prompts table (product-specific)
   * 2. Product definition system_prompt (for scope='system')
   * 3. Fallback from constants (last resort)
   */
  async loadPrompt(config: PromptConfig): Promise<PromptData> {
    // Try prompts table first
    const { data: promptRow } = await this.supabase
      .from('prompts')
      .select('prompt')
      .eq('product_slug', config.productSlug)
      .eq('scope', config.scope)
      .is('step_number', config.stepNumber ?? null)
      .maybeSingle();

    if (promptRow?.prompt) {
      return {
        prompt: promptRow.prompt,
        source: 'database'
      };
    }

    // For system scope, try product_definitions
    if (config.scope === 'system') {
      const { data: productDef } = await this.supabase
        .from('product_definitions')
        .select('system_prompt, name, brand_persona')
        .eq('product_slug', config.productSlug)
        .maybeSingle();

      if (productDef?.system_prompt) {
        return {
          prompt: productDef.system_prompt,
          source: 'database',
          productName: productDef.name,
          brandPersona: productDef.brand_persona
        };
      }
    }

    // Last resort: fallback
    const fallback = this.getFallbackPrompt(config.scope);
    console.warn(`[PromptService] Using fallback for ${config.productSlug}/${config.scope}`);

    return {
      prompt: fallback,
      source: 'fallback'
    };
  }

  private getFallbackPrompt(scope: PromptScope): string {
    // Imported from constants file
    return FALLBACK_PROMPTS[scope] || '';
  }
}
```

#### Step 2: Create Prompt Constants File

**File:** `/src/lib/ai/prompt-fallbacks.ts` (NEW)

```typescript
/**
 * Fallback prompts used ONLY when database prompts are unavailable.
 * These should be generic and product-agnostic.
 *
 * Production systems should always use database prompts.
 */

export const FALLBACK_PROMPTS = {
  system: `You are a helpful AI assistant specializing in personalized insights.`,

  step_insight: `Respond after the user answers a step. Keep it to 1–3 short paragraphs.
    Include one actionable nudge relevant to the step.`,

  followup: `Answer follow-ups concisely (2–3 paragraphs max).`,

  final_briefing: `Generate a comprehensive summary that synthesizes all insights.`
} as const;
```

#### Step 3: Update API Routes to Use PromptService

**Files to Modify:**
- `/src/app/api/products/step-insight/route.ts`
- `/src/app/api/products/followup-response/route.ts`
- `/src/app/api/products/final-briefing/route.ts`

**Example (step-insight):**

```typescript
import { PromptService } from '@/lib/ai/PromptService';

export async function POST(req: Request) {
  // ... existing code ...

  const promptService = new PromptService(supabaseAdmin);

  // Load prompt with clear hierarchy
  const promptData = await promptService.loadPrompt({
    productSlug: productSlug || 'quantum-initiation',
    scope: 'step_insight'
  });

  const basePrompt = promptData.prompt;

  // No more hardcoded fallbacks - handled by service
  const context = `
You are helping with ${productData.productName}. ${basePrompt}
Step ${stepNumber}: ${stepData?.title}
`;

  // ... rest of logic ...
}
```

**Benefits:**
- ✅ Single source of truth
- ✅ Clear fallback hierarchy
- ✅ Easy to track which source was used (logging)
- ✅ Centralized prompt loading logic

---

### Priority 2: Remove Product-Specific Hardcoding

**Goal:** Make all product configuration database-driven

**Implementation:**

#### Step 1: Add Brand Configuration to Database

**File:** `/database/migrations/009_add_brand_configuration.sql` (NEW)

```sql
-- Add brand configuration to product_definitions
ALTER TABLE product_definitions
  ADD COLUMN IF NOT EXISTS brand_persona TEXT DEFAULT 'AI Assistant',
  ADD COLUMN IF NOT EXISTS price_cents INT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Update quantum-initiation with current values
UPDATE product_definitions
SET
  brand_persona = 'QBF Wizard (Quantum Brand Architect)',
  price_cents = 70000,  -- $700
  currency = 'USD'
WHERE product_slug = 'quantum-initiation';
```

#### Step 2: Load Product Configuration in API Routes

**File:** `/src/lib/products/ProductConfigService.ts` (NEW)

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

interface ProductConfig {
  slug: string;
  name: string;
  brandPersona: string;
  priceCents: number;
  currency: string;
}

export class ProductConfigService {
  constructor(private supabase: SupabaseClient) {}

  async getConfig(productSlug: string): Promise<ProductConfig> {
    const { data, error } = await this.supabase
      .from('product_definitions')
      .select('product_slug, name, brand_persona, price_cents, currency')
      .eq('product_slug', productSlug)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Product config not found: ${productSlug}`);
    }

    return {
      slug: data.product_slug,
      name: data.name,
      brandPersona: data.brand_persona || 'AI Assistant',
      priceCents: data.price_cents || 0,
      currency: data.currency || 'USD'
    };
  }
}
```

#### Step 3: Use Dynamic Brand Persona in Prompts

**Update prompts to use placeholders:**

```sql
-- database/update-prompts-quantum-initiation.sql
UPDATE prompts
SET prompt = 'You are {{BRAND_PERSONA}}. Create a powerful blueprint...'
WHERE product_slug = 'quantum-initiation' AND scope = 'final_briefing';
```

**Replace placeholders at runtime:**

```typescript
// In API route
const productConfig = await productConfigService.getConfig(productSlug);
const promptData = await promptService.loadPrompt({ productSlug, scope: 'final_briefing' });

// Replace placeholders
const systemPrompt = promptData.prompt
  .replace('{{BRAND_PERSONA}}', productConfig.brandPersona)
  .replace('{{PRICE}}', `$${productConfig.priceCents / 100}`);
```

**Benefits:**
- ✅ No hardcoded product names
- ✅ No hardcoded prices
- ✅ Easy to add new products
- ✅ Can white-label without code changes

---

### Priority 3: Create AIRequestService

**Goal:** Centralize all OpenAI API calls with consistent error handling, logging, retries

**Implementation:**

**File:** `/src/lib/ai/AIRequestService.ts` (NEW)

```typescript
import OpenAI from 'openai';
import { DEFAULT_MODEL } from './models';

interface AIRequestOptions {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  retries?: number;
}

interface AIResponse {
  content: string;
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIRequestService {
  constructor(private openai: OpenAI) {}

  async chat(options: AIRequestOptions): Promise<AIResponse> {
    const {
      model = DEFAULT_MODEL,
      messages,
      maxTokens = 10000,
      temperature,
      retries = 2
    } = options;

    let attempt = 0;
    let lastError: any;

    while (attempt <= retries) {
      try {
        console.log(`[AIRequestService] Attempt ${attempt + 1}/${retries + 1} - Model: ${model}`);

        const params: any = {
          model,
          messages,
          max_completion_tokens: maxTokens
        };

        // Only add temperature if supported by model
        if (temperature !== undefined && !model.startsWith('gpt-5')) {
          params.temperature = temperature;
        }

        const completion = await this.openai.chat.completions.create(params);

        const content = completion.choices[0].message.content || '';
        const finishReason = completion.choices[0].finish_reason || '';

        console.log(`[AIRequestService] Success - Finish: ${finishReason}, Length: ${content.length}`);

        return {
          content,
          finishReason,
          usage: {
            promptTokens: completion.usage?.prompt_tokens || 0,
            completionTokens: completion.usage?.completion_tokens || 0,
            totalTokens: completion.usage?.total_tokens || 0
          }
        };
      } catch (err: any) {
        lastError = err;
        console.error(`[AIRequestService] Attempt ${attempt + 1} failed:`, err?.message);

        // Don't retry on 4xx errors (client errors)
        if (err?.status >= 400 && err?.status < 500) {
          break;
        }

        attempt++;
        if (attempt <= retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw new Error(`AI request failed after ${retries + 1} attempts: ${lastError?.message}`);
  }
}
```

**Update API Routes:**

```typescript
// src/app/api/products/step-insight/route.ts
import { AIRequestService } from '@/lib/ai/AIRequestService';

const aiService = new AIRequestService(openai);

const response = await aiService.chat({
  messages: [
    { role: 'system', content: systemPrompt },
    ...priorMessages,
    { role: 'user', content: sanitizedResponse }
  ],
  maxTokens: 10000
});

const content = response.content;
```

**Benefits:**
- ✅ Consistent error handling
- ✅ Automatic retries with backoff
- ✅ Centralized logging
- ✅ Usage tracking
- ✅ Model-specific parameter handling

---

### Priority 4: Add Database TypeScript Types

**Goal:** Type-safe database queries with autocomplete

**Implementation:**

**File:** `/src/types/database.ts` (NEW)

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  stripe_customer_id?: string;
  is_affiliate: boolean;
  affiliate_opted_out: boolean;
  first_affiliate_visit?: string;
  total_earnings_cents: number;
  available_balance_cents: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSession {
  id: string;
  user_id: string;
  product_slug: string;
  current_step: number;
  total_steps: number;
  placements?: Placements;
  deliverable?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Placements {
  astrology?: {
    sun?: string;
    moon?: string;
    rising?: string;
    mercury?: string;
    venus?: string;
    mars?: string;
    jupiter?: string;
    saturn?: string;
    uranus?: string;
    neptune?: string;
    pluto?: string;
    houses?: string;
  };
  human_design?: {
    type?: string;
    strategy?: string;
    authority?: string;
    profile?: string;
    centers?: string;
    gifts?: string;
  };
  notes?: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  step_number: number;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  type?: 'welcome' | 'step_insight' | 'followup_question' | 'followup_response' | 'final_briefing';
}

export interface ProductDefinition {
  id: string;
  product_slug: string;
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  stripe_price_id?: string;
  system_prompt?: string;
  brand_persona?: string;
  steps?: ProductStep[];
  created_at: string;
  updated_at: string;
}

export interface ProductStep {
  step: number;
  title: string;
  description?: string;
  question?: string;
  allow_file_upload?: boolean;
  file_upload_prompt?: string;
}

export interface Prompt {
  id: string;
  product_slug: string;
  scope: 'system' | 'step_insight' | 'followup' | 'final_briefing';
  step_number?: number;
  prompt: string;
  created_at: string;
}
```

**Update API Routes:**

```typescript
// Before (any types)
const conversations: any[] = data || [];
const userResponses = conversations.flatMap((c: any) => ...);

// After (typed)
import { Conversation, Message } from '@/types/database';

const conversations: Conversation[] = data || [];
const userResponses = conversations.flatMap((c) =>
  c.messages
    .filter((m): m is Message => m.role === 'user')
    .map((m) => `Step ${c.step_number}: ${m.content}`)
);
```

**Benefits:**
- ✅ IDE autocomplete
- ✅ Catch typos at compile time
- ✅ Self-documenting code
- ✅ Easier refactoring

---

### Priority 5: Extract PDF Generation Service

**Goal:** Reusable PDF generation for any deliverable

**Implementation:**

**File:** `/src/lib/pdf/PDFGeneratorService.ts` (NEW)

```typescript
import jsPDF from 'jspdf';

export interface PDFSection {
  number?: string;
  title: string;
  content: string;
}

export interface PDFOptions {
  title: string;
  sections: PDFSection[];
  filename?: string;
}

export class PDFGeneratorService {
  private readonly margin = 20;

  generate(options: PDFOptions): jsPDF {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (this.margin * 2);
    let y = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(options.title, this.margin, y);
    y += 15;

    // Sections
    for (const section of options.sections) {
      y = this.renderSection(pdf, section, y, maxWidth);
    }

    return pdf;
  }

  download(options: PDFOptions): void {
    const pdf = this.generate(options);
    const filename = options.filename || `${this.slugify(options.title)}.pdf`;
    pdf.save(filename);
  }

  private renderSection(pdf: jsPDF, section: PDFSection, startY: number, maxWidth: number): number {
    let y = startY;

    // Section header
    y += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);

    const headerText = section.number
      ? `${section.number}. ${section.title}`
      : section.title;

    const headerLines = pdf.splitTextToSize(headerText, maxWidth);
    pdf.text(headerLines, this.margin, y);
    y += headerLines.length * 7;

    // Section content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const contentLines = section.content.split('\n');
    for (const line of contentLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        y += 4;
        continue;
      }

      // Handle bold text
      const text = trimmedLine.replace(/\*\*/g, '');
      const isBold = trimmedLine.includes('**');
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

      const wrappedLines = pdf.splitTextToSize(text, maxWidth);

      // Add new page if needed
      if (y + (wrappedLines.length * 6) > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(wrappedLines, this.margin, y);
      y += wrappedLines.length * 6;
    }

    return y;
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}
```

**Update DeliverableView Component:**

```typescript
import { PDFGeneratorService } from '@/lib/pdf/PDFGeneratorService';

const handleDownload = () => {
  const pdfService = new PDFGeneratorService();

  pdfService.download({
    title: productName,
    sections: sections.map(s => ({
      number: s.number,
      title: s.title,
      content: s.content
    })),
    filename: `${productName.replace(/\s+/g, '-').toLowerCase()}-blueprint.pdf`
  });
};
```

**Benefits:**
- ✅ Reusable for multiple products
- ✅ Testable independently
- ✅ Can generate server-side if needed
- ✅ Component stays focused on UI

---

## 📊 Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Create TypeScript types (`/src/types/database.ts`)
2. ✅ Create PromptService (`/src/lib/ai/PromptService.ts`)
3. ✅ Create prompt fallbacks file (`/src/lib/ai/prompt-fallbacks.ts`)
4. ✅ Update one API route to use PromptService (test pattern)

### Phase 2: Centralization (Week 2)
1. ✅ Update all API routes to use PromptService
2. ✅ Create AIRequestService
3. ✅ Update all API routes to use AIRequestService
4. ✅ Add comprehensive logging

### Phase 3: Product Agnostic (Week 3)
1. ✅ Create database migration for brand configuration
2. ✅ Create ProductConfigService
3. ✅ Update prompts to use placeholders
4. ✅ Update API routes to use dynamic brand persona

### Phase 4: Reusability (Week 4)
1. ✅ Create PDFGeneratorService
2. ✅ Update DeliverableView to use service
3. ✅ Add tests for all services
4. ✅ Documentation updates

---

## ✅ Benefits Summary

### Modularity
- ✅ Separate services for prompts, AI requests, PDF generation
- ✅ Each service has single responsibility
- ✅ Easy to test in isolation

### Scalability
- ✅ Add new products without code changes
- ✅ Update prompts via database
- ✅ White-label support

### Maintainability
- ✅ Single source of truth for prompts
- ✅ Consistent error handling
- ✅ Type safety catches bugs early
- ✅ Clear architectural patterns

### Developer Experience
- ✅ IDE autocomplete
- ✅ Self-documenting types
- ✅ Easy to onboard new developers
- ✅ Faster development

---

## 🎯 Quick Wins (Can Implement Today)

### 1. Create Database Types File
- Copy interface definitions to `/src/types/database.ts`
- Replace `any` types in 3-4 files
- **Time:** 30 minutes
- **Impact:** High (catches bugs immediately)

### 2. Extract Prompt Fallbacks
- Create `/src/lib/ai/prompt-fallbacks.ts`
- Move hardcoded fallbacks from API routes
- **Time:** 15 minutes
- **Impact:** Medium (better organization)

### 3. Add Comprehensive Logging
- Add structured logs to AIRequestService pattern
- Track token usage, latency, errors
- **Time:** 30 minutes
- **Impact:** High (better debugging)

---

## 📚 Further Improvements (Future)

### Observability
- Add Sentry or LogRocket for error tracking
- Track AI request latency and costs
- Monitor token usage by product/user

### Performance
- Cache prompts in memory (refresh every 5 min)
- Batch database queries
- Add Redis for session data

### Testing
- Unit tests for all services
- Integration tests for API routes
- End-to-end tests for product experience

### Developer Tools
- Generate TypeScript types from Supabase schema automatically
- Add database migration scripts
- Create seeding scripts for local dev

---

## 🚀 Getting Started

To begin implementing these improvements:

1. **Start with types** - Create `/src/types/database.ts`
2. **Test the pattern** - Implement PromptService in one route
3. **Validate benefits** - Measure improvement in developer experience
4. **Roll out gradually** - Update remaining routes
5. **Monitor impact** - Track bugs, development speed, onboarding time

The goal is not to refactor everything at once, but to establish patterns that make future development easier and more reliable.
