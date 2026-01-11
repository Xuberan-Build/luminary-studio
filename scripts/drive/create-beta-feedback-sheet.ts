import { buildDriveClient, buildSheetsClient } from './google-auth';
import { ensureFolderPath } from './drive-paths';

const args = process.argv.slice(2);
const titleIndex = args.indexOf('--title');
const title = titleIndex !== -1 ? args[titleIndex + 1] : 'Beta Feedback';
const folderIndex = args.indexOf('--folder');
const folderPath = folderIndex !== -1 ? args[folderIndex + 1] : '';
const rootIndex = args.indexOf('--root');
const rootId = rootIndex !== -1 ? args[rootIndex + 1] : process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!rootId) {
  console.error('Missing root folder ID. Set GOOGLE_DRIVE_FOLDER_ID or pass --root <id>.');
  process.exit(1);
}

const sheets = buildSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
const drive = buildDriveClient(['https://www.googleapis.com/auth/drive']);

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
  let spreadsheetId = '';
  if (folderPath) {
    const resolved = await ensureFolderPath(rootId, folderPath);
    const created = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [resolved.folderId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    spreadsheetId = created.data.id || '';
  } else {
    const sheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
      },
    });

    spreadsheetId = sheet.data.spreadsheetId || '';
  }

  if (!spreadsheetId) {
    throw new Error('Failed to create spreadsheet.');
  }

  const sheetMeta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title))',
  });
  const defaultSheetId = sheetMeta.data.sheets?.[0]?.properties?.sheetId;

  const addSheetRequests = tabs.map((tab) => ({
    addSheet: {
      properties: {
        title: tab.title,
      },
    },
  }));

  if (typeof defaultSheetId === 'number') {
    addSheetRequests.push({
      deleteSheet: {
        sheetId: defaultSheetId,
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: addSheetRequests,
    },
  });

  for (const tab of tabs) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab.title}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [tab.headers],
      },
    });
  }

  console.log('Beta feedback sheet created.');
  console.log(`Spreadsheet ID: ${spreadsheetId}`);
  console.log(`Title: ${title}`);
}

run().catch((error) => {
  console.error('Create beta feedback sheet failed:', error?.message || error);
  process.exit(1);
});
