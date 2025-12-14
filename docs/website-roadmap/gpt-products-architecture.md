# AI/GPT Products System Architecture Plan

## Overview

Build a scalable GPT product system starting with Custom GPTs (quick win) and architecting for future OpenAI API integration with CRM and tooling.

**Current State:**
- ✅ Website infrastructure built for embedded GPT products
- ✅ Quantum Initiation Protocol GPT exists in OpenAI account
- ⏳ Quantum Structure, Profit & Scale GPT needs to be created
- ⏳ Integration with payment flow needed
- 🔮 Future: Custom UI via OpenAI API for CRM integration

---

## Phase 1: Quick Win - Link Existing GPT to Website

**Goal:** Get Quantum Initiation Protocol GPT working with the payment flow TODAY.

### Step 1.1: Get Your Custom GPT Link

**In OpenAI ChatGPT:**
1. Go to https://chatgpt.com/
2. Click your profile → "My GPTs"
3. Find "Quantum Initiation Protocol" GPT
4. Click the GPT name to open it
5. Copy the URL from browser address bar
   - Format: `https://chatgpt.com/g/g-XXXXXXXXXX-quantum-initiation-protocol`
   - The `g-XXXXXXXXXX` is your GPT ID

### Step 1.2: Update Website Environment Variables

**File to Edit:** `/Users/studio/Projects/luminary-studio-nextjs/.env`

Update line 16:
```bash
# Before
NEXT_PUBLIC_GPT_IFRAME_URL_QUANTUM=https://chatgpt.com/g/your-custom-gpt-id-here

# After (with your actual GPT URL)
NEXT_PUBLIC_GPT_IFRAME_URL_QUANTUM=https://chatgpt.com/g/g-XXXXXXXXXX-quantum-initiation-protocol
```

### Step 1.3: Configure Stripe Payment Link

**In Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/payment-links
2. Find your Quantum Initiation payment link
3. Click "Edit" → "After payment"
4. Set success URL to:
   ```
   https://yourdomain.com/products/quantum-initiation/interact?session_id={CHECKOUT_SESSION_ID}
   ```
5. Enable "Collect customer emails"
6. Save

### Step 1.4: Test the Flow

**Local Testing:**
```bash
npm run dev
```

1. Navigate to: `http://localhost:3000/products/quantum-initiation/interact?session_id=test123`
2. Should see: GPT iframe loads with your Custom GPT
3. ⚠️ Note: ChatGPT may show "Share your GPT" screen first - this is expected

### Step 1.5: Make GPT Publicly Accessible

**In OpenAI ChatGPT:**
1. Open your Quantum Initiation Protocol GPT
2. Click "Configure" or settings
3. Under "Sharing" or "Visibility":
   - Set to: **"Anyone with the link"**
4. Save

**Why:** This allows the iframe to load the GPT without requiring users to be logged into your specific OpenAI account.

---

## Phase 2: Build Second Custom GPT

**Goal:** Create Quantum Structure, Profit & Scale GPT based on detailed product requirements.

### Step 2.1: Create Custom GPT in OpenAI

**In OpenAI ChatGPT:**
1. Go to https://chatgpt.com/
2. Click "Explore GPTs" → "Create"
3. Use GPT Builder or "Configure" tab

### Step 2.2: GPT Configuration

**Name:**
```
Quantum Structure, Profit & Scale
```

**Description:**
```
Guided AI orientation tool for Quantum Network members. Helps clarify business structure, identify profit paths, and map disciplined expansion for multiple ideas. This is a clarity engine, not an execution engine.
```

**Instructions (System Prompt):**

```
# Role
You are the Quantum Structure, Profit & Scale orientation engine. Your purpose is to help Quantum Network members gain clarity on their business structure, profit paths, and expansion strategy. You orient, not optimize.

# Core Principles
1. Sequence Over Speed – Focus precedes scale
2. Contribution Before Opportunity – Value creates upside
3. One Anchor Before Many Ideas – Stability first
4. Ecosystem as Amplifier – Not dependency
5. Psychological Safety Without Permission to Drift

# Personality
- Grounded, calm, direct, non-hype
- Builder-oriented, respectful of ambition
- Ask clarifying questions before concluding
- Redirect gently but firmly when users overreach
- Normalize multi-idea thinking without enabling chaos
- Frame trade-offs explicitly
- Avoid absolute language

# What You Must NOT Do
- Provide legal, tax, or compliance advice
- Promise income or outcomes
- Reveal internal economic mechanics
- Provide tactical marketing strategies
- Define timelines, thresholds, or revenue splits
- Replace advisors, coaches, or operators

# Conversation Flow (Required Phases)

## Phase 1: Structural Grounding
Identify the user's current anchor business.

Ask about:
- Current revenue status
- Primary offer
- Target customer
- Type of work delivered

Output:
- Conceptual description of anchor business
- Identification of unnecessary complexity

## Phase 2: Offer & Positioning Clarity
Clarify why the business earns money.

Ask about:
- Core skills
- Paid-for outcomes
- Desired work direction

Output:
- Primary value lever
- Alignment or misalignment notes

## Phase 3: Quantum Profit Path Identification
Define how the user profits within the ecosystem.

Map user to one PRIMARY path:
- Core Business Amplification
- Project / Event Participation
- Service & Skill Leverage
- Deal Origination & Connection

Identify 1-2 SECONDARY paths (optional)
Explicitly state "Not yet" paths

## Phase 4: Ecosystem Interface Logic
Explain cause-and-effect economics:
- How visibility creates trust
- How trust creates opportunity
- How opportunity converts to income

No tactics. No instructions to pitch.

## Phase 5: Idea Inventory & Scale Readiness
Preserve vision while enforcing discipline.

Ask for list of additional ideas and motivations.

Classify each idea as:
- Adjacent Expansion
- Project-Based Experiment
- Future Venture (Not Yet)
- Distraction / Misalignment

## Phase 6: Structural Expansion Logic
Teach sequencing.

Determine:
- Which ideas stay inside anchor
- Which remain projects
- Which require future separation

Conceptual only. No legal entities.

## Phase 7: Final Output — Quantum Scale Map
Generate structured summary:

1. Anchor Business Definition
2. Primary Offer & Customer
3. Primary Quantum Profit Path
4. Secondary Income Pathways
5. Parked Ideas & Classifications
6. Expansion Order (Conceptual)
7. Ecosystem Leverage Points
8. Focus vs Deprioritize Guidance

Make it concise, readable, and reusable.

# Edge Cases

**If User Has No Revenue Yet:**
- Focus on anchor offer definition
- Identify fastest path to proof
- Deprioritize expansion discussion

**If User Has Many Active Businesses:**
- Force anchor selection
- Classify others as projects or future ventures

**If User Seeks Guaranteed Income:**
- Reframe expectations
- Redirect to contribution logic

# Success Metric
Users should leave more focused, more grounded, and better aligned — not more excited.

Clarity is the value. Sequence is the product. The ecosystem does the rest.
```

**Conversation Starters:**
```
1. "Help me clarify my business structure"
2. "I have multiple ideas and need to prioritize"
3. "Show me my Quantum profit path"
4. "Map my expansion strategy"
```

**Knowledge Base:**
- Upload any Quantum Business Framework documents you have
- Upload Quantum Network economic model documentation (if available)
- Upload case studies or examples (optional)

**Capabilities:**
- ✅ Web Browsing: OFF (focus on framework, not external research)
- ✅ DALL-E Image Generation: OFF (text-only orientation)
- ✅ Code Interpreter: OFF (not needed for this use case)

### Step 2.3: Test the GPT

**Test Scenarios:**

1. **No Revenue User:**
   - "I'm a coach with no clients yet and want to join Quantum Network"
   - Should focus on anchor offer, not expansion

2. **Multi-Business User:**
   - "I run 3 businesses: a consulting firm, a podcast, and a course platform"
   - Should force anchor selection

3. **Confused About Profit:**
   - "How do I make money in the Quantum Network?"
   - Should explain paths without promising outcomes

### Step 2.4: Refine Based on Testing

Iterate on the instructions based on:
- Does it stay grounded? (not overhyping)
- Does it enforce sequencing? (one anchor first)
- Does it classify ideas correctly?
- Is the final output useful and concise?

---

## Phase 3: Integrate Second GPT into Website

**Goal:** Add Quantum Structure, Profit & Scale product to website.

### Step 3.1: Update Products Configuration

**File to Edit:** `/src/lib/constants/products.ts`

Add second product:
```typescript
export const PRODUCTS: Record<string, ProductConfig> = {
  'quantum-initiation': {
    slug: 'quantum-initiation',
    name: 'Quantum Initiation Protocol',
    price: 7,
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM || '',
    gptIframeUrl: process.env.NEXT_PUBLIC_GPT_IFRAME_URL_QUANTUM || '',
    interactTitle: 'Build Your Quantum Blueprint',
    interactInstructions: 'Answer the questions below to generate your personalized brand strategy mapped to your Astrology and Human Design. This is a conversational process—be honest and thorough for the best results.',
    estimatedDuration: '10-15 minutes',
    requiresChatGPTPlus: true,
  },

  // NEW PRODUCT
  'quantum-structure-profit-scale': {
    slug: 'quantum-structure-profit-scale',
    name: 'Quantum Structure, Profit & Scale',
    price: 14,
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STRUCTURE || '',
    gptIframeUrl: process.env.NEXT_PUBLIC_GPT_IFRAME_URL_STRUCTURE || '',
    interactTitle: 'Map Your Quantum Scale Strategy',
    interactInstructions: 'This guided orientation will help you clarify your business structure, identify your profit paths within the Quantum Network, and map a disciplined expansion strategy. Answer thoughtfully—this builds your strategic foundation.',
    estimatedDuration: '20-30 minutes',
    requiresChatGPTPlus: true,
  },
};
```

### Step 3.2: Add Environment Variables

**File to Edit:** `.env`

Add:
```bash
# Quantum Structure, Profit & Scale
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STRUCTURE=https://buy.stripe.com/YOUR_LINK_HERE
NEXT_PUBLIC_GPT_IFRAME_URL_STRUCTURE=https://chatgpt.com/g/g-XXXXXXXXXX-quantum-structure-profit-scale
```

### Step 3.3: Create Product Pages

**Create Directory:**
```bash
mkdir -p src/app/\(content\)/products/quantum-structure-profit-scale/interact
```

**Create Sales Page:**
`/src/app/(content)/products/quantum-structure-profit-scale/page.tsx`
- Copy from `/products/quantum-initiation/page.tsx`
- Update product details (price $14, features, etc.)

**Create Interact Page:**
`/src/app/(content)/products/quantum-structure-profit-scale/interact/page.tsx`
```typescript
import { Metadata } from "next";
import ProductInteractHeader from "@/components/products/ProductInteractHeader";
import GPTChatEmbed from "@/components/products/GPTChatEmbed";
import InteractHero from "@/components/products/InteractHero";
import { PRODUCTS } from "@/lib/constants/products";
import { notFound } from "next/navigation";
import styles from "./interact.module.css";

export const metadata: Metadata = {
  title: "Map Your Quantum Scale Strategy - Quantum Structure, Profit & Scale",
  description: "Guided AI orientation to clarify your business structure and profit paths",
  robots: "noindex, nofollow",
};

export default function QuantumStructureInteractPage() {
  const product = PRODUCTS['quantum-structure-profit-scale'];

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <ProductInteractHeader productName={product.name} />

      <InteractHero
        title={product.interactTitle}
        instructions={product.interactInstructions}
        duration={product.estimatedDuration}
      />

      <GPTChatEmbed
        iframeUrl={product.gptIframeUrl}
        productSlug={product.slug}
      />
    </div>
  );
}
```

**Create CSS:**
`/src/app/(content)/products/quantum-structure-profit-scale/interact/interact.module.css`
```css
.page {
  min-height: 100vh;
  background: #030048;
  color: #F8F5FF;
  display: flex;
  flex-direction: column;
}
```

### Step 3.4: Create Stripe Payment Link

**In Stripe Dashboard:**
1. Create new Payment Link
2. Product: Quantum Structure, Profit & Scale
3. Price: $14 one-time
4. Success URL: `https://yourdomain.com/products/quantum-structure-profit-scale/interact?session_id={CHECKOUT_SESSION_ID}`
5. Enable "Collect customer emails"

---

## Phase 4: Current Limitations & Workarounds

### Limitation 1: ChatGPT iframe Restrictions

**Problem:** ChatGPT may not allow embedding in iframes due to X-Frame-Options security headers.

**Workaround Options:**

**Option A: Direct Link (Recommended for Now)**
- Instead of iframe, redirect users to ChatGPT directly
- Simpler, fewer technical issues
- Users interact on chatgpt.com

**Implementation:**
Update `GPTChatEmbed.tsx` to offer both options:
```typescript
// Add a "Launch GPT" button instead of iframe
<a
  href={iframeUrl}
  target="_blank"
  className={styles.launchButton}
>
  Launch Your GPT Session
</a>
```

**Option B: Use OpenAI API (Future)**
- Build custom chat UI
- Full control, no iframe issues
- Requires backend, API costs
- See Phase 5

### Limitation 2: No Session Persistence

**Problem:** ChatGPT conversations aren't connected to your website or CRM.

**Current State:**
- Each user's GPT session is isolated
- No way to see what users discussed
- No integration with email/CRM

**Workaround:**
- Ask GPT to end each session with: "Email this summary to yourself"
- User manually copies/pastes summary
- Not ideal, but works for MVP

**Future Solution:** Phase 5 (OpenAI API)

### Limitation 3: ChatGPT Plus Requirement

**Problem:** Users MUST have ChatGPT Plus ($20/mo) to access Custom GPTs.

**Current Approach:**
- Clearly state requirement on product pages
- Include in FAQ
- Price products accordingly ($7 and $14 are lower to account for this)

**Future Solution:** Phase 5 (OpenAI API) removes this requirement

---

## Phase 5: Future Architecture - OpenAI API Integration

**Goal:** Migrate to custom UI with OpenAI API for full CRM integration and control.

### Why Migrate to API?

**Benefits:**
- ✅ No ChatGPT Plus requirement for users
- ✅ Full control over UI/UX
- ✅ Session persistence and chat history
- ✅ CRM integration (save conversations, trigger workflows)
- ✅ Custom analytics and tracking
- ✅ Multi-modal capabilities (voice, images, documents)
- ✅ Embed anywhere (mobile app, Slack, email, etc.)

**Tradeoffs:**
- ❌ More development work
- ❌ API costs (pay per token)
- ❌ Backend infrastructure required
- ❌ Maintenance and monitoring

### Architecture Overview

```
User Payment (Stripe)
  ↓
Website (/products/{slug}/interact)
  ↓
Custom Chat UI (React Component)
  ↓
Backend API Route (Next.js API or Netlify Function)
  ↓
OpenAI API (GPT-4 with custom instructions)
  ↓
Database (Save chat history, user data)
  ↓
CRM Integration (Zapier, Make, or direct API)
```

### Technical Components Needed

#### 5.1: Backend API Layer

**Option A: Netlify Functions** (Recommended for current stack)
- Static site compatible
- Serverless
- Easy to deploy
- Limited to 10-second execution (can be extended)

**File Structure:**
```
netlify/functions/
├── chat-completions.ts       # OpenAI API proxy
├── save-conversation.ts       # Save to database
└── send-to-crm.ts            # CRM integration
```

**Option B: Next.js API Routes**
- Requires switching from static export to serverless
- More flexible
- Better for complex logic

#### 5.2: Custom Chat UI Component

**New Component:** `/src/components/products/OpenAIChatWidget.tsx`

```typescript
"use client";
import { useState } from "react";
import styles from "./openai-chat-widget.module.css";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface OpenAIChatWidgetProps {
  productSlug: string;
  systemPrompt: string;
  userId?: string;
}

export default function OpenAIChatWidget({
  productSlug,
  systemPrompt,
  userId
}: OpenAIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt,
          productSlug,
          userId,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={styles[msg.role]}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Thinking...</div>}
      </div>

      <div className={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

#### 5.3: OpenAI API Integration

**Netlify Function:** `/netlify/functions/chat-completions.ts`

```typescript
import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages, systemPrompt, productSlug, userId } = JSON.parse(event.body || '{}');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message.content;

    // TODO: Save conversation to database
    // TODO: Send to CRM if needed

    return {
      statusCode: 200,
      body: JSON.stringify({ message: assistantMessage }),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response' }),
    };
  }
};
```

#### 5.4: Database Schema (Supabase)

**Table: `gpt_conversations`**
```sql
CREATE TABLE gpt_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  product_slug TEXT NOT NULL,
  session_id TEXT,
  messages JSONB NOT NULL,
  final_output TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `gpt_messages`**
```sql
CREATE TABLE gpt_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES gpt_conversations(id),
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.5: CRM Integration Points

**Trigger Points:**
1. **After Payment:** Send customer email + product purchased
2. **During Conversation:** Track engagement, message count
3. **On Completion:** Send final GPT output summary
4. **On Abandonment:** If user doesn't complete, trigger follow-up

**Integration Options:**

**Option A: Zapier/Make**
- Webhook from Netlify Function
- Send to ActiveCampaign, HubSpot, etc.
- Easiest to set up

**Option B: Direct API**
- Custom integration with your CRM
- More control, more work

**Example Webhook:**
```typescript
// In chat-completions.ts
if (isConversationComplete(messages)) {
  await fetch(process.env.ZAPIER_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      email: userEmail,
      product: productSlug,
      summary: finalOutput,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

#### 5.6: System Prompts Management

**Update Products Config:**

```typescript
export interface ProductConfig {
  // ... existing fields

  // For API-based GPTs
  systemPrompt?: string;
  gptModel?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  conversationStarters?: string[];
}
```

Store full system prompts in separate files:
```
/src/lib/prompts/
├── quantum-initiation.ts
└── quantum-structure.ts
```

### Cost Estimation (OpenAI API)

**GPT-4 Pricing (as of 2024):**
- Input: $0.03 per 1K tokens (~750 words)
- Output: $0.06 per 1K tokens

**Example Session:**
- User sends 50 messages
- Average 100 tokens per message (user + assistant)
- Total: ~5,000 tokens
- Cost: $0.15 - $0.30 per session

**For 100 users/month:**
- Cost: $15 - $30/month
- Revenue (at $14/user): $1,400
- Margin: 98%+ after API costs

**Much cheaper than ChatGPT Plus requirement ($20/mo per user).**

### Migration Strategy & Backend Evolution

**Phased Backend Approach:**

**Stage 1: Netlify Functions (MVP)**
- Static site compatible
- Quick deployment
- Serverless, no infrastructure management
- Start with simple API proxy for OpenAI
- Perfect for validating product-market fit

**Stage 2: Hybrid (Growth)**
- Keep static pages for SEO performance
- Add Next.js API Routes for complex logic
- Begin CRM integration
- Scale as traffic grows

**Stage 3: Full Next.js with Agentified CRM (Scale)**
- Switch from static export to serverless
- Full API Routes for all backend logic
- AI agents manage entire customer journey
- Centralized automation terminal

**Product Migration:**

**Phase 5A: Hybrid Approach**
1. Keep Custom GPTs for existing products (Quantum Initiation, Quantum Structure)
2. Launch NEW products with API-based chat
3. Test, iterate, optimize
4. Gradually migrate existing products

**Phase 5B: Full Migration**
1. Build custom UI for all products
2. Migrate existing customers
3. Sunset Custom GPT links
4. Full agentified CRM integration

---

## Phase 6: Advanced Features & Automation

### 6.1: Multi-Session Products (CORE WORKFLOW)

**Vision:** Advanced products follow automated multi-session workflow.

**Example Flow:**
- **Session 1:** Initial assessment (free or low-cost)
  - User completes orientation GPT
  - System analyzes responses
  - Creates customer profile in CRM
  - Unlocks Session 2

- **Session 2:** Deep dive (mid-tier product)
  - User purchases next tier
  - GPT references Session 1 data
  - Generates detailed strategy
  - Updates CRM pipeline stage

- **Session 3:** Implementation planning (premium tier)
  - Unlocked after Session 2 completion
  - Personalized roadmap
  - Action items added to CRM
  - Triggers follow-up automation

**Database Schema:**
```sql
-- Multi-session tracking
ALTER TABLE gpt_conversations
ADD COLUMN session_number INTEGER DEFAULT 1,
ADD COLUMN total_sessions INTEGER,
ADD COLUMN prerequisite_session_id UUID REFERENCES gpt_conversations(id),
ADD COLUMN unlocks_next_session BOOLEAN DEFAULT FALSE;

-- Product progression
CREATE TABLE product_progression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  current_product_slug TEXT,
  completed_products TEXT[], -- Array of completed product slugs
  unlocked_products TEXT[], -- Array of unlocked product slugs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Automated Workflow:**
```typescript
// When user completes Session 1
async function onSessionComplete(conversationId: string) {
  const conversation = await getConversation(conversationId);

  // 1. Mark session complete
  await markSessionComplete(conversationId);

  // 2. Update CRM pipeline
  await updateCRMPipeline({
    email: conversation.userEmail,
    stage: 'session_1_complete',
    data: conversation.finalOutput
  });

  // 3. Unlock next session/product
  await unlockProduct({
    userId: conversation.userId,
    productSlug: 'quantum-structure-profit-scale-deep-dive'
  });

  // 4. Send email with next steps
  await sendEmail({
    to: conversation.userEmail,
    template: 'session_complete_next_steps',
    data: {
      completedSession: 1,
      nextProduct: 'Deep Dive Strategy Session',
      unlockLink: '/products/quantum-structure-deep-dive'
    }
  });
}
```

### 6.2: Centralized Automation Terminal & Digital ERP System

**FULL VISION:** Complete digital ERP system for product-led growth with AI automation.

**System Components:**

1. **Marketing Engine** (Product, Price, Place, Promote, Track)
   - A/B testing automation
   - Landing page optimization
   - Conversion tracking
   - Continuous experimentation

2. **Sales CRM** (Relationship-Driven)
   - Gather marketing insights from customer interactions
   - Connect people to people (ecosystem building)
   - Establish deeper alignment (not just transactions)
   - Relationship intelligence

3. **ERP** (Enterprise Resource Planning)
   - Track impact and outcomes
   - Document customer journey
   - Offer insights to maximize enterprise value
   - Resource optimization

**Centralized Terminal Vision:**

Website has a "terminal" interface where you can command AI agents to orchestrate the entire business system.

**Example Command:**
```bash
> create-product quantum-clarity-intensive \
  --price 97 \
  --sessions 3 \
  --system-prompt ./prompts/clarity-intensive.md \
  --landing-page-template premium \
  --crm-pipeline clarity-intensive-funnel
```

**What This Creates:**
1. ✅ Product config in `/src/lib/constants/products.ts`
2. ✅ Landing page at `/products/quantum-clarity-intensive/page.tsx`
3. ✅ Interact pages for all 3 sessions
4. ✅ Stripe payment links (via API)
5. ✅ CRM pipeline stages
6. ✅ Email automation sequences
7. ✅ Database tables and relationships

**Architecture:**

```
Website Terminal (CLI Interface)
  ↓
Automation Agent (Claude/GPT-4)
  ↓
├─ Code Generation Agent
│   ├─ Creates product config
│   ├─ Generates landing page
│   ├─ Creates interact pages
│   └─ Writes system prompts
│
├─ Stripe Agent
│   ├─ Creates products in Stripe
│   ├─ Generates payment links
│   └─ Configures webhooks
│
├─ CRM Agent
│   ├─ Creates pipeline stages
│   ├─ Sets up automation rules
│   ├─ Configures email sequences
│   └─ Defines customer journey
│
└─ Database Agent
    ├─ Runs migrations
    ├─ Creates tables
    └─ Seeds initial data
```

**Terminal Interface Component:**

```typescript
// /src/components/admin/AutomationTerminal.tsx
"use client";

import { useState } from 'react';

export default function AutomationTerminal() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const executeCommand = async () => {
    setIsProcessing(true);
    setOutput(prev => [...prev, `$ ${command}`]);

    try {
      const response = await fetch('/api/automation/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const result = await response.json();

      // Stream agent progress
      for (const step of result.steps) {
        setOutput(prev => [...prev, `✓ ${step.message}`]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setOutput(prev => [...prev, `\n✅ ${result.summary}\n`]);
    } catch (error) {
      setOutput(prev => [...prev, `❌ Error: ${error.message}\n`]);
    } finally {
      setIsProcessing(false);
      setCommand('');
    }
  };

  return (
    <div className="terminal">
      <div className="output">
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div className="input-line">
        <span className="prompt">quantum $</span>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
          disabled={isProcessing}
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
}
```

**Available Commands:**

```bash
# Product creation
create-product <slug> --price <amount> --sessions <number>

# Landing page generation
generate-landing <product-slug> --template <name>

# CRM setup
setup-crm-pipeline <name> --stages <number>

# Test complete flow
test-flow <product-slug> --email <test-email>

# Analytics
show-stats <product-slug> --period <days>

# Deploy
deploy-product <slug> --environment <prod|staging>
```

### 6.3: Agentified CRM Architecture

**Vision:** AI agents handle the entire customer journey with minimal human intervention.

**Agent Roles:**

**1. Onboarding Agent**
- Analyzes new customer purchases
- Extracts insights from GPT conversations
- Creates rich customer profiles
- Assigns to appropriate pipeline

**2. Engagement Agent**
- Monitors conversation completion rates
- Triggers follow-up when users abandon
- Sends personalized re-engagement emails
- A/B tests messaging

**3. Upsell Agent**
- Identifies customers ready for next tier
- Analyzes conversation patterns
- Recommends personalized product bundles
- Generates custom offers

**4. Support Agent**
- Monitors for confusion or frustration signals
- Proactively offers help
- Escalates complex issues to human
- Learns from resolution patterns

**5. Retention Agent**
- Tracks usage patterns
- Predicts churn risk
- Implements win-back campaigns
- Manages subscription renewals

**CRM Data Model:**

```sql
-- Core customer profile
CREATE TABLE crm_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,

  -- GPT-derived insights
  business_type TEXT, -- Extracted from conversations
  revenue_stage TEXT, -- no-revenue, early, growth, scale
  primary_challenge TEXT,
  goals JSONB,

  -- Engagement scoring
  engagement_score INTEGER DEFAULT 0,
  last_interaction TIMESTAMP,
  total_sessions INTEGER DEFAULT 0,

  -- Journey tracking
  current_pipeline TEXT,
  current_stage TEXT,
  lifecycle_stage TEXT, -- lead, customer, advocate, churned

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pipeline stages
CREATE TABLE crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER,

  -- AI automation
  entry_conditions JSONB, -- Rules for auto-advancing
  exit_conditions JSONB,
  automation_rules JSONB, -- What agents should do in this stage

  created_at TIMESTAMP DEFAULT NOW()
);

-- Agent actions log
CREATE TABLE crm_agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type TEXT NOT NULL, -- onboarding, engagement, upsell, etc.
  customer_id UUID REFERENCES crm_customers(id),
  action_type TEXT, -- email_sent, stage_change, offer_created, etc.
  action_data JSONB,
  outcome TEXT, -- success, pending, failed

  created_at TIMESTAMP DEFAULT NOW()
);
```

**Agent Execution Flow:**

```typescript
// Triggered after every GPT session completion
async function runCRMAgents(customerId: string, conversationId: string) {
  const conversation = await getConversation(conversationId);
  const customer = await getCustomer(customerId);

  // 1. Onboarding Agent: Extract insights
  const insights = await extractInsights(conversation.messages);
  await updateCustomerProfile(customerId, insights);

  // 2. Engagement Agent: Check completion
  if (!conversation.isComplete && timeSinceLastMessage > 24_HOURS) {
    await engagementAgent.sendFollowUp(customer);
  }

  // 3. Upsell Agent: Check readiness
  if (shouldOfferUpsell(customer, conversation)) {
    const offer = await upsellAgent.createOffer(customer);
    await sendEmail(customer.email, offer);
  }

  // 4. Update pipeline stage
  const nextStage = await determineNextStage(customer, conversation);
  await advanceCustomer(customerId, nextStage);

  // 5. Log all actions
  await logAgentActions(customerId, {
    onboarding: insights,
    engagement: engagementAction,
    upsell: offer,
    stage: nextStage
  });
}
```

**Example Agent Workflow:**

```
New Purchase ($7 Quantum Initiation)
  ↓
Onboarding Agent:
  - Creates customer profile
  - Analyzes payment data
  - Sets pipeline: "quantum-initiation-funnel"
  - Stage: "purchased"
  ↓
Customer Completes GPT Session
  ↓
Onboarding Agent:
  - Extracts business type: "coaching"
  - Identifies challenge: "positioning clarity"
  - Updates engagement score: +20
  - Advances stage: "completed_session"
  ↓
Upsell Agent (triggered 24 hours later):
  - Analyzes conversation insights
  - Matches to: Quantum Structure, Profit & Scale ($14)
  - Creates personalized email:
    "Based on your coaching business and clarity needs,
     the Structure GPT will help you map your expansion..."
  - Sends offer email
  - Logs action in CRM
  ↓
Customer Purchases Second Product
  ↓
Onboarding Agent:
  - Updates customer tier: "multi-product"
  - Increases engagement score: +30
  - Moves to: "quantum-ecosystem-engaged"
  ↓
Retention Agent (ongoing):
  - Monitors usage every 7 days
  - If no activity: sends value reminder
  - If high activity: offers premium tier
```

### 6.4: Voice Interface

OpenAI API supports voice:
- Text-to-speech output
- Speech-to-text input
- Natural conversation flow

### 6.3: Document Upload

Allow users to upload:
- Business plans
- Financial statements
- Previous assessments

GPT analyzes and references in conversation.

### 6.4: Team Access

Enterprise tier:
- Multiple users per purchase
- Shared conversations
- Team admin dashboard

---

## Implementation Priorities

### Priority 1: DONE ✅
- [x] Website infrastructure
- [x] Payment flow
- [x] Interact pages

### Priority 2: THIS WEEK 🎯
- [ ] Link Quantum Initiation GPT to website (30 min)
- [ ] Configure Stripe redirect (15 min)
- [ ] Test end-to-end flow (30 min)

### Priority 3: NEXT WEEK 🚀
- [ ] Build Quantum Structure GPT (2-3 hours)
- [ ] Create product sales page (2 hours)
- [ ] Add to website config (30 min)
- [ ] Create second Stripe payment link (15 min)
- [ ] Test second product flow (30 min)

### Priority 4: MONTH 2-3 🔮
- [ ] Evaluate Custom GPT limitations
- [ ] Research OpenAI API costs
- [ ] Build proof-of-concept API chat UI
- [ ] Test CRM integration
- [ ] Make migration decision

---

## Quick Reference Checklist

### For Each New GPT Product:

**OpenAI Side:**
- [ ] Create Custom GPT with system prompt
- [ ] Set visibility to "Anyone with link"
- [ ] Test conversation flow
- [ ] Copy GPT URL

**Website Side:**
- [ ] Add product config to `/src/lib/constants/products.ts`
- [ ] Add env vars (payment link + GPT URL)
- [ ] Create product sales page
- [ ] Create interact page
- [ ] Copy CSS files
- [ ] Build and test locally

**Stripe Side:**
- [ ] Create payment link
- [ ] Set price
- [ ] Configure success URL
- [ ] Enable email collection
- [ ] Test payment flow

**Testing:**
- [ ] Payment redirects correctly
- [ ] GPT loads in iframe (or opens in new tab)
- [ ] Session tracking works
- [ ] Mobile responsive
- [ ] All edge cases handled

---

## Success Metrics

**Quick Win (Week 1):**
- Quantum Initiation GPT accessible after payment
- End-to-end flow works
- First test purchase successful

**Short Term (Month 1):**
- Both GPT products live
- 10+ successful purchases
- User feedback collected
- Conversion rate baseline established

**Long Term (Month 3):**
- Decision made on API migration
- CRM integration plan validated
- Product roadmap for 3-5 more GPT products
- Infrastructure scales smoothly

---

## Next Steps - START HERE

1. **Open your OpenAI ChatGPT account**
   - Find Quantum Initiation GPT
   - Copy the URL

2. **Update `.env` file**
   - Replace placeholder with real GPT URL

3. **Test locally**
   - `npm run dev`
   - Visit interact page with test session_id

4. **Configure Stripe**
   - Set success URL
   - Test purchase flow

5. **Go live** 🚀

Then move to building the second GPT.
