export interface ProductConfig {
  slug: string;
  name: string;
  price: number;
  stripePaymentLink: string;
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
    name: 'Quantum Initiation Protocol',
    price: 7,
    interactTitle: 'Build Your Quantum Blueprint',
    interactInstructions: 'Complete the guided intake to personalize your blueprint.',
    estimatedDuration: '15-30 minutes',
    gptIframeUrl: '',
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM || '',
    sheetId: '1EhC-MCjlqG_4otRZjxefEpttR98s5rXqr98vj2TnLTE',
    fromEmail: 'austin@xuberandigital.com',
    fromName: 'Quantum Strategies',
  },

  'quantum-structure-profit-scale': {
    slug: 'quantum-structure-profit-scale',
    name: 'Quantum Structure, Profit & Scale',
    price: 14,
    interactTitle: 'Structure, Profit & Scale',
    interactInstructions: 'Walk through the strategic intake to map your profit plan.',
    estimatedDuration: '25-35 minutes',
    gptIframeUrl: '',
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STRUCTURE || '',
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
