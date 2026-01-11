import { buildSheetsClient } from './google-auth';

const args = process.argv.slice(2);
const sheetIndex = args.indexOf('--sheet-id');
const spreadsheetId = sheetIndex !== -1 ? args[sheetIndex + 1] : process.env.BETA_FEEDBACK_SHEET_ID;

if (!spreadsheetId) {
  console.error('Missing spreadsheet ID. Pass --sheet-id or set BETA_FEEDBACK_SHEET_ID.');
  process.exit(1);
}

const sheets = buildSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

const tabs = [
  {
    title: 'Beta Scan Feedback',
    headers: [
      'submitted_at',
      'user_id',
      'beta_participant_id',
      'product_slug',
      'session_id',
      'clarity_score',
      'relevance_score',
      'actionability_score',
      'surprise_level',
      'biggest_aha',
      'implementation_plan',
      'confusion_points',
      'survey_duration_seconds',
    ],
  },
  {
    title: 'Beta Blueprint Feedback',
    headers: [
      'submitted_at',
      'user_id',
      'beta_participant_id',
      'product_slug',
      'session_id',
      'insight_depth_score',
      'personalization_score',
      'actionability_score',
      'immediate_action',
      'biggest_gap_revealed',
      'integration_with_perception',
      'survey_duration_seconds',
    ],
  },
  {
    title: 'Beta Declaration Feedback',
    headers: [
      'submitted_at',
      'user_id',
      'beta_participant_id',
      'product_slug',
      'session_id',
      'commitment_clarity_score',
      'execution_confidence_score',
      'alignment_score',
      'decision_made',
      'commitment_level',
      'support_needed',
      'survey_duration_seconds',
    ],
  },
  {
    title: 'Rite I Consolidation',
    headers: [
      'submitted_at',
      'user_id',
      'beta_participant_id',
      'overall_value_score',
      'completion_time_weeks',
      'rite_one_nps',
      'most_valuable_scan',
      'least_valuable_scan',
      'key_transformation',
      'integration_challenge',
      'breakthrough_moment',
      'perceived_value_vs_price',
      'would_recommend',
      'testimonial_consent',
      'testimonial_text',
      'survey_duration_seconds',
      'reminded_at',
    ],
  },
  {
    title: 'Rite II Consolidation',
    headers: [
      'submitted_at',
      'user_id',
      'beta_participant_id',
      'overall_value_score',
      'completion_time_weeks',
      'rite_two_nps',
      'most_valuable_blueprint',
      'least_valuable_blueprint',
      'strategic_clarity_before',
      'strategic_clarity_after',
      'business_model_confidence',
      'perceived_value_vs_price',
      'would_recommend',
      'testimonial_consent',
      'testimonial_text',
      'survey_duration_seconds',
      'reminded_at',
    ],
  },
  {
    title: 'Journey Feedback',
    headers: [
      'submitted_at',
      'user_id',
      'beta_participant_id',
      'transformation_score',
      'clarity_gained',
      'confidence_gained',
      'direction_clarity',
      'journey_coherence_score',
      'rite_integration_score',
      'most_valuable_rite',
      'most_valuable_product_overall',
      'least_valuable_product_overall',
      'before_journey_state',
      'after_journey_state',
      'biggest_breakthrough',
      'unexpected_insight',
      'perceived_total_value_vs_60',
      'willingness_to_pay_amount',
      'purchase_timeline',
      'what_would_make_you_say_yes',
      'nps_score',
      'would_refer_others',
      'referral_commitment_count',
      'founding_member_interest',
      'founding_member_decision_factors',
      'testimonial_consent',
      'testimonial_text',
      'video_testimonial_interest',
      'what_worked_best',
      'what_needs_improvement',
      'missing_elements',
      'additional_support_needed',
      'survey_duration_seconds',
    ],
  },
];

async function run() {
  const sheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title))',
  });

  const existing = new Map<string, number>();
  (sheet.data.sheets || []).forEach((tab) => {
    const title = tab.properties?.title;
    const sheetId = tab.properties?.sheetId;
    if (title && typeof sheetId === 'number') {
      existing.set(title, sheetId);
    }
  });

  const requests: any[] = [];
  for (const tab of tabs) {
    if (!existing.has(tab.title)) {
      requests.push({
        addSheet: {
          properties: { title: tab.title },
        },
      });
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }

  for (const tab of tabs) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab.title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [tab.headers] },
    });
  }

  console.log('Beta feedback sheet initialized.');
  console.log(`Spreadsheet ID: ${spreadsheetId}`);
}

run().catch((error) => {
  console.error('Init beta feedback sheet failed:', error?.message || error);
  process.exit(1);
});
