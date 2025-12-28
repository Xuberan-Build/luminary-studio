# Google Docs Product Template Guide

This document describes the exact structure for creating GPT product templates in Google Docs. The system will parse this structure and automatically create the product in Supabase.

---

## 📋 **How to Use This Template**

1. **Create a new Google Doc** in your Product Development folder
2. **Share it** with your service account: `quantum-drive-assist@quantum-gpt-assistant.iam.gserviceaccount.com` (Editor access)
3. **Follow the structure below** exactly (headings, formatting, etc.)
4. **Run sync command** to import into Supabase: `npm run sync-product [docId]`

---

## 📐 **Template Structure**

Copy this structure into your Google Doc:

---

# [PRODUCT NAME]

*Example: Quantum Pricing Mastery*

---

## Product Metadata

**Product Slug:** quantum-pricing-mastery
**Display Name:** Quantum Pricing Mastery
**Price:** $7
**Estimated Duration:** 15-30 minutes
**Total Steps:** 7
**OpenAI Model:** gpt-4o

**Description:**
A comprehensive blueprint for pricing your offers using astrology and Human Design to unlock your true value and attract aligned clients at premium rates.

**Landing Page Hero:**
Discover your cosmic pricing blueprint. Ground your value in your unique astrological and Human Design signatures. Stop undercharging. Start attracting aligned clients who pay premium rates.

**Features:**
- Personalized pricing strategy based on your chart
- Energy type-specific sales approach
- Money house activation guidance
- Premium positioning framework
- 30-day implementation plan

**FAQ:**
Q: Do I need my birth chart?
A: Yes, we'll extract your placements from uploaded chart files in Step 1.

Q: How long does this take?
A: 15-30 minutes to complete, instant blueprint delivery.

---

## System Prompt

You are the Quantum Pricing Architect AI (Sage–Strategist). You produce premium-grade pricing blueprints worth $700 of clarity.

**YOUR ROLE:**
- Synthesize astrology, Human Design, and pricing strategy into actionable guidance
- Reference SPECIFIC details the user shared in their responses
- Create concrete, immediately usable pricing recommendations
- Write in a premium, decisive tone with zero filler

**CRITICAL RULES:**
⚠️ DO NOT ask for more information or data
⚠️ DO NOT say anything is missing or unknown
⚠️ USE whatever data is provided to create insights
⚠️ If a piece of data is unavailable, work around it creatively or skip it
⚠️ Your job is to DELIVER the blueprint, not request more input

**GROUNDING FRAMEWORK:**
- Ground recommendations in Sun/Moon/Rising + money houses (2/8/10/11)
- Integrate HD type/strategy/authority for sales approach
- Reference Mars (action), Venus (value), Mercury (communication)
- Use Saturn (structure), Pluto (power) for premium positioning

---

## Step 1: Birth Details & Chart Upload

**Step Title:** Your Cosmic Blueprint
**Step Subtitle:** Upload your astrological and Human Design charts so we can ground your pricing strategy in your unique energetic signature.

**Main Question:**
Please upload your birth chart files. We accept:
- Astrology charts (PDF or image from astro.com, astro-seek.com, etc.)
- Human Design charts (PDF or image from jovianarchive.com, mybodygraph.com, etc.)

You can upload multiple files if you have separate charts.

**Settings:**
- Allow File Upload: YES
- File Upload Prompt: "Upload your astrology and Human Design chart files (PDF or image format)"
- Required: YES
- Max Follow-ups: 0

**Assistant Response Prompt:**
Thank you for uploading your chart! I'm analyzing your placements now. This will take just a moment...

(Note: The system will automatically extract placements using Vision API and show a confirmation screen before proceeding to Step 2)

---

## Step 2: Current Pricing Reality

**Step Title:** Current Pricing Reality
**Step Subtitle:** Let's understand where you are now with your pricing and what's holding you back.

**Main Question:**
What are you currently charging for your main offer (or planning to charge if you're just starting)? What feels challenging or unclear about your pricing right now?

**Settings:**
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

**Assistant Response Prompt (step_insight):**
Reflect on their pricing reality using:
- Money houses (2nd = personal value, 8th = others' resources, 10th = public recognition, 11th = community/networks)
- Sun/Moon/Rising for identity themes
- Venus for value perception
- Saturn for where they might be playing small or over-structuring

Keep response to 2-3 paragraphs. Give ONE actionable nudge related to their chart.

If they mention specific revenue goals or price ranges, acknowledge and align your insight to that target.

**Follow-up Response Prompt:**
Answer follow-ups concisely (2-3 paragraphs max). Use placements (money houses, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn). If key data is missing (e.g., 2nd-house ruler/location), ask briefly and give one micro-action anyway. If the user mentions revenue/price goals, align your micro-action to that target.

---

## Step 3: Value & Transformation

**Step Title:** Your Transformation Signature
**Step Subtitle:** Clarify the unique transformation you deliver so we can price it accurately.

**Main Question:**
What transformation do you deliver for your clients? What results do they get when they work with you? Be as specific as possible.

**Settings:**
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

**Assistant Response Prompt (step_insight):**
Connect their transformation to:
- Sun sign gifts (core essence)
- 10th house themes (what they're known for publicly)
- HD type/strategy (how they naturally deliver transformation)
- Venus (what they find valuable and how they create value)

Reflect back the premium nature of their transformation. Keep to 2-3 paragraphs with ONE actionable nudge.

**Follow-up Response Prompt:**
Same as Step 2 (concise, grounded in placements, one micro-action).

---

## Step 4: Ideal Client Avatar

**Step Title:** Your Ideal Client
**Step Subtitle:** Who are you designed to serve at premium rates?

**Main Question:**
Describe your ideal client. Who are they? What challenges do they face? What are they willing to invest in? What level of transformation are they seeking?

**Settings:**
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

**Assistant Response Prompt (step_insight):**
Analyze their ideal client through:
- 7th house (who they naturally attract)
- 11th house (their community/network alignment)
- HD authority (how they recognize aligned clients)
- Mercury (communication style that attracts ideal clients)

Show how their chart suggests premium positioning. Keep to 2-3 paragraphs with ONE actionable nudge.

**Follow-up Response Prompt:**
Same as Step 2.

---

## Step 5: Competitive Landscape

**Step Title:** Market Positioning
**Step Subtitle:** Understand where you fit in the market and how to stand out.

**Main Question:**
What are others in your space charging for similar transformations? Where do you want to position yourself (premium, mid-tier, accessible)? What makes your approach unique?

**Settings:**
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

**Assistant Response Prompt (step_insight):**
Ground competitive analysis in:
- 10th house (public positioning, career identity)
- Saturn (authority, premium structure)
- Pluto (power, transformation depth)
- HD profile (role/differentiation)

Recommend positioning based on their chart's premium indicators. Keep to 2-3 paragraphs with ONE actionable nudge.

**Follow-up Response Prompt:**
Same as Step 2.

---

## Step 6: Energy & Capacity

**Step Title:** Your Energy Blueprint
**Step Subtitle:** Price in alignment with your energetic capacity and desired lifestyle.

**Main Question:**
How many clients can you realistically serve per month while maintaining quality and your own wellbeing? What's your desired monthly revenue? What lifestyle are you designing for?

**Settings:**
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

**Assistant Response Prompt (step_insight):**
Calculate capacity and pricing recommendations using:
- HD type/strategy (Generator = high capacity, Projector = limited invitations, etc.)
- HD authority (decision-making pace)
- 6th house (daily work, health, sustainability)
- Mars (energy levels, action capacity)

Give concrete math: If they want $X/month and can serve Y clients, they need to charge $Z minimum. Keep to 2-3 paragraphs with ONE actionable nudge.

**Follow-up Response Prompt:**
Same as Step 2.

---

## Step 7: Revenue Goals & Timeline

**Step Title:** Your Revenue Vision
**Step Subtitle:** Set your pricing to achieve your specific financial goals.

**Main Question:**
What's your revenue goal for the next 3 months? 6 months? 12 months? What would achieving these goals mean for you and your life?

**Settings:**
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

**Assistant Response Prompt (step_insight):**
Create revenue pathway using:
- Money houses (2/8/10/11) for income streams
- Jupiter (expansion opportunities)
- North Node (growth direction)
- HD centers (defined centers = consistent energy, undefined = variable)

Give specific pricing recommendations and offer structures to hit their goals. Keep to 2-3 paragraphs with ONE actionable nudge.

**Follow-up Response Prompt:**
Same as Step 2.

---

## Final Deliverable Prompt

Generate the Quantum Pricing Blueprint with these 7 sections:

**1. Your Pricing Essence** (1-2 sentences)
- Ground in Sun/Moon/Rising + money houses (2/8/10/11)
- Integrate HD type/strategy/authority
- Include standout Mars/Venus/Mercury/Saturn themes

**2. Your Value Signature**
- What you should be known for
- The transformation you reliably deliver
- Based on chart themes + what they shared

**3. Recommended Price Points**
- Specific pricing for their main offer
- Tiered pricing structure if applicable
- Include price range and format (sessions, packages, memberships)
- Align with chart themes and capacity

**4. Positioning Strategy**
- How to present and market at this price point
- Voice/visibility channels (Rising + Mercury/Venus + HD strategy)
- What NOT to do based on chart

**5. Revenue Model**
- Path to their stated revenue goals
- 90-day revenue experiment with numeric targets
- Aligned to money houses and capacity

**6. Implementation Plan**
- 5-7 crisp do-now actions for next 30 days
- Cover: pricing decision, offer packaging, positioning, launch
- No "consider" - only concrete steps
- Tied to what they actually shared

**7. Pricing Power Questions**
- 3 sharp questions they must answer to maintain premium positioning
- Specific to their business situation

**REQUIREMENTS:**
- Write in concise prose, not bullet lists
- ~500-700 words total
- Make every line feel tailored to THEIR specific situation
- Use details from their conversation responses
- Premium, decisive tone - zero filler
- Immediately actionable
- Include specific price recommendations with reasoning

Generate the blueprint now.

---

## Stripe Configuration

**Payment Link:** (Leave blank, will be auto-generated)
**Success URL:** https://yourdomain.com/products/quantum-pricing-mastery/interact?session_id={CHECKOUT_SESSION_ID}
**Product ID in Stripe:** (Leave blank, will be auto-generated)

---

## CRM Configuration

**Google Sheet ID:** 1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE
**Sheet Tab Name:** Purchases
**From Email:** austin@xuberandigital.com
**From Name:** Quantum Strategies

---

## Navigation Setup

**Show in Main Nav:** YES
**Nav Label:** Pricing Mastery
**Nav Order:** 2
**Parent Category:** Products

---

## Status

**Status:** DRAFT
**Created By:** [Your Name]
**Created Date:** [Date]
**Last Updated:** [Date]
**Approved By:** (Leave blank until approved)
**Approval Date:** (Leave blank until approved)

---

## Notes / Change Log

[Add any notes, ideas, or changes here during the development process]

---

# END OF TEMPLATE

