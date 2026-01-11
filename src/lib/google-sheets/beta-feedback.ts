import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

type FeedbackType = 'scan' | 'blueprint' | 'declaration' | 'rite_one' | 'rite_two' | 'journey';

type AppendPayload = {
  type: FeedbackType;
  userId: string;
  betaParticipantId: string;
  productSlug?: string | null;
  sessionId?: string | null;
  surveyDurationSeconds?: number | null;
  responses: Record<string, any>;
};

function getGoogleCredentials() {
  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  let fileCredentials: { client_email?: string; private_key?: string } | null = null;
  if (serviceAccountPath) {
    try {
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(process.cwd(), serviceAccountPath);
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      fileCredentials = JSON.parse(raw);
    } catch {
      fileCredentials = null;
    }
  }

  const client_email = fileCredentials?.client_email || process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let private_key = fileCredentials?.private_key || process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  if (private_key && private_key.includes('\\n')) {
    private_key = private_key.replace(/\\n/g, '\n');
  }
  return { client_email, private_key };
}

function resolveTab(type: FeedbackType) {
  switch (type) {
    case 'scan':
      return 'Beta Scan Feedback';
    case 'blueprint':
      return 'Beta Blueprint Feedback';
    case 'declaration':
      return 'Beta Declaration Feedback';
    case 'rite_one':
      return 'Rite I Consolidation';
    case 'rite_two':
      return 'Rite II Consolidation';
    case 'journey':
      return 'Journey Feedback';
    default:
      return 'Journey Feedback';
  }
}

function buildRow(payload: AppendPayload) {
  const submittedAt = new Date().toISOString();

  switch (payload.type) {
    case 'scan':
      return [
        submittedAt,
        payload.userId,
        payload.betaParticipantId,
        payload.productSlug || '',
        payload.sessionId || '',
        payload.responses.clarity_score ?? '',
        payload.responses.relevance_score ?? '',
        payload.responses.actionability_score ?? '',
        payload.responses.surprise_level ?? '',
        payload.responses.biggest_aha ?? '',
        payload.responses.implementation_plan ?? '',
        payload.responses.confusion_points ?? '',
        payload.surveyDurationSeconds ?? '',
      ];
    case 'blueprint':
      return [
        submittedAt,
        payload.userId,
        payload.betaParticipantId,
        payload.productSlug || '',
        payload.sessionId || '',
        payload.responses.insight_depth_score ?? '',
        payload.responses.personalization_score ?? '',
        payload.responses.actionability_score ?? '',
        payload.responses.immediate_action ?? '',
        payload.responses.biggest_gap_revealed ?? '',
        payload.responses.integration_with_perception ?? '',
        payload.surveyDurationSeconds ?? '',
      ];
    case 'declaration':
      return [
        submittedAt,
        payload.userId,
        payload.betaParticipantId,
        payload.productSlug || '',
        payload.sessionId || '',
        payload.responses.commitment_clarity_score ?? '',
        payload.responses.execution_confidence_score ?? '',
        payload.responses.alignment_score ?? '',
        payload.responses.decision_made ?? '',
        payload.responses.commitment_level ?? '',
        payload.responses.support_needed ?? '',
        payload.surveyDurationSeconds ?? '',
      ];
    case 'rite_one':
      return [
        submittedAt,
        payload.userId,
        payload.betaParticipantId,
        payload.responses.overall_value_score ?? '',
        payload.responses.completion_time_weeks ?? '',
        payload.responses.rite_one_nps ?? '',
        payload.responses.most_valuable_scan ?? '',
        payload.responses.least_valuable_scan ?? '',
        payload.responses.key_transformation ?? '',
        payload.responses.integration_challenge ?? '',
        payload.responses.breakthrough_moment ?? '',
        payload.responses.perceived_value_vs_price ?? '',
        payload.responses.would_recommend ?? '',
        payload.responses.testimonial_consent ?? '',
        payload.responses.testimonial_text ?? '',
        payload.surveyDurationSeconds ?? '',
        payload.responses.reminded_at ?? '',
      ];
    case 'rite_two':
      return [
        submittedAt,
        payload.userId,
        payload.betaParticipantId,
        payload.responses.overall_value_score ?? '',
        payload.responses.completion_time_weeks ?? '',
        payload.responses.rite_two_nps ?? '',
        payload.responses.most_valuable_blueprint ?? '',
        payload.responses.least_valuable_blueprint ?? '',
        payload.responses.strategic_clarity_before ?? '',
        payload.responses.strategic_clarity_after ?? '',
        payload.responses.business_model_confidence ?? '',
        payload.responses.perceived_value_vs_price ?? '',
        payload.responses.would_recommend ?? '',
        payload.responses.testimonial_consent ?? '',
        payload.responses.testimonial_text ?? '',
        payload.surveyDurationSeconds ?? '',
        payload.responses.reminded_at ?? '',
      ];
    case 'journey':
    default:
      return [
        submittedAt,
        payload.userId,
        payload.betaParticipantId,
        payload.responses.transformation_score ?? '',
        payload.responses.clarity_gained ?? '',
        payload.responses.confidence_gained ?? '',
        payload.responses.direction_clarity ?? '',
        payload.responses.journey_coherence_score ?? '',
        payload.responses.rite_integration_score ?? '',
        payload.responses.most_valuable_rite ?? '',
        payload.responses.most_valuable_product_overall ?? '',
        payload.responses.least_valuable_product_overall ?? '',
        payload.responses.before_journey_state ?? '',
        payload.responses.after_journey_state ?? '',
        payload.responses.biggest_breakthrough ?? '',
        payload.responses.unexpected_insight ?? '',
        payload.responses.perceived_total_value_vs_60 ?? '',
        payload.responses.willingness_to_pay_amount ?? '',
        payload.responses.purchase_timeline ?? '',
        payload.responses.what_would_make_you_say_yes ?? '',
        payload.responses.nps_score ?? '',
        payload.responses.would_refer_others ?? '',
        payload.responses.referral_commitment_count ?? '',
        payload.responses.founding_member_interest ?? '',
        payload.responses.founding_member_decision_factors ?? '',
        payload.responses.testimonial_consent ?? '',
        payload.responses.testimonial_text ?? '',
        payload.responses.video_testimonial_interest ?? '',
        payload.responses.what_worked_best ?? '',
        payload.responses.what_needs_improvement ?? '',
        payload.responses.missing_elements ?? '',
        payload.responses.additional_support_needed ?? '',
        payload.surveyDurationSeconds ?? '',
      ];
  }
}

export async function appendBetaFeedback(payload: AppendPayload): Promise<void> {
  const spreadsheetId = process.env.BETA_FEEDBACK_SHEET_ID;
  if (!spreadsheetId) {
    return;
  }

  const credentials = getGoogleCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const tab = resolveTab(payload.type);
  const row = buildRow(payload);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
}
