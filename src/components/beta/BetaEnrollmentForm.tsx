'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import styles from './BetaEnrollmentForm.module.css';

export default function BetaEnrollmentForm() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    whyParticipate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data.user?.email?.toLowerCase() || '';
      if (userEmail) {
        setIsAuthenticated(true);
        setAuthEmail(userEmail);
        setFormData((prev) => ({ ...prev, email: userEmail }));
      }

      if (typeof window !== 'undefined') {
        const pendingWhy = sessionStorage.getItem('betaEnrollmentWhy') || '';
        const pendingEmail = sessionStorage.getItem('betaEnrollmentEmail') || '';
        if (!userEmail && pendingEmail) {
          setFormData((prev) => ({ ...prev, email: pendingEmail }));
        }

        if (userEmail && pendingWhy) {
          try {
            setIsSubmitting(true);
            const response = await fetch('/api/beta/enroll-auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ whyParticipate: pendingWhy }),
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || 'Failed to enroll in beta program');
            }
            sessionStorage.removeItem('betaEnrollmentWhy');
            sessionStorage.removeItem('betaEnrollmentEmail');
            router.push('/dashboard/profile?onboarding=beta');
            return;
          } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
          } finally {
            setIsSubmitting(false);
          }
        }
      }
    };

    bootstrapAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isAuthenticated) {
        const response = await fetch('/api/beta/enroll-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ whyParticipate: formData.whyParticipate }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to enroll in beta program');
        }

        router.push('/dashboard/profile?onboarding=beta');
        return;
      }

      const response = await fetch('/api/beta/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check email');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('betaEnrollmentWhy', formData.whyParticipate);
        sessionStorage.setItem('betaEnrollmentEmail', formData.email.toLowerCase().trim());
      }

      const redirect = encodeURIComponent('/products/beta?enroll=1');
      const emailParam = encodeURIComponent(formData.email.toLowerCase().trim());
      if (data.exists) {
        router.push(`/login?email=${emailParam}&redirect=${redirect}`);
      } else {
        router.push(`/signup?email=${emailParam}&redirect=${redirect}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email Input */}
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            className={styles.input}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="your@email.com"
            disabled={isSubmitting || isAuthenticated}
          />
          <p className={styles.fieldHint}>
            {isAuthenticated
              ? `You're signed in as ${authEmail}.`
              : "We'll send your welcome email and product access here."}
          </p>
        </div>

        {/* Why Participate */}
        <div className={styles.fieldGroup}>
          <label htmlFor="whyParticipate" className={styles.label}>
            Why do you want to participate in the beta? *
          </label>
          <textarea
            id="whyParticipate"
            required
            className={styles.textarea}
            value={formData.whyParticipate}
            onChange={(e) =>
              setFormData({ ...formData, whyParticipate: e.target.value })
            }
            placeholder="Share what you hope to gain from the Three Rites journey..."
            rows={5}
            disabled={isSubmitting}
          />
          <p className={styles.fieldHint}>
            This helps us understand your goals and provide better support throughout your journey.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner}></span>
              Enrolling...
            </>
          ) : (
            <>
              <span>Join the Beta Program (Free)</span>
              <span className={styles.buttonArrow}>→</span>
            </>
          )}
        </button>

        {/* Fine Print */}
        <div className={styles.finePrint}>
          <p>
            By enrolling, you agree to complete all three Rites and provide thoughtful feedback.
            No payment required. You'll receive instant access to all 11 products upon enrollment.
          </p>
        </div>
      </form>

      {/* Success Animation */}
      <div className={styles.benefits}>
        <h3 className={styles.benefitsTitle}>What Happens Next</h3>
        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>✅</span>
            <span className={styles.benefitText}>
              <strong>Instant Access</strong> to all 11 products in your dashboard
            </span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>📧</span>
            <span className={styles.benefitText}>
              <strong>Welcome Email</strong> with getting started guide
            </span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>🚀</span>
            <span className={styles.benefitText}>
              <strong>Start Immediately</strong> with Rite I: Signal Awareness Scan
            </span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>💬</span>
            <span className={styles.benefitText}>
              <strong>Weekly Check-ins</strong> to support your progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
