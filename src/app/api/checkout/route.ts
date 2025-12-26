/**
 * Create Stripe Checkout Session with referral tracking
 * This replaces direct payment links to add referral metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getProductBySlug } from '@/lib/constants/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: NextRequest) {
  try {
    const { productSlug } = await req.json();

    // Validate product
    const product = getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    // Get referral code from cookie
    const cookieStore = await cookies();
    const referralCode = cookieStore.get('referral_code')?.value || '';

    console.log('Creating checkout session:', {
      product: product.slug,
      referralCode: referralCode || 'none',
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: `${product.estimatedDuration || '15-30 minutes'} guided experience`,
            },
            unit_amount: product.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online'}/products/${productSlug}/interact?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online'}/products/${productSlug}`,
      metadata: {
        product_slug: productSlug,
        referral_code: referralCode,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: undefined, // Let user enter their email
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
