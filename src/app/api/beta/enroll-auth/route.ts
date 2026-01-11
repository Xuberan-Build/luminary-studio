import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase/server';
import { appendBetaEnrollmentToCRM } from '@/lib/google-sheets/beta-crm';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { whyParticipate } = await req.json();
    if (!whyParticipate || !whyParticipate.trim()) {
      return NextResponse.json(
        { error: 'Please share why you want to participate' },
        { status: 400 }
      );
    }

    const normalizedEmail = user.email.toLowerCase().trim();
    const { data, error } = await supabaseAdmin.rpc('enroll_beta_participant', {
      p_user_id: user.id,
      p_user_email: normalizedEmail,
      p_why_participate: whyParticipate.trim(),
      p_cohort_name: 'Beta Cohort',
    });

    if (error) {
      console.error('Auth enrollment error:', error);
      return NextResponse.json(
        {
          error: 'Failed to enroll in beta program. Please try again.',
          detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
        },
        { status: 500 }
      );
    }

    try {
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('id, email, name')
        .eq('id', user.id)
        .single();

      const { data: participant } = await supabaseAdmin
        .from('beta_participants')
        .select('id, cohort_name, status, current_rite, enrollment_date, program_start_date, program_end_date')
        .eq('id', data)
        .single();

      if (profile && participant) {
        await appendBetaEnrollmentToCRM({
          email: profile.email,
          name: profile.name,
          userId: profile.id,
          betaParticipantId: participant.id,
          cohortName: participant.cohort_name,
          status: participant.status,
          currentRite: participant.current_rite,
          enrollmentDate: participant.enrollment_date,
          programStartDate: participant.program_start_date,
          programEndDate: participant.program_end_date,
        });
      }
    } catch (crmError) {
      console.error('Failed to append beta enrollment to CRM sheet:', crmError);
    }

    return NextResponse.json({
      success: true,
      participantId: data,
      message: 'Successfully enrolled in beta program! Check your email for welcome instructions.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
        detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
      },
      { status: 500 }
    );
  }
}
