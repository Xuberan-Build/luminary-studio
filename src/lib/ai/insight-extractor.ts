import { supabaseAdmin } from '../supabase/server';
import { CustomerInsightData } from '../google-sheets/customer-sync';

/**
 * Extract customer insights from product experience data
 * Parses conversations and placements from Supabase
 */

export interface ProductSessionData {
  sessionId: string;
  email: string;
  product: string;
  placements?: {
    astrology?: any;
    human_design?: any;
    notes?: string;
  };
}

/**
 * Fetch all conversation data for a session
 */
async function fetchSessionConversations(sessionId: string) {
  const { data: conversations, error } = await supabaseAdmin
    .from('conversations')
    .select('step_number, messages, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return conversations || [];
}

/**
 * Extract business insights from conversation messages
 */
function extractBusinessInsights(conversations: any[]) {
  // Flatten all messages
  const allMessages = conversations.flatMap((c: any) =>
    ((c.messages as any[]) || []).map((m: any) => ({
      role: m.role,
      content: m.content || '',
      step: c.step_number,
    }))
  );

  // Extract user messages (their responses)
  const userMessages = allMessages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n');

  // Extract business model indicators
  const businessModel = extractBusinessModel(userMessages);

  // Extract offers
  const currentOffers = extractOffers(userMessages);

  // Extract pricing
  const currentPricing = extractPricing(userMessages);

  // Extract ideal client
  const idealClient = extractIdealClient(userMessages);

  // Extract revenue goals
  const revenueGoal = extractRevenueGoal(userMessages);

  // Extract pain points
  const painPoints = extractPainPoints(userMessages);

  // Extract AI recommendations from final briefing (step 999)
  const finalBriefing = conversations.find((c: any) => c.step_number === 999);
  const briefingContent = finalBriefing
    ? ((finalBriefing.messages as any[]) || [])
        .filter((m: any) => m.role === 'assistant' && m.type === 'final_briefing')
        .map((m: any) => m.content)
        .join('\n')
    : '';

  const whatToSell = extractWhatToSell(briefingContent);
  const howToSell = extractHowToSell(briefingContent);
  const pricingModel = extractPricingModel(briefingContent);
  const keyStrengths = extractKeyStrengths(briefingContent);
  const nextSteps = extractNextSteps(briefingContent);

  return {
    businessModel,
    currentOffers,
    currentPricing,
    idealClient,
    revenueGoal,
    painPoints,
    whatToSell,
    howToSell,
    pricingModel,
    keyStrengths,
    nextSteps,
  };
}

/**
 * Helper: Extract business model type
 */
function extractBusinessModel(text: string): string {
  const lower = text.toLowerCase();

  if (lower.match(/coach|coaching|mentor/)) return 'Coaching';
  if (lower.match(/course|program|training/)) return 'Course Creator';
  if (lower.match(/service|agency|consultant|freelance/)) return 'Service Provider';
  if (lower.match(/product|ecommerce|physical|digital product/)) return 'Product Business';
  if (lower.match(/saas|software|app/)) return 'SaaS';
  if (lower.match(/membership|community|subscription/)) return 'Membership';

  return 'Multiple Streams';
}

/**
 * Helper: Extract current offers
 */
function extractOffers(text: string): string {
  const offers: string[] = [];

  // Look for offer patterns
  const offerMatches = text.match(/(?:offer|sell|provide)\s+([^.!?\n]+)/gi);
  if (offerMatches) {
    offers.push(...offerMatches.slice(0, 3));
  }

  // Look for specific offer keywords
  if (text.match(/1:1|one-on-one|private/i)) offers.push('1:1 sessions');
  if (text.match(/group|mastermind/i)) offers.push('Group programs');
  if (text.match(/course|training/i)) offers.push('Courses');

  return offers.slice(0, 3).join(', ') || 'Multiple offers';
}

/**
 * Helper: Extract current pricing
 */
function extractPricing(text: string): string {
  const prices: string[] = [];

  // Look for dollar amounts
  const priceMatches = text.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:\/|per)\s*\w+)?/g);
  if (priceMatches) {
    prices.push(...priceMatches.slice(0, 3));
  }

  return prices.join(', ') || 'Variable pricing';
}

/**
 * Helper: Extract ideal client
 */
function extractIdealClient(text: string): string {
  const clientMatches = text.match(/(?:clients?|customers?|work with)\s+([^.!?\n]+)/gi);
  if (clientMatches && clientMatches[0]) {
    return clientMatches[0].replace(/^(clients?|customers?|work with)\s+/i, '').slice(0, 100);
  }
  return 'Entrepreneurs and business owners';
}

/**
 * Helper: Extract revenue goals
 */
function extractRevenueGoal(text: string): string {
  const goalMatches = text.match(/(?:goal|target|want|need).*?\$[\d,]+(?:k|K)?(?:\s*(?:\/|per)\s*\w+)?/gi);
  if (goalMatches && goalMatches[0]) {
    const dollarMatch = goalMatches[0].match(/\$[\d,]+(?:k|K)?(?:\s*(?:\/|per)\s*\w+)?/);
    return dollarMatch ? dollarMatch[0] : 'Growth focused';
  }
  return 'Revenue growth';
}

/**
 * Helper: Extract pain points
 */
function extractPainPoints(text: string): string {
  const painWords = [
    'struggle', 'challenge', 'difficult', 'hard', 'problem', 'issue',
    'frustrat', 'stuck', 'overwhelm', 'confus', 'uncertain'
  ];

  const sentences = text.split(/[.!?]/);
  const painSentences = sentences.filter((s) =>
    painWords.some((word) => s.toLowerCase().includes(word))
  ).slice(0, 2);

  return painSentences.join('. ').trim() || 'Scaling and consistency challenges';
}

/**
 * Extract "What to Sell" from briefing
 */
function extractWhatToSell(briefing: string): string {
  const section = briefing.match(/\*\*What to Sell Next\*\*[:\s]*([^*]+)/i);
  if (section && section[1]) {
    return section[1].trim().slice(0, 200);
  }
  return 'Signature offer aligned with energy type';
}

/**
 * Extract "How to Sell" from briefing
 */
function extractHowToSell(briefing: string): string {
  const section = briefing.match(/\*\*How to Sell\*\*[:\s]*([^*]+)/i);
  if (section && section[1]) {
    return section[1].trim().slice(0, 200);
  }
  return 'Authentic communication through aligned channels';
}

/**
 * Extract "Pricing Model" from briefing
 */
function extractPricingModel(briefing: string): string {
  const section = briefing.match(/\*\*Money Model\*\*[:\s]*([^*]+)/i);
  if (section && section[1]) {
    return section[1].trim().slice(0, 200);
  }
  return 'Premium pricing aligned with value delivery';
}

/**
 * Extract "Key Strengths" from briefing
 */
function extractKeyStrengths(briefing: string): string {
  const section = briefing.match(/\*\*Zone of Genius.*?\*\*[:\s]*([^*]+)/i);
  if (section && section[1]) {
    return section[1].trim().slice(0, 200);
  }
  return 'Natural leadership and strategic insight';
}

/**
 * Extract "Next Steps" from briefing
 */
function extractNextSteps(briefing: string): string {
  const section = briefing.match(/\*\*Execution Spine\*\*[:\s]*([^*]+)/i);
  if (section && section[1]) {
    return section[1].trim().slice(0, 200);
  }
  return 'Define offer, build audience, launch';
}

/**
 * Main function: Extract all insights from a product session
 */
export async function extractCustomerInsights(
  sessionData: ProductSessionData
): Promise<CustomerInsightData> {
  const { sessionId, email, product, placements } = sessionData;

  console.log(`🔍 Extracting insights for session: ${sessionId}`);

  // Fetch conversations
  const conversations = await fetchSessionConversations(sessionId);

  // Extract business insights from conversations
  const businessInsights = extractBusinessInsights(conversations);

  // Extract astrology data
  const astro = placements?.astrology || {};
  const sunSign = astro.sun && astro.sun !== 'UNKNOWN' ? astro.sun : '';
  const moonSign = astro.moon && astro.moon !== 'UNKNOWN' ? astro.moon : '';
  const risingSign = astro.rising && astro.rising !== 'UNKNOWN' ? astro.rising : '';

  // Extract human design data
  const hd = placements?.human_design || {};
  const hdType = hd.type && hd.type !== 'UNKNOWN' ? hd.type : '';
  const hdStrategy = hd.strategy && hd.strategy !== 'UNKNOWN' ? hd.strategy : '';
  const hdAuthority = hd.authority && hd.authority !== 'UNKNOWN' ? hd.authority : '';
  const hdProfile = hd.profile && hd.profile !== 'UNKNOWN' ? hd.profile : '';

  // Build segment tags
  const tags = [];
  if (hdType) tags.push(hdType);
  if (sunSign) tags.push(sunSign);
  if (moonSign) tags.push(`${moonSign}Moon`);
  if (businessInsights.businessModel) tags.push(businessInsights.businessModel);

  const insightData: CustomerInsightData = {
    email,
    product,
    completionDate: new Date().toISOString().split('T')[0],
    completionStatus: 'completed',

    // Astrological
    sunSign,
    moonSign,
    risingSign,

    // Human Design
    hdType,
    hdStrategy,
    hdAuthority,
    hdProfile,

    // Business
    businessModel: businessInsights.businessModel,
    currentOffers: businessInsights.currentOffers,
    currentPricing: businessInsights.currentPricing,
    idealClient: businessInsights.idealClient,
    revenueGoal: businessInsights.revenueGoal,
    painPoints: businessInsights.painPoints,

    // AI Insights
    whatToSell: businessInsights.whatToSell,
    howToSell: businessInsights.howToSell,
    pricingModel: businessInsights.pricingModel,
    keyStrengths: businessInsights.keyStrengths,
    nextSteps: businessInsights.nextSteps,

    // Segmentation
    segmentTags: tags.join(','),
    notes: `Extracted from session ${sessionId}`,
  };

  console.log('✅ Insights extracted:');
  console.log(`   HD Type: ${insightData.hdType || 'N/A'}`);
  console.log(`   Sun/Moon: ${insightData.sunSign}/${insightData.moonSign}`);
  console.log(`   Business: ${insightData.businessModel}`);
  console.log(`   Tags: ${insightData.segmentTags}`);

  return insightData;
}
