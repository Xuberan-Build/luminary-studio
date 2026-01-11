import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase/server';
import { logAudit } from '@/lib/logging/audit-logger';
import { appendBetaFeedback } from '@/lib/google-sheets/beta-feedback';

type FeedbackType =
  | 'scan'
  | 'blueprint'
  | 'declaration'
  | 'rite_one'
  | 'rite_two'
  | 'journey';

const TYPE_TO_TABLE: Record<FeedbackType, { table: string; onConflict: string }> = {
  scan: { table: 'scan_feedback', onConflict: 'beta_participant_id,product_slug' },
  blueprint: { table: 'blueprint_feedback', onConflict: 'beta_participant_id,product_slug' },
  declaration: { table: 'declaration_feedback', onConflict: 'beta_participant_id,product_slug' },
  rite_one: { table: 'rite_one_consolidation', onConflict: 'beta_participant_id' },
  rite_two: { table: 'rite_two_consolidation', onConflict: 'beta_participant_id' },
  journey: { table: 'complete_journey_feedback', onConflict: 'beta_participant_id' },
};

export async function POST(req: NextRequest) {
  const requestPath = '/api/beta/submit-feedback';

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      productSlug,
      sessionId,
      surveyDurationSeconds,
      responses,
    } = body || {};

    if (!type || !TYPE_TO_TABLE[type as FeedbackType]) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: 'Missing feedback responses' }, { status: 400 });
    }

    const { data: participant, error: participantError } = await supabaseAdmin
      .from('beta_participants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (participantError) {
      console.error('Beta participant lookup failed:', participantError);
      return NextResponse.json({ error: 'Failed to load beta participant' }, { status: 500 });
    }

    if (!participant) {
      return NextResponse.json({ error: 'Beta participant not found' }, { status: 404 });
    }

    const feedbackType = type as FeedbackType;
    const { table, onConflict } = TYPE_TO_TABLE[feedbackType];

    const insertData: Record<string, any> = {
      beta_participant_id: participant.id,
      user_id: user.id,
      survey_duration_seconds: Number.isFinite(surveyDurationSeconds)
        ? Number(surveyDurationSeconds)
        : null,
      ...responses,
    };

    if (feedbackType === 'scan' || feedbackType === 'blueprint' || feedbackType === 'declaration') {
      if (!productSlug || typeof productSlug !== 'string') {
        return NextResponse.json({ error: 'productSlug is required' }, { status: 400 });
      }
      insertData.product_slug = productSlug;
      insertData.session_id = sessionId || null;
    }

    const { error: insertError } = await supabaseAdmin
      .from(table)
      .upsert(insertData, { onConflict });

    if (insertError) {
      console.error('Feedback insert failed:', insertError);
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        eventType: 'system',
        eventAction: 'api_error',
        eventStatus: 'error',
        requestMethod: req.method,
        requestPath,
        errorMessage: insertError.message,
        metadata: { feedbackType, productSlug },
      });

      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      eventType: 'system',
      eventAction: 'api_call',
      eventStatus: 'success',
      requestMethod: req.method,
      requestPath,
      metadata: { feedbackType, productSlug },
    });

    try {
      await appendBetaFeedback({
        type: feedbackType,
        userId: user.id,
        betaParticipantId: participant.id,
        productSlug: productSlug || null,
        sessionId: sessionId || null,
        surveyDurationSeconds: Number.isFinite(surveyDurationSeconds)
          ? Number(surveyDurationSeconds)
          : null,
        responses,
      });
    } catch (sheetError: any) {
      console.error('Beta feedback sheet sync failed:', sheetError?.message || sheetError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback submission error:', error);

    await logAudit({
      eventType: 'system',
      eventAction: 'api_error',
      eventStatus: 'error',
      requestMethod: req.method,
      requestPath,
      errorMessage: error?.message || 'Unknown error',
    });

    return NextResponse.json({ error: 'Unexpected error submitting feedback' }, { status: 500 });
  }
}
