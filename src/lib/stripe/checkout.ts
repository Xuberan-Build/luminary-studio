/**
 * Client-side Stripe Checkout helper
 * Creates checkout session with referral tracking
 */

export async function createCheckoutSession(productSlug: string): Promise<string> {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productSlug }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(productSlug: string): Promise<void> {
  try {
    const url = await createCheckoutSession(productSlug);
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to start checkout. Please try again.');
  }
}
