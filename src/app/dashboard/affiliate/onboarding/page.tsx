'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './onboarding.module.css';

export default function AffiliateOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState('');

  const isRefresh = searchParams.get('refresh') === 'true';

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/affiliate/onboarding');
      if (!response.ok) throw new Error('Failed to check status');

      const data = await response.json();
      setStatus(data);

      // If onboarding is complete, redirect to dashboard
      if (data.onboardingComplete && data.payoutsEnabled) {
        setTimeout(() => {
          router.push('/dashboard/affiliate');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error checking status:', error);
      setError(error.message);
    }
  };

  const startOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/affiliate/onboarding', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start onboarding');
      }

      const data = await response.json();

      // Redirect to Stripe onboarding
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'Failed to start onboarding');
      setLoading(false);
    }
  };

  if (status?.onboardingComplete && status?.payoutsEnabled) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h1 className={styles.successTitle}>Onboarding Complete!</h1>
          <p className={styles.successDescription}>
            Your payout account is set up and ready to receive commissions.
          </p>
          <p className={styles.redirectNote}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Complete Your Payout Setup</h1>

        <p className={styles.description}>
          To receive commission payouts, you need to complete a quick onboarding with Stripe.
          This takes about 2 minutes and requires:
        </p>

        <ul className={styles.requirementsList}>
          <li>Legal name and date of birth</li>
          <li>Last 4 digits of SSN (for US)</li>
          <li>Bank account information</li>
          <li>Mailing address</li>
        </ul>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {status && !status.onboardingComplete && (
          <div className={styles.statusInfo}>
            <h3>Current Status</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span>Details Submitted:</span>
                <span className={status.onboardingComplete ? styles.statusYes : styles.statusNo}>
                  {status.onboardingComplete ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span>Charges Enabled:</span>
                <span className={status.chargesEnabled ? styles.statusYes : styles.statusNo}>
                  {status.chargesEnabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span>Payouts Enabled:</span>
                <span className={status.payoutsEnabled ? styles.statusYes : styles.statusNo}>
                  {status.payoutsEnabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={startOnboarding}
          className={styles.onboardingButton}
          disabled={loading}
        >
          {loading ? 'Starting...' : isRefresh ? 'Continue Onboarding' : 'Start Onboarding'}
        </button>

        <div className={styles.footer}>
          <p className={styles.secureNote}>
            Secure onboarding powered by Stripe
          </p>
          <p className={styles.taxNote}>
            Stripe handles all tax forms (W-9/1099) automatically
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/affiliate')}
          className={styles.backButton}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
