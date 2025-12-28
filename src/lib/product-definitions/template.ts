/**
 * PRODUCT TEMPLATE - Copy this file to create new products
 *
 * Instructions:
 * 1. Copy this file to a new file named after your product (e.g., quantum-pricing.ts)
 * 2. Update all fields below
 * 3. Run: npm run generate-product-sql quantum-pricing
 * 4. Run the generated SQL file in Supabase
 * 5. Create Stripe payment link and update .env
 */

import { ProductDefinition } from './types';

export const productDefinition: ProductDefinition = {
  // PRODUCT METADATA
  product_slug: 'quantum-[slug]', // URL-friendly slug
  name: 'Quantum [Product Name]',
  description: '[1-2 paragraph description of the product transformation]',
  price: 7.00,
  total_steps: 7,
  estimated_duration: '15-30 minutes',
  model: 'gpt-4o', // or 'gpt-4-turbo', 'gpt-3.5-turbo'

  // CRM CONFIGURATION
  sheet_id: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
  from_email: 'austin@xuberandigital.com',
  from_name: 'Quantum Strategies',

  // SYSTEM PROMPT
  // This is the base personality/role for the AI across all steps
  system_prompt: `You are the Quantum [Role] AI (Sage–[Archetype]). You produce premium-grade [deliverable type] worth $700 of clarity.

YOUR ROLE:
- Synthesize astrology, Human Design, and [domain] strategy into actionable guidance
- Reference SPECIFIC details the user shared in their responses
- Create concrete, immediately usable recommendations
- Write in a premium, decisive tone with zero filler

CRITICAL RULES:
⚠️ DO NOT ask for more information or data
⚠️ DO NOT say anything is missing or unknown
⚠️ USE whatever data is provided to create insights
⚠️ If a piece of data is unavailable, work around it creatively or skip it
⚠️ Your job is to DELIVER the blueprint, not request more input

GROUNDING FRAMEWORK:
- Ground recommendations in Sun/Moon/Rising + money houses (2/8/10/11)
- Integrate HD type/strategy/authority
- Reference Mars/Venus/Mercury/Saturn/Pluto themes
- [Additional domain-specific framework]`,

  // FINAL DELIVERABLE PROMPT
  // This generates the final blueprint after all steps are complete
  final_deliverable_prompt: `Generate the Quantum [Product Name] Blueprint with these 7 sections:

1. **[Section 1 Name]** (1-2 sentences)
   - [What to include]
   - [Chart grounding]

2. **[Section 2 Name]**
   - [What to include]
   - [Chart grounding]

3. **[Section 3 Name]**
   - [What to include]
   - [Specifics required]

4. **[Section 4 Name]**
   - [What to include]
   - [Chart grounding]

5. **[Section 5 Name]**
   - [What to include]
   - [Goals alignment]

6. **[Section 6 Name]**
   - [What to include]
   - [Action steps format]

7. **[Section 7 Name]**
   - [What to include]
   - [Question format]

REQUIREMENTS:
- Write in concise prose, not bullet lists
- ~500-700 words total
- Make every line feel tailored to THEIR specific situation
- Use details from their conversation responses
- Premium, decisive tone - zero filler
- Immediately actionable
- [Domain-specific requirements]

Generate the blueprint now.`,

  // STEPS CONFIGURATION
  steps: [
    // STEP 1: Birth Details & Chart Upload
    {
      step: 1,
      title: 'Your Cosmic Blueprint',
      subtitle: 'Upload your astrological and Human Design charts so we can ground your [domain] strategy in your unique energetic signature.',
      question: `Please upload your birth chart files. We accept:
- Astrology charts (PDF or image from astro.com, astro-seek.com, etc.)
- Human Design charts (PDF or image from jovianarchive.com, mybodygraph.com, etc.)

You can upload multiple files if you have separate charts.`,
      prompt: `Thank you for uploading your chart! I'm analyzing your placements now. This will take just a moment...

(Note: The system will automatically extract placements using Vision API and show a confirmation screen before proceeding to Step 2)`,
      allow_file_upload: true,
      file_upload_prompt: 'Upload your astrology and Human Design chart files (PDF or image format)',
      required: true,
      max_follow_ups: 0,
    },

    // STEP 2
    {
      step: 2,
      title: '[Step 2 Title]',
      subtitle: '[Subtitle providing context]',
      question: '[Main question to ask the user - be specific and clear]',
      prompt: `[Prompt for AI to generate insight after user answers]

Instructions:
- Reference specific chart placements (Sun/Moon/Rising, money houses, HD type/strategy/authority)
- Keep response to 2-3 paragraphs
- Give ONE actionable nudge related to their chart
- If they mention specific goals/targets, acknowledge and align`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 3
    {
      step: 3,
      title: '[Step 3 Title]',
      subtitle: '[Subtitle]',
      question: '[Question]',
      prompt: `[Insight prompt with chart grounding]

Same format as Step 2 - concise, grounded in placements, one micro-action.`,
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 4
    {
      step: 4,
      title: '[Step 4 Title]',
      subtitle: '[Subtitle]',
      question: '[Question]',
      prompt: '[Insight prompt - same format as Step 2]',
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 5
    {
      step: 5,
      title: '[Step 5 Title]',
      subtitle: '[Subtitle]',
      question: '[Question]',
      prompt: '[Insight prompt - same format as Step 2]',
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 6
    {
      step: 6,
      title: '[Step 6 Title]',
      subtitle: '[Subtitle]',
      question: '[Question]',
      prompt: '[Insight prompt - same format as Step 2]',
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },

    // STEP 7
    {
      step: 7,
      title: '[Step 7 Title]',
      subtitle: '[Subtitle]',
      question: '[Question]',
      prompt: '[Insight prompt - same format as Step 2]',
      allow_file_upload: false,
      required: true,
      max_follow_ups: 3,
    },
  ],
};
