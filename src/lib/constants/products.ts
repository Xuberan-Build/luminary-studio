export interface ProductConfig {
  slug: string;
  name: string;
  price: number;
  stripePaymentLink?: string; // Optional: legacy payment links
  interactTitle?: string;
  interactInstructions?: string;
  estimatedDuration?: string;
  gptIframeUrl?: string;

  // Webhook & Email configuration
  sheetId: string; // Google Sheet ID for CRM logging
  fromEmail: string; // Sender email address
  fromName: string; // Sender name
  gptLink?: string; // legacy GPT link, optional
}

export const PRODUCTS: Record<string, ProductConfig> = {
  'business-alignment': {
    slug: 'business-alignment',
    name: 'Business Alignment Orientation',
    price: 7,
    interactTitle: 'Build Your Business Alignment Blueprint',
    interactInstructions: 'Complete the guided intake to personalize your blueprint.',
    estimatedDuration: '15-30 minutes',
    gptIframeUrl: '',
    ...(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM && {
      stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM,
    }),
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },

  'brand-alignment': {
    slug: 'brand-alignment',
    name: 'Brand Alignment Orientation',
    price: 7,
    interactTitle: 'Brand Alignment Orientation',
    interactInstructions: 'You\'ll answer 8 questions to unify who you are with how you show up.',
    estimatedDuration: '25-30 minutes',
    gptIframeUrl: '',
    ...(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BRAND_ALIGNMENT && {
      stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BRAND_ALIGNMENT,
    }),
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },

  'personal-alignment': {
    slug: 'personal-alignment',
    name: 'Personal Alignment Orientation',
    price: 7,
    interactTitle: 'Discover Your Personal Alignment',
    interactInstructions: 'Complete the guided experience to uncover your core values, purpose, and Life\'s Task.',
    estimatedDuration: '15-20 minutes',
    gptIframeUrl: '',
    ...(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PERSONAL_ALIGNMENT && {
      stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PERSONAL_ALIGNMENT,
    }),
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },

  'orientation-bundle': {
    slug: 'orientation-bundle',
    name: 'Complete Orientation Bundle',
    price: 17,
    interactTitle: 'Complete Orientation Bundle',
    interactInstructions: 'Get all three orientation products: Personal, Business, and Brand Alignment.',
    estimatedDuration: '60 minutes total',
    gptIframeUrl: '',
    ...(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ORIENTATION_BUNDLE && {
      stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ORIENTATION_BUNDLE,
    }),
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'perception-rite-scan-1': {
    slug: 'perception-rite-scan-1',
    name: 'Signal Awareness',
    price: 3,
    interactTitle: 'Signal Awareness Scan',
    interactInstructions: 'Complete the scan to reveal your current signal and recalibrate it.',
    estimatedDuration: '15-20 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'perception-rite-scan-2': {
    slug: 'perception-rite-scan-2',
    name: 'Value Pattern Decoder',
    price: 3,
    interactTitle: 'Value Pattern Decoder Scan',
    interactInstructions: 'Decode your stated vs revealed values and realign the gap.',
    estimatedDuration: '20 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'perception-rite-scan-3': {
    slug: 'perception-rite-scan-3',
    name: 'Boundary & Burnout',
    price: 3,
    interactTitle: 'Boundary & Burnout Scan',
    interactInstructions: 'Identify your duty cycle and redesign your energy system.',
    estimatedDuration: '20 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'perception-rite-scan-4': {
    slug: 'perception-rite-scan-4',
    name: 'Money Signal',
    price: 3,
    interactTitle: 'Money Signal Scan',
    interactInstructions: 'Recalibrate your pricing, language, and money self-concept.',
    estimatedDuration: '15-20 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'perception-rite-scan-5': {
    slug: 'perception-rite-scan-5',
    name: 'Competence Mapping',
    price: 3,
    interactTitle: 'Competence Mapping Scan',
    interactInstructions: 'Map your genius zone and redesign your work around it.',
    estimatedDuration: '15-20 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'perception-rite-bundle': {
    slug: 'perception-rite-bundle',
    name: 'Perception Rite Bundle',
    price: 12,
    interactTitle: 'Perception Rite Bundle',
    interactInstructions: 'Get all five Perception Rite scans.',
    estimatedDuration: '75-100 minutes total',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'declaration-rite-life-vision': {
    slug: 'declaration-rite-life-vision',
    name: 'Life Vision Declaration',
    price: 9,
    interactTitle: 'Life Vision Declaration',
    interactInstructions: 'Declare your moonshot and the revenue required to fund it.',
    estimatedDuration: '25-30 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'declaration-rite-business-model': {
    slug: 'declaration-rite-business-model',
    name: 'Business Model Declaration',
    price: 9,
    interactTitle: 'Business Model Declaration',
    interactInstructions: 'Design the ecosystem required to reach your moonshot.',
    estimatedDuration: '30-35 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'declaration-rite-strategic-path': {
    slug: 'declaration-rite-strategic-path',
    name: 'Strategic Path Declaration',
    price: 9,
    interactTitle: 'Strategic Path Declaration',
    interactInstructions: 'Choose your execution path and commit to the plan.',
    estimatedDuration: '30-35 minutes',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
  'declaration-rite-bundle': {
    slug: 'declaration-rite-bundle',
    name: 'Declaration Rite Bundle',
    price: 24,
    interactTitle: 'Declaration Rite Bundle',
    interactInstructions: 'Get all three Declaration Rite products.',
    estimatedDuration: '75-105 minutes total',
    gptIframeUrl: '',
    sheetId: '1rTuGFZePZPV1PpC9bm7rcLs4nWXdr6zsb931OGH3rr8',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },
};

export function getProductBySlug(slug: string): ProductConfig | null {
  return PRODUCTS[slug] || null;
}

export function getAllProducts(): ProductConfig[] {
  return Object.values(PRODUCTS);
}
