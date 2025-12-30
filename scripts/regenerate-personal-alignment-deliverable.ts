#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const productSlug = 'personal-alignment';
const userEmail = 'santos.93.aus@gmail.com';

async function regenerateDeliverable() {
  console.log('\n🔄 Regenerating Personal Alignment Deliverable\n');
  console.log('='.repeat(60));

  // Get user
  const { data: authUser } = await supabase.auth.admin.listUsers();
  const user = authUser?.users.find(u => u.email === userEmail);

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }

  console.log(`✅ User ID: ${user.id}`);

  // Get session
  const { data: session } = await supabase
    .from('product_sessions')
    .select('id, placements')
    .eq('user_id', user.id)
    .eq('product_slug', productSlug)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    console.error('❌ No session found');
    process.exit(1);
  }

  console.log(`✅ Session ID: ${session.id}`);

  // Get product definition
  const { data: product } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', productSlug)
    .single();

  if (!product) {
    console.error('❌ Product not found');
    process.exit(1);
  }

  console.log(`✅ Product: ${product.name}`);

  // Get conversation history
  const { data: conversations } = await supabase
    .from('conversations')
    .select('step_number, messages, created_at')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true });

  console.log(`✅ Found ${conversations?.length || 0} conversation records`);

  // Extract user responses
  const userResponses = (conversations || [])
    .flatMap((c: any) =>
      ((c.messages as any[]) || [])
        .filter((m: any) => m.role === 'user')
        .map((m: any) => `Step ${c.step_number}: ${m.content}`)
    )
    .join('\n\n');

  // Extract wizard insights
  const wizardNudges = (conversations || [])
    .flatMap((c: any) =>
      ((c.messages as any[]) || [])
        .filter((m: any) => m.role === 'assistant' && m.type === 'step_insight')
        .map((m: any) => `Step ${c.step_number} Insight: ${m.content}`)
    )
    .join('\n\n');

  console.log(`✅ User responses: ${userResponses ? userResponses.length : 0} characters`);
  console.log(`✅ Wizard insights: ${wizardNudges ? wizardNudges.length : 0} characters`);

  // Build placement summary
  const astro = session.placements?.astrology || {};
  const hd = session.placements?.human_design || {};
  const notes = session.placements?.notes || '';

  const astroFields = [];
  if (astro.sun) astroFields.push(`Sun: ${astro.sun}`);
  if (astro.moon) astroFields.push(`Moon: ${astro.moon}`);
  if (astro.rising) astroFields.push(`Rising: ${astro.rising}`);
  if (astro.mercury) astroFields.push(`Mercury: ${astro.mercury}`);
  if (astro.venus) astroFields.push(`Venus: ${astro.venus}`);
  if (astro.mars) astroFields.push(`Mars: ${astro.mars}`);
  if (astro.jupiter) astroFields.push(`Jupiter: ${astro.jupiter}`);
  if (astro.saturn) astroFields.push(`Saturn: ${astro.saturn}`);
  if (astro.uranus) astroFields.push(`Uranus: ${astro.uranus}`);
  if (astro.neptune) astroFields.push(`Neptune: ${astro.neptune}`);
  if (astro.pluto) astroFields.push(`Pluto: ${astro.pluto}`);
  if (astro.houses) astroFields.push(`Houses: ${astro.houses}`);

  const hdFields = [];
  if (hd.type) hdFields.push(`Type: ${hd.type}`);
  if (hd.strategy) hdFields.push(`Strategy: ${hd.strategy}`);
  if (hd.authority) hdFields.push(`Authority: ${hd.authority}`);
  if (hd.profile) hdFields.push(`Profile: ${hd.profile}`);
  if (hd.centers) hdFields.push(`Centers: ${hd.centers}`);
  if (hd.gifts) hdFields.push(`Gifts: ${hd.gifts}`);

  let placementSummary = '';
  if (astroFields.length > 0) {
    placementSummary += 'ASTROLOGY:\n' + astroFields.join('\n') + '\n\n';
  }
  if (hdFields.length > 0) {
    placementSummary += 'HUMAN DESIGN:\n' + hdFields.join('\n') + '\n\n';
  }
  if (notes) {
    placementSummary += `ADDITIONAL CHART NOTES:\n${notes}\n`;
  }

  console.log('\n📊 Placements Summary:');
  console.log(placementSummary || 'No placements data');

  // Build messages for OpenAI
  const chartDataMessage = `MY CHART DATA:

${placementSummary}

${placementSummary ? 'Use this chart data to inform your analysis.' : 'Limited chart data available - focus on conversation insights.'}`;

  const conversationMessage = `MY COMPLETE RESPONSES ACROSS ALL STEPS:

${userResponses || 'No detailed responses provided.'}

${wizardNudges ? `\n\nPERSONAL ALIGNMENT GUIDE'S ACTIONABLE NUDGES (synthesize these into the final deliverable):\n\n${wizardNudges}` : ''}

Reference specific details I shared in my responses. IMPORTANT: Synthesize the PERSONAL ALIGNMENT GUIDE's actionable nudges into concrete next steps.`;

  const instructionMessage = product.final_deliverable_prompt || `Generate my Personal Alignment Blueprint.`;

  console.log('\n🤖 Calling OpenAI to generate deliverable...');

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: product.system_prompt },
      { role: 'user', content: chartDataMessage },
      { role: 'user', content: conversationMessage },
      { role: 'user', content: instructionMessage },
    ],
    temperature: 0.7,
    max_tokens: 15000,
  });

  const deliverable = completion.choices[0].message.content;

  console.log('\n✅ Deliverable generated!');
  console.log(`Length: ${deliverable?.length || 0} characters`);
  console.log(`Tokens used: ${completion.usage?.total_tokens || 0}`);

  // Save to database
  console.log('\n💾 Saving to database...');

  await supabase
    .from('product_sessions')
    .update({
      deliverable,
      completed_at: new Date().toISOString(),
      current_step: 999, // Move to completion step
    })
    .eq('id', session.id);

  // Also log to conversations
  await supabase
    .from('conversations')
    .upsert(
      {
        session_id: session.id,
        step_number: 999,
        messages: [
          {
            role: 'assistant',
            content: deliverable,
            created_at: new Date().toISOString(),
            type: 'final_briefing',
          },
        ],
      },
      { onConflict: 'session_id,step_number' }
    );

  console.log('✅ Deliverable saved!');

  console.log('\n📝 Preview (first 500 chars):');
  console.log('='.repeat(60));
  console.log(deliverable?.substring(0, 500) + '...');
  console.log('='.repeat(60));

  console.log('\n🎯 Next Steps:');
  console.log('1. Refresh your browser');
  console.log('2. Navigate to /products/personal-alignment/experience');
  console.log('3. You should see the deliverable with the correct Personal Alignment content!');
  console.log('');
}

regenerateDeliverable();
