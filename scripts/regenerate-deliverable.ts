#!/usr/bin/env tsx

/**
 * Regenerate Deliverable from Existing Session Data
 * Recovers lost deliverables by re-running AI with saved conversations + placements
 * Usage: npm run regenerate-deliverable -- <session-id>
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('❌ Missing required credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('❌ Usage: npm run regenerate-deliverable -- <session-id>');
  console.error('Example: npm run regenerate-deliverable -- 578eab72-4d6e-4cd0-b5e5-ce11afdaf2ab');
  process.exit(1);
}

async function regenerateDeliverable() {
  console.log(`\n🔄 Regenerating deliverable for session: ${sessionId}\n`);
  console.log('='.repeat(60));

  // 1. Get session data
  const { data: session, error: sessionError } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    console.error('❌ Session not found');
    process.exit(1);
  }

  console.log('\n📋 Session Info:');
  console.log(`Product: ${session.product_slug}`);
  console.log(`Steps Completed: ${session.current_step}/${session.total_steps}`);

  // 2. Get product definition
  const { data: product } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', session.product_slug)
    .single();

  if (!product) {
    console.error('❌ Product definition not found');
    process.exit(1);
  }

  // 3. Get conversation history
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('step_number');

  if (!conversations || conversations.length === 0) {
    console.error('❌ No conversation history found - cannot regenerate');
    process.exit(1);
  }

  console.log(`\n💬 Found ${conversations.length} conversation records`);

  // 4. Build context from placements
  let placementContext = '';
  if (session.placements) {
    const astro = session.placements.astrology || {};
    const hd = session.placements.human_design || {};

    placementContext = `
User's Astrological Placements:
- Sun: ${astro.sun || 'UNKNOWN'}
- Moon: ${astro.moon || 'UNKNOWN'}
- Rising: ${astro.rising || 'UNKNOWN'}
- Venus: ${astro.venus || 'UNKNOWN'}
- Mars: ${astro.mars || 'UNKNOWN'}

User's Human Design:
- Type: ${hd.type || 'UNKNOWN'}
- Strategy: ${hd.strategy || 'UNKNOWN'}
- Authority: ${hd.authority || 'UNKNOWN'}
- Profile: ${hd.profile || 'UNKNOWN'}
`.trim();
    console.log('\n✅ Placements loaded');
  } else {
    console.warn('\n⚠️  No placements found - deliverable may be less accurate');
  }

  // 5. Build conversation summary
  let conversationSummary = '\n\nConversation History:\n';
  for (const convo of conversations) {
    const messages = convo.messages || [];
    const stepTitle = product.steps[convo.step_number - 1]?.title || `Step ${convo.step_number}`;

    conversationSummary += `\n--- ${stepTitle} ---\n`;

    // Get user's main responses (not follow-ups)
    const userResponses = messages.filter((m: any) => m.role === 'user');
    if (userResponses.length > 0) {
      conversationSummary += userResponses.map((m: any, i: number) =>
        `${i + 1}. ${m.content}`
      ).join('\n');
    }
  }

  console.log('✅ Conversation history processed');

  // 6. Get deliverable prompt
  const deliverablePrompt = product.deliverable_prompt || 'Create a comprehensive deliverable based on the user\'s responses.';

  console.log('\n🤖 Calling AI to regenerate deliverable...\n');

  // 7. Call OpenAI
  const systemPrompt = `${deliverablePrompt}

${placementContext}

${conversationSummary}

Generate the final deliverable in markdown format. Be comprehensive, personalized, and actionable.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Please generate my final deliverable based on all my responses and chart placements.'
        }
      ],
      temperature: 0.7,
      max_tokens: 16000,
    });

    const deliverableContent = completion.choices[0]?.message?.content;

    if (!deliverableContent) {
      console.error('❌ AI failed to generate deliverable');
      process.exit(1);
    }

    console.log('✅ Deliverable generated successfully!');
    console.log(`Length: ${deliverableContent.length} characters\n`);

    // 8. Save to database
    const { error: updateError } = await supabase
      .from('product_sessions')
      .update({
        deliverable_content: deliverableContent,
        deliverable_generated_at: new Date().toISOString(),
        is_complete: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('❌ Failed to save deliverable:', updateError.message);
      console.log('\n📄 Generated Content:\n');
      console.log(deliverableContent);
      process.exit(1);
    }

    console.log('✅ Deliverable saved to database!');
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Regeneration Complete!\n');
    console.log('You can now view your deliverable in the product dashboard.');
    console.log('\n');

  } catch (error: any) {
    console.error('❌ Error calling AI:', error.message);
    process.exit(1);
  }
}

regenerateDeliverable();
