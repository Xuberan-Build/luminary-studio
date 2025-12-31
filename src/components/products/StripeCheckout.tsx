"use client";

import { useState } from "react";
import styles from "./stripe-checkout.module.css";

interface StripeCheckoutProps {
  paymentLink?: string;
  productName: string;
  price: number;
  productSlug?: string;
}

export default function StripeCheckout({ paymentLink, productName, price, productSlug }: StripeCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Prefer API checkout for better tracking and metadata
      if (productSlug) {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Checkout failed');
        }
      }
      // Fallback to direct payment link
      else if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        console.error("No payment method configured");
        alert("Payment not configured. Please contact support.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again or contact support.");
      setIsProcessing(false);
    }
  };

  // Show error state if keys are missing
  if (!publishableKey) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.placeholder}>
          <p className={styles.placeholderTitle}>⚠️ Stripe Not Configured</p>
          <p className={styles.placeholderText}>
            Add your Stripe keys to the <code>.env</code> file to enable payments.
          </p>
        </div>
      </div>
    );
  }

  // Show error if neither payment method is configured
  if (!productSlug && !paymentLink) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.placeholder}>
          <p className={styles.placeholderTitle}>⚠️ Payment Not Configured</p>
          <p className={styles.placeholderText}>
            Product requires either a productSlug or paymentLink prop.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <button
        onClick={handleCheckout}
        className={styles.checkoutButton}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Purchase ${productName} - $${price}`}
      </button>
      <p className={styles.checkoutNote}>
        Secure checkout powered by Stripe • Instant access
      </p>
    </div>
  );
}
