"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import styles from "./stripe-checkout.module.css";

export default function StripeCheckout() {
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  const handleCheckout = () => {
    if (paymentLink) {
      // Redirect to Stripe payment link
      window.location.href = paymentLink;
    } else {
      console.error("Payment link not configured");
    }
  };

  // Show error state if keys are missing
  if (!publishableKey || !paymentLink) {
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

  return (
    <>
      {/* Load Stripe.js */}
      <Script
        src="https://js.stripe.com/v3/"
        onLoad={() => setIsStripeLoaded(true)}
        strategy="lazyOnload"
      />

      <div className={styles.checkoutContainer}>
        <button
          onClick={handleCheckout}
          className={styles.checkoutButton}
          disabled={!isStripeLoaded}
        >
          Purchase Quantum Initiation - $7
        </button>
        <p className={styles.checkoutNote}>
          Secure checkout powered by Stripe • Instant access
        </p>
      </div>
    </>
  );
}
