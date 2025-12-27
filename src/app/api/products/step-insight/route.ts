import { NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateUserInput, validateSessionOwnership } from '@/lib/security/input-validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      stepNumber,
      stepData,
      mainResponse,
      placements,
      systemPrompt,
      productName,
      priorMessages = [],
      productSlug = 'quantum-initiation',
      sessionId,
      userId,
    } = body || {};

    // Rate limiting check
    const rateLimitKey = sessionId || 'anonymous';
    const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 30, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before making more requests.' },
        { status: 429 }
      );
    }

    // Validate session ownership if sessionId provided
    if (sessionId && userId) {
      const isOwner = await validateSessionOwnership(sessionId, userId, supabaseAdmin);
      if (!isOwner) {
        return NextResponse.json({ error: 'Unauthorized access to session' }, { status: 403 });
      }
    }

    // Validate and sanitize user input
    const inputValidation = validateUserInput(mainResponse || '', { maxLength: 3000 });
    if (!inputValidation.isValid) {
      console.warn('[step-insight] Input validation warnings:', inputValidation.warnings);
    }
    const sanitizedResponse = inputValidation.sanitized;

    const astro = placements?.astrology || {};
    const hd = placements?.human_design || {};
    const moneyHouses = ['2nd', '8th', '10th', '11th'];

    console.log('[step-insight] Placements from Supabase:', placements ? 'Present' : 'MISSING');
    console.log('[step-insight] Astrology data:', Object.keys(astro).length, 'fields');
    console.log('[step-insight] HD data:', Object.keys(hd).length, 'fields');

    const placementSummary = `
Astrology: Sun ${astro.sun || 'UNKNOWN'}, Moon ${astro.moon || 'UNKNOWN'}, Rising ${astro.rising || 'UNKNOWN'}, Houses ${astro.houses || 'UNKNOWN'} (if 2nd house is empty, note its sign/ruler), Mercury ${astro.mercury || 'UNKNOWN'}, Venus ${astro.venus || 'UNKNOWN'}, Mars ${astro.mars || 'UNKNOWN'}, Jupiter ${astro.jupiter || 'UNKNOWN'}, Saturn ${astro.saturn || 'UNKNOWN'}, Uranus ${astro.uranus || 'UNKNOWN'}, Neptune ${astro.neptune || 'UNKNOWN'}, Pluto ${astro.pluto || 'UNKNOWN'}
Human Design: Type ${hd.type || 'UNKNOWN'}, Strategy ${hd.strategy || 'UNKNOWN'}, Authority ${hd.authority || 'UNKNOWN'}, Profile ${hd.profile || 'UNKNOWN'}, Centers ${hd.centers || 'UNKNOWN'}, Gifts ${hd.gifts || 'UNKNOWN'}
`.trim();

    // Try to load a DB prompt override
    let dbPrompt = '';
    try {
      const { data } = await supabaseAdmin
        .from('prompts')
        .select('prompt')
        .eq('product_slug', productSlug || 'quantum-initiation')
        .eq('scope', 'step_insight')
        .maybeSingle();
      if (data?.prompt) dbPrompt = data.prompt;
    } catch (e) {
      // ignore and fall back
    }

    const basePrompt =
      dbPrompt ||
      `Respond after the user answers a step. Keep it to 1–3 short paragraphs. Ground in placements (money/identity houses 2/8/10/11, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority/centers/gifts). If 2nd-house ruler/location is unknown, ask for it and still give the best next move. Include one actionable nudge relevant to the step. If the user hinted at revenue goals, acknowledge and align the nudge to that goal.`;

    const context = `
You are the Quantum Brand Architect AI (Sage–Magician). ${basePrompt}

Step ${stepNumber}: ${stepData?.title || ''}
Question: ${stepData?.question || 'N/A'}
User response: ${mainResponse || 'N/A'}
Placements:
${placementSummary}
Product: ${productName || 'Quantum Initiation'}
`.trim();

    // Build conversation history (optional)
    const messages = [
      ...priorMessages,
      { role: 'user', content: sanitizedResponse || '' },
    ];

    let content = '';
    try {
      console.log('[step-insight] Using model:', DEFAULT_MODEL);
      console.log('[step-insight] System prompt length:', (systemPrompt || '').length);
      console.log('[step-insight] Context preview:', context.slice(0, 200));
      console.log('[step-insight] Messages count:', messages.length);
      console.log('[step-insight] User message content:', sanitizedResponse?.slice(0, 100));

      const aiResponse = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: `${systemPrompt || ''}\n\n${context}` },
          ...messages,
        ],
        max_completion_tokens: 10000, // High limit for GPT-5 reasoning models (includes thinking + output tokens)
      });

      console.log('[step-insight] OpenAI response received');
      console.log('[step-insight] Choices:', aiResponse.choices?.length);
      console.log('[step-insight] Finish reason:', aiResponse.choices[0]?.finish_reason);
      console.log('[step-insight] Refusal:', aiResponse.choices[0]?.message?.refusal);
      console.log('[step-insight] Content:', aiResponse.choices[0]?.message?.content?.slice(0, 100));

      content = aiResponse.choices[0].message.content || '';

      if (!content) {
        console.error('[step-insight] WARNING: Empty content from OpenAI!');
        console.error('[step-insight] Full response:', JSON.stringify(aiResponse.choices[0], null, 2));
      }
    } catch (err: any) {
      console.error('[step-insight] OpenAI error:', err?.message || err);
      console.error('[step-insight] Error details:', JSON.stringify(err, null, 2));
      return NextResponse.json({ error: 'AI generation failed', detail: err?.message || err }, { status: 500 });
    }

    // Log AI response to conversations (append to messages array)
    try {
      if (body?.sessionId) {
        const { data: convo } = await supabaseAdmin
          .from('conversations')
          .select('messages')
          .eq('session_id', body.sessionId)
          .eq('step_number', stepNumber)
          .maybeSingle();
        const existing = (convo?.messages as any[]) || [];
        const updated = [
          ...existing,
          { role: 'assistant', content, created_at: new Date().toISOString(), type: 'step_insight' },
        ];
        await supabaseAdmin
          .from('conversations')
          .upsert(
            { session_id: body.sessionId, step_number: stepNumber, messages: updated },
            { onConflict: 'session_id,step_number' }
          );
      }
    } catch (e) {
      // ignore logging errors
    }

    return NextResponse.json({ aiResponse: content });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to generate insight' }, { status: 500 });
  }
}
