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
  'quantum-initiation': {
    slug: 'quantum-initiation',
    name: 'Business Alignment Orientation',
    price: 7,
    interactTitle: 'Build Your Business Alignment Blueprint',
    interactInstructions: 'Complete the guided intake to personalize your blueprint.',
    estimatedDuration: '15-30 minutes',
    gptIframeUrl: '',
    ...(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM && {
      stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM,
    }),
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
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
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
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
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
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
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
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
