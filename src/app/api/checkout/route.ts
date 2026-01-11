/**
 * Create Stripe Checkout Session with referral tracking
 * This replaces direct payment links to add referral metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getProductBySlug } from '@/lib/constants/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY?.trim() || '', {
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

    // Determine success URL based on product type
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumstrategies.online';
    const isOrientationBundle = productSlug === 'orientation-bundle';
    const isPerceptionScan = productSlug?.startsWith('perception-rite-scan-');
    const isPerceptionBundle = productSlug === 'perception-rite-bundle';
    const isDeclarationProduct = productSlug?.startsWith('declaration-rite-');
    const isDeclarationBundle = productSlug === 'declaration-rite-bundle';

    const successUrl = isOrientationBundle
      ? `${baseUrl}/dashboard?bundle=orientation&session_id={CHECKOUT_SESSION_ID}`
      : (isPerceptionScan || isPerceptionBundle || isDeclarationProduct || isDeclarationBundle)
        ? `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/products/${productSlug}/experience?session_id={CHECKOUT_SESSION_ID}`;

    // Create Stripe Checkout Session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
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
        success_url: successUrl,
        cancel_url: `${baseUrl}/products/${productSlug === 'orientation-bundle' ? 'orientation' : productSlug === 'declaration-rite-bundle' ? 'declaration' : productSlug}`,
        metadata: {
          product_slug: productSlug,
          referral_code: referralCode,
          ...(isPerceptionScan && { purchase_type: 'single' }),
          ...(isPerceptionScan && { scan_number: productSlug?.split('-').pop() }),
          ...(isPerceptionBundle && { purchase_type: 'bundle' }),
          ...(isPerceptionBundle && { included_scans: 'perception-rite-scan-1,perception-rite-scan-2,perception-rite-scan-3,perception-rite-scan-4,perception-rite-scan-5' }),
          ...(isDeclarationProduct && { purchase_type: 'single' }),
          ...(isDeclarationProduct && { declaration_slug: productSlug }),
          ...(isDeclarationBundle && { purchase_type: 'bundle' }),
          ...(isDeclarationBundle && { included_declarations: 'declaration-rite-life-vision,declaration-rite-business-model,declaration-rite-strategic-path' }),
        },
        allow_promotion_codes: !(isPerceptionScan || isPerceptionBundle || isDeclarationProduct || isDeclarationBundle),
        billing_address_collection: 'auto',
        customer_email: undefined, // Let user enter their email
      });
    } catch (stripeError: any) {
      console.error('Stripe session creation error:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        raw: stripeError,
      });
      throw stripeError;
    }

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
