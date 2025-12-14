export interface ProductConfig {
  slug: string;
  name: string;
  price: number;
  stripePaymentLink: string;
  gptIframeUrl: string;
  interactTitle: string;
  interactInstructions: string;
  estimatedDuration: string;
  requiresChatGPTPlus?: boolean;
}

export const PRODUCTS: Record<string, ProductConfig> = {
  'quantum-initiation': {
    slug: 'quantum-initiation',
    name: 'Quantum Initiation Protocol',
    price: 7,
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM || '',
    gptIframeUrl: process.env.NEXT_PUBLIC_GPT_IFRAME_URL_QUANTUM || '',
    interactTitle: 'Build Your Quantum Blueprint',
    interactInstructions: 'Answer the questions below to generate your personalized brand strategy mapped to your Astrology and Human Design. This is a conversational process—be honest and thorough for the best results.',
    estimatedDuration: '10-15 minutes',
    requiresChatGPTPlus: true,
  },
};

export function getProductBySlug(slug: string): ProductConfig | null {
  return PRODUCTS[slug] || null;
}
