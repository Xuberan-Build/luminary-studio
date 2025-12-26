'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../onboarding.module.css';

export default function OnboardingComplete() {
  const router = useRouter();

  useEffect(() => {
    // Wait 3 seconds then redirect to dashboard
    const timeout = setTimeout(() => {
      router.push('/dashboard/affiliate');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.successTitle}>Onboarding Complete!</h1>
        <p className={styles.successDescription}>
          Your payout account is being verified. You'll be able to receive commissions once Stripe completes verification (usually instant).
        </p>
        <p className={styles.redirectNote}>Redirecting to your affiliate dashboard...</p>
      </div>
    </div>
  );
}
