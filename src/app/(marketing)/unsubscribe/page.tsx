"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './unsubscribe.module.css';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMessage('No email address provided');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      setStatus('success');
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'idle' && (
          <>
            <h1 className={styles.title}>Unsubscribe from Follow-up Emails</h1>
            <p className={styles.description}>
              We'll stop sending you follow-up emails about your purchase.
            </p>
            {email && (
              <p className={styles.email}>
                <strong>Email:</strong> {email}
              </p>
            )}
            <p className={styles.note}>
              Note: You'll still receive your initial access email when you purchase a product.
              This only affects follow-up emails (check-ins, tips, and offers).
            </p>
            <button
              onClick={handleUnsubscribe}
              className={styles.button}
              disabled={!email}
            >
              Confirm Unsubscribe
            </button>
            {!email && (
              <p className={styles.error}>
                No email address provided. Please use the unsubscribe link from your email.
              </p>
            )}
          </>
        )}

        {status === 'loading' && (
          <>
            <h1 className={styles.title}>Processing...</h1>
            <p className={styles.description}>Please wait while we update your preferences.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className={styles.title}>✅ You've Been Unsubscribed</h1>
            <p className={styles.description}>
              You will no longer receive follow-up emails from Quantum Strategies.
            </p>
            <p className={styles.note}>
              You'll still have access to any products you've purchased, and you can always
              reach out to us at <a href="mailto:austin@xuberandigital.com">austin@xuberandigital.com</a> if you need help.
            </p>
            <a href="/" className={styles.link}>
              Return to Home
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className={styles.title}>❌ Something Went Wrong</h1>
            <p className={styles.description}>
              We couldn't process your unsubscribe request.
            </p>
            <p className={styles.error}>{errorMessage}</p>
            <button onClick={() => setStatus('idle')} className={styles.button}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
