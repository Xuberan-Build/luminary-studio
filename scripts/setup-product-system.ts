/**
 * Setup Product Development System
 * Creates folder structure and template document in Google Drive
 */

import { GoogleDocsService } from '../src/lib/services/GoogleDocsService';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!;
const KEY_FILE_PATH = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH || '.secrets/quantum-gpt-assistant-b176e8b31832.json';
const PRODUCT_FOLDER_ID = process.env.GOOGLE_PRODUCT_FOLDER_ID!;
const OWNER_EMAIL = process.env.GOOGLE_DOCS_OWNER_EMAIL || 'santos.93.aus@gmail.com'; // Your email

// Load private key from file
let PRIVATE_KEY: string;
try {
  const keyFileContent = fs.readFileSync(path.join(process.cwd(), KEY_FILE_PATH), 'utf8');
  const keyData = JSON.parse(keyFileContent);
  PRIVATE_KEY = keyData.private_key;
  console.log('✓ Loaded private key from file\n');
} catch (error: any) {
  console.error('❌ Failed to load service account key:', error.message);
  console.error(`   Make sure the file exists at: ${KEY_FILE_PATH}\n`);
  process.exit(1);
}

// Template content for the product doc
const TEMPLATE_CONTENT = `QUANTUM [PRODUCT NAME] - PRODUCT TEMPLATE

=======================================
PRODUCT METADATA
=======================================

Product Slug: quantum-[slug]
Display Name: Quantum [Product Name]
Price: $7
Estimated Duration: 15-30 minutes
Total Steps: 7
OpenAI Model: gpt-4o

Description:
[1-2 paragraph description of the product transformation]

Landing Page Hero:
[Compelling 1-2 sentence hook for the landing page]

Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

FAQ:
Q: [Question 1]
A: [Answer 1]

Q: [Question 2]
A: [Answer 2]

=======================================
SYSTEM PROMPT
=======================================

You are the Quantum [Role] AI (Sage–[Archetype]). You produce premium-grade [deliverable type] worth $700 of clarity.

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
- [Additional domain-specific framework]

=======================================
STEP 1: BIRTH DETAILS & CHART UPLOAD
=======================================

Step Title: Your Cosmic Blueprint
Step Subtitle: Upload your astrological and Human Design charts so we can ground your [domain] strategy in your unique energetic signature.

Main Question:
Please upload your birth chart files. We accept:
- Astrology charts (PDF or image from astro.com, astro-seek.com, etc.)
- Human Design charts (PDF or image from jovianarchive.com, mybodygraph.com, etc.)

You can upload multiple files if you have separate charts.

Settings:
- Allow File Upload: YES
- File Upload Prompt: Upload your astrology and Human Design chart files (PDF or image format)
- Required: YES
- Max Follow-ups: 0

Assistant Response Prompt (step_insight):
Thank you for uploading your chart! I'm analyzing your placements now. This will take just a moment...

(Note: The system will automatically extract placements using Vision API and show a confirmation screen before proceeding to Step 2)

Follow-up Response Prompt:
[Not applicable for Step 1 - no follow-ups allowed]

---

=======================================
STEP 2: [STEP TITLE]
=======================================

Step Title: [Title]
Step Subtitle: [Subtitle providing context]

Main Question:
[Main question to ask the user - be specific and clear]

Settings:
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

Assistant Response Prompt (step_insight):
[Prompt for AI to generate insight after user answers]

Instructions:
- Reference specific chart placements (Sun/Moon/Rising, money houses, HD type/strategy/authority)
- Keep response to 2-3 paragraphs
- Give ONE actionable nudge related to their chart
- If they mention specific goals/targets, acknowledge and align

Follow-up Response Prompt:
Answer follow-ups concisely (2-3 paragraphs max). Use placements (money houses 2/8/10/11, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority). If key data is missing, ask briefly and give one micro-action anyway. If the user mentions specific goals, align your micro-action to that target.

---

=======================================
STEP 3: [STEP TITLE]
=======================================

Step Title: [Title]
Step Subtitle: [Subtitle]

Main Question:
[Question]

Settings:
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

Assistant Response Prompt (step_insight):
[Insight prompt with chart grounding]

Follow-up Response Prompt:
Same as Step 2 (concise, grounded in placements, one micro-action).

---

=======================================
STEP 4: [STEP TITLE]
=======================================

Step Title: [Title]
Step Subtitle: [Subtitle]

Main Question:
[Question]

Settings:
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

Assistant Response Prompt (step_insight):
[Insight prompt]

Follow-up Response Prompt:
Same as Step 2.

---

=======================================
STEP 5: [STEP TITLE]
=======================================

Step Title: [Title]
Step Subtitle: [Subtitle]

Main Question:
[Question]

Settings:
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

Assistant Response Prompt (step_insight):
[Insight prompt]

Follow-up Response Prompt:
Same as Step 2.

---

=======================================
STEP 6: [STEP TITLE]
=======================================

Step Title: [Title]
Step Subtitle: [Subtitle]

Main Question:
[Question]

Settings:
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

Assistant Response Prompt (step_insight):
[Insight prompt]

Follow-up Response Prompt:
Same as Step 2.

---

=======================================
STEP 7: [STEP TITLE]
=======================================

Step Title: [Title]
Step Subtitle: [Subtitle]

Main Question:
[Question]

Settings:
- Allow File Upload: NO
- Required: YES
- Max Follow-ups: 3

Assistant Response Prompt (step_insight):
[Insight prompt]

Follow-up Response Prompt:
Same as Step 2.

---

=======================================
FINAL DELIVERABLE PROMPT
=======================================

Generate the Quantum [Product Name] Blueprint with these 7 sections:

1. [Section 1 Name] (1-2 sentences)
   - [What to include]
   - [Chart grounding]

2. [Section 2 Name]
   - [What to include]
   - [Chart grounding]

3. [Section 3 Name]
   - [What to include]
   - [Specifics required]

4. [Section 4 Name]
   - [What to include]
   - [Chart grounding]

5. [Section 5 Name]
   - [What to include]
   - [Goals alignment]

6. [Section 6 Name]
   - [What to include]
   - [Action steps format]

7. [Section 7 Name]
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

Generate the blueprint now.

=======================================
STRIPE CONFIGURATION
=======================================

Payment Link: [Auto-generated]
Success URL: https://quantumstrategies.online/products/[slug]/interact?session_id={CHECKOUT_SESSION_ID}
Product ID in Stripe: [Auto-generated]

=======================================
CRM CONFIGURATION
=======================================

Google Sheet ID: 1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE
Sheet Tab Name: Purchases
From Email: austin@xuberandigital.com
From Name: Quantum Strategies

=======================================
NAVIGATION SETUP
=======================================

Show in Main Nav: YES
Nav Label: [Short Label]
Nav Order: [Number]
Parent Category: Products

=======================================
STATUS
=======================================

Status: DRAFT
Created By: [Name]
Created Date: [Date]
Last Updated: [Date]
Approved By: [Leave blank]
Approval Date: [Leave blank]

=======================================
NOTES / CHANGE LOG
=======================================

[Add development notes here]

=======================================
END OF TEMPLATE
=======================================
`;

async function setupProductSystem() {
  console.log('🚀 Setting up Product Development System...\n');

  try {
    // Initialize Google Docs service
    const docsService = new GoogleDocsService({
      clientEmail: SERVICE_ACCOUNT_EMAIL,
      privateKey: PRIVATE_KEY,
    });

    console.log('✓ Authenticated with Google API\n');

    // Step 1: Create folder structure
    console.log('📁 Creating folder structure...');

    const archiveFolderId = await docsService.createFolder('Archive', PRODUCT_FOLDER_ID);
    console.log(`✓ Created Archive folder: ${archiveFolderId}`);

    const draftsFolderId = await docsService.createFolder('Drafts', PRODUCT_FOLDER_ID);
    console.log(`✓ Created Drafts folder: ${draftsFolderId}`);

    const approvedFolderId = await docsService.createFolder('Approved', PRODUCT_FOLDER_ID);
    console.log(`✓ Created Approved folder: ${approvedFolderId}\n`);

    // Step 2: Create template document
    console.log('📄 Creating product template document...');

    const templateDocId = await docsService.createDocument(
      'PRODUCT TEMPLATE - MASTER COPY',
      PRODUCT_FOLDER_ID,
      OWNER_EMAIL // Transfer ownership to user (uses their storage quota)
    );
    console.log(`✓ Created template document: ${templateDocId}`);

    // Step 3: Insert template content
    console.log('✍️  Inserting template content...');
    await docsService.insertContent(templateDocId, TEMPLATE_CONTENT);
    console.log(`✓ Template content added\n`);

    // Step 4: Share with service account (if needed)
    console.log('🔐 Configuring permissions...');
    await docsService.shareDocument(templateDocId, SERVICE_ACCOUNT_EMAIL, 'writer');
    console.log(`✓ Shared template with service account\n`);

    // Step 5: Create example product document
    console.log('📝 Creating example product (Quantum Pricing Mastery)...');

    const exampleDocId = await docsService.createDocument(
      'Quantum Pricing Mastery - Product Template (DRAFT)',
      draftsFolderId,
      OWNER_EMAIL // Transfer ownership to user
    );
    console.log(`✓ Created example document: ${exampleDocId}`);

    const exampleContent = TEMPLATE_CONTENT
      .replace(/\[PRODUCT NAME\]/g, 'Pricing Mastery')
      .replace(/\[slug\]/g, 'pricing-mastery')
      .replace(/\[Product Name\]/g, 'Pricing Mastery')
      .replace(/\[Role\]/g, 'Pricing Architect')
      .replace(/\[Archetype\]/g, 'Strategist')
      .replace(/\[deliverable type\]/g, 'pricing blueprints')
      .replace(/\[domain\]/g, 'pricing');

    await docsService.insertContent(exampleDocId, exampleContent);
    await docsService.shareDocument(exampleDocId, SERVICE_ACCOUNT_EMAIL, 'writer');
    console.log(`✓ Example content added and shared\n`);

    // Output summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📋 FOLDER STRUCTURE:');
    console.log(`   Product Development Folder: ${PRODUCT_FOLDER_ID}`);
    console.log(`   ├── Archive: ${archiveFolderId}`);
    console.log(`   ├── Drafts: ${draftsFolderId}`);
    console.log(`   └── Approved: ${approvedFolderId}\n`);

    console.log('📄 DOCUMENTS CREATED:');
    console.log(`   Master Template: ${templateDocId}`);
    console.log(`   Example Product: ${exampleDocId}\n`);

    console.log('🔗 LINKS:');
    console.log(`   Template Doc: https://docs.google.com/document/d/${templateDocId}/edit`);
    console.log(`   Example Doc: https://docs.google.com/document/d/${exampleDocId}/edit\n`);

    console.log('⚙️  ADD TO .env.local:');
    console.log(`   GOOGLE_PRODUCT_TEMPLATE_DOC_ID=${templateDocId}\n`);

    console.log('📖 NEXT STEPS:');
    console.log('   1. Visit the template doc and review the structure');
    console.log('   2. Add GOOGLE_PRODUCT_TEMPLATE_DOC_ID to your .env.local');
    console.log('   3. Test reading the example doc: npm run test-doc-parse');
    console.log('   4. Build the sync command: npm run sync-product [docId]\n');

    // Save IDs to a config file for reference
    const config = {
      productFolderId: PRODUCT_FOLDER_ID,
      archiveFolderId,
      draftsFolderId,
      approvedFolderId,
      templateDocId,
      exampleDocId,
      setupDate: new Date().toISOString(),
    };

    const configPath = path.join(process.cwd(), '.product-system-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`💾 Configuration saved to: .product-system-config.json\n`);

  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  • Ensure Google Docs API is enabled in your project');
    console.error('  • Verify service account credentials are correct');
    console.error('  • Check that GOOGLE_PRODUCT_FOLDER_ID exists and is accessible\n');
    process.exit(1);
  }
}

// Run setup
setupProductSystem();
