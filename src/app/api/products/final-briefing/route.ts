import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { PromptService } from '@/lib/services/PromptService';
import { AIRequestService } from '@/lib/services/AIRequestService';
import { EmailSequenceService, type EmailContent } from '@/lib/services/EmailSequenceService';
import { EmailTemplateService } from '@/lib/services/EmailTemplateService';

export async function POST(req: Request) {
  try {
    const { sessionId, placements, productName = 'Quantum Initiation', productSlug = 'quantum-initiation' } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Pull conversations to summarize user input across steps
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select('step_number,messages,created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    // Extract user responses
    const userResponses = (conversations || [])
      .flatMap((c: any) =>
        ((c.messages as any[]) || [])
          .filter((m: any) => m.role === 'user')
          .map((m: any) => `Step ${c.step_number}: ${m.content}`)
      )
      .join('\n\n');

    // Extract Wizard's actionable nudges/insights
    const wizardNudges = (conversations || [])
      .flatMap((c: any) =>
        ((c.messages as any[]) || [])
          .filter((m: any) => m.role === 'assistant' && m.type === 'step_insight')
          .map((m: any) => `Step ${c.step_number} Insight: ${m.content}`)
      )
      .join('\n\n');

    const astro = placements?.astrology || {};
    const hd = placements?.human_design || {};
    const notes = placements?.notes || '';

    console.log('[final-briefing] Placements:', placements ? 'Present' : 'MISSING');
    console.log('[final-briefing] Astrology fields:', Object.keys(astro).length);
    console.log('[final-briefing] HD fields:', Object.keys(hd).length);
    console.log('[final-briefing] Astro values:', JSON.stringify(astro, null, 2));
    console.log('[final-briefing] HD values:', JSON.stringify(hd, null, 2));
    console.log('[final-briefing] Notes length:', notes.length);

    // Build placement summary - only include fields with actual data
    const astroFields = [];
    if (astro.sun && astro.sun !== 'UNKNOWN') astroFields.push(`Sun: ${astro.sun}`);
    if (astro.moon && astro.moon !== 'UNKNOWN') astroFields.push(`Moon: ${astro.moon}`);
    if (astro.rising && astro.rising !== 'UNKNOWN') astroFields.push(`Rising: ${astro.rising}`);
    if (astro.mercury && astro.mercury !== 'UNKNOWN') astroFields.push(`Mercury: ${astro.mercury}`);
    if (astro.venus && astro.venus !== 'UNKNOWN') astroFields.push(`Venus: ${astro.venus}`);
    if (astro.mars && astro.mars !== 'UNKNOWN') astroFields.push(`Mars: ${astro.mars}`);
    if (astro.jupiter && astro.jupiter !== 'UNKNOWN') astroFields.push(`Jupiter: ${astro.jupiter}`);
    if (astro.saturn && astro.saturn !== 'UNKNOWN') astroFields.push(`Saturn: ${astro.saturn}`);
    if (astro.uranus && astro.uranus !== 'UNKNOWN') astroFields.push(`Uranus: ${astro.uranus}`);
    if (astro.neptune && astro.neptune !== 'UNKNOWN') astroFields.push(`Neptune: ${astro.neptune}`);
    if (astro.pluto && astro.pluto !== 'UNKNOWN') astroFields.push(`Pluto: ${astro.pluto}`);
    if (astro.houses && astro.houses !== 'UNKNOWN') astroFields.push(`Houses: ${astro.houses}`);

    const hdFields = [];
    if (hd.type && hd.type !== 'UNKNOWN') hdFields.push(`Type: ${hd.type}`);
    if (hd.strategy && hd.strategy !== 'UNKNOWN') hdFields.push(`Strategy: ${hd.strategy}`);
    if (hd.authority && hd.authority !== 'UNKNOWN') hdFields.push(`Authority: ${hd.authority}`);
    if (hd.profile && hd.profile !== 'UNKNOWN') hdFields.push(`Profile: ${hd.profile}`);
    if (hd.centers && hd.centers !== 'UNKNOWN') hdFields.push(`Centers: ${hd.centers}`);
    if (hd.gifts && hd.gifts !== 'UNKNOWN') hdFields.push(`Gifts: ${hd.gifts}`);

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
    placementSummary = placementSummary.trim();

    console.log('[final-briefing] Placement summary preview:', placementSummary.slice(0, 200));

    // Gather user money goals if provided in conversations (look for $ or goal keywords)
    const moneyNotes = (conversations || [])
      .flatMap((c: any) => ((c.messages as any[]) || []).map((m: any) => m.content || ''))
      .filter((m: string) => /\$|revenue|profit|goal|target|recurring|MRR|ARR|pipeline/i.test(m))
      .slice(-5)
      .join('\n');

    // Load system prompt from database with fallback
    const systemPrompt = await PromptService.getPrompt({
      productSlug: productSlug || 'quantum-initiation',
      scope: 'final_briefing',
      fallback: `You are the Quantum Brand Architect AI (Sage–Magician). You produce premium-grade blueprints worth $700 of clarity.

YOUR ROLE:
- Synthesize astrology, Human Design, and business strategy into actionable guidance
- Reference SPECIFIC details the user shared in their responses
- Create concrete, immediately usable recommendations
- Write in a premium, decisive tone with zero filler

CRITICAL RULES:
⚠️ DO NOT ask for more information or data
⚠️ DO NOT say anything is missing or unknown
⚠️ USE whatever data is provided to create insights
⚠️ If a piece of data is unavailable, work around it creatively or skip it
⚠️ Your job is to DELIVER the blueprint, not request more input`,
    });

    const chartDataMessage = `MY CHART DATA:

${placementSummary}

${placementSummary ? 'Use this chart data to inform your analysis.' : 'Limited chart data available - focus on conversation insights.'}`;

    const conversationMessage = `MY COMPLETE RESPONSES ACROSS ALL STEPS:

${userResponses || 'No detailed responses provided.'}

${wizardNudges ? `\n\nQBF WIZARD'S ACTIONABLE NUDGES (synthesize these into the roadmap):\n\n${wizardNudges}` : ''}

${moneyNotes ? `\n\nMONEY/REVENUE GOALS MENTIONED:\n${moneyNotes}` : ''}

Reference specific details I shared about my business, challenges, and goals. IMPORTANT: Synthesize the QBF Wizard's actionable nudges into concrete next steps in the roadmap.`;

    const instructionMessage = `Generate my Quantum Brand Blueprint with these 7 sections:

1. **Brand Essence** (1-2 sentences)
   - Ground in Sun/Moon/Rising + money houses (2/8/10/11)
   - Integrate HD type/strategy/authority
   - Include standout Mars/Venus/Mercury/Saturn themes

2. **Zone of Genius + Value Promise**
   - What I should be known for
   - The transformation I reliably deliver
   - Based on chart themes + what I shared

3. **What to Sell Next** (1-2 offers)
   - Tied to my stated goals from the conversation
   - Include price range and format (sessions, duration, group size)
   - Align with chart themes

4. **How to Sell**
   - Voice/visibility channels (Rising + Mercury/Venus + HD strategy)
   - What NOT to do based on my chart
   - Specific to my audience/business model

5. **Money Model**
   - One focus move (pricing/recurring/ascension) tied to houses 2/8/10/11
   - 30-day revenue experiment with numeric targets
   - Aligned to my stated revenue goals

6. **Execution Spine**
   - 3-5 crisp do-now actions for next 30 days
   - Cover: audience, offer, delivery, proof
   - No "consider" - only concrete steps
   - Tied to what I actually shared

7. **Value Elicitation**
   - 3 sharp questions I must answer to unlock clarity
   - Specific to my business situation

REQUIREMENTS:
- Write in concise prose, not bullet lists
- ~500-700 words total
- Make every line feel tailored to MY specific situation
- Use details from my conversation responses
- Premium, decisive tone - zero filler
- Immediately actionable

Generate the blueprint now.`;

    // Generate final briefing using AIRequestService
    let briefing = '';
    try {
      const response = await AIRequestService.request({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        systemPrompt,
        messages: [
          { role: 'user', content: chartDataMessage },
          { role: 'user', content: conversationMessage },
          { role: 'user', content: instructionMessage },
        ],
        maxTokens: 15000,
        context: 'final-briefing',
        retries: 2,
      });

      briefing = response.content;

      console.log('[final-briefing] AI response successful');
      console.log(`[final-briefing] Tokens used: ${response.tokensUsed.total} (${response.tokensUsed.prompt} prompt, ${response.tokensUsed.completion} completion)`);
    } catch (err: any) {
      console.error('[final-briefing] AI request failed:', err?.message || err);
      return NextResponse.json({ error: 'AI generation failed', detail: err?.message || 'Unknown error' }, { status: 500 });
    }

    // Log briefing to conversations
    try {
      const { data: convo } = await supabaseAdmin
        .from('conversations')
        .select('messages')
        .eq('session_id', sessionId)
        .eq('step_number', 999)
        .maybeSingle();
      const existing = (convo?.messages as any[]) || [];
      const updated = [...existing, { role: 'assistant', content: briefing, created_at: new Date().toISOString(), type: 'final_briefing' }];
      await supabaseAdmin
        .from('conversations')
        .upsert(
          { session_id: sessionId, step_number: 999, messages: updated },
          { onConflict: 'session_id,step_number' }
        );
    } catch (e) {
      // ignore logging errors
    }

    // Save deliverable to product_sessions and schedule affiliate email
    try {
      // Get session and user info
      const { data: session } = await supabaseAdmin
        .from('product_sessions')
        .select('user_id, product_slug')
        .eq('id', sessionId)
        .single();

      if (session) {
        // Update product_sessions with deliverable
        await supabaseAdmin
          .from('product_sessions')
          .update({
            deliverable: briefing,
            completed_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        console.log('[final-briefing] Saved deliverable to product_sessions');

        // Get user info for email
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, name, is_affiliate, affiliate_opted_out')
          .eq('id', session.user_id)
          .single();

        if (user) {
          // Only schedule email if user hasn't enrolled and hasn't opted out
          if (!user.is_affiliate && !user.affiliate_opted_out) {
            const emailContent: EmailContent = {
              product_name: productName || 'Quantum Initiation',
              product_slug: session.product_slug || productSlug || 'quantum-initiation',
              deliverable_preview: EmailTemplateService.getDeliverablePreview(briefing),
              user_first_name: EmailTemplateService.getFirstName(user.name),
              user_email: user.email,
            };

            const scheduledEmail = await EmailSequenceService.scheduleEmail(
              user.id,
              'affiliate_invitation',
              'deliverable_completed',
              emailContent,
              30 // 30 minutes delay
            );

            if (scheduledEmail) {
              console.log('[final-briefing] Scheduled affiliate invitation email for 30 minutes');
            } else {
              console.log('[final-briefing] Failed to schedule affiliate invitation email');
            }
          } else {
            console.log(
              `[final-briefing] Skipping email (is_affiliate: ${user.is_affiliate}, opted_out: ${user.affiliate_opted_out})`
            );
          }
        }
      }
    } catch (e) {
      // Don't fail the request if email scheduling fails
      console.error('[final-briefing] Error scheduling email:', e);
    }

    return NextResponse.json({ briefing });
  } catch (err: any) {
    console.error('final-briefing error', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate briefing' }, { status: 500 });
  }
}
