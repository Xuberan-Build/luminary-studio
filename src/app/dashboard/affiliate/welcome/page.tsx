'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './welcome.module.css';

export default function AffiliateWelcome() {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [wasReferred, setWasReferred] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkReferralStatus();
  }, []);

  const checkReferralStatus = async () => {
    try {
      const response = await fetch('/api/affiliate/referral-status');
      if (response.ok) {
        const data = await response.json();
        setWasReferred(data.wasReferred);
      }
    } catch (error) {
      console.error('Error checking referral status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    setError('');

    try {
      const response = await fetch('/api/affiliate/enroll', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Enrollment failed');
      }

      // Redirect to affiliate dashboard
      router.push('/dashboard/affiliate');
    } catch (err: any) {
      setError(err.message);
      setEnrolling(false);
    }
  };

  const handleDecline = async () => {
    try {
      // Mark user as opted out
      await fetch('/api/affiliate/opt-out', {
        method: 'POST',
      });

      // Redirect to main dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error opting out:', error);
      // Redirect anyway
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <h1 className={styles.title}>Join Our Affiliate Program</h1>

        {wasReferred && (
          <div className={styles.referralBadge}>
            You were referred by a community member - join them in sharing Quantum Strategies!
          </div>
        )}

        <p className={styles.intro}>
          Share Quantum Strategies products and earn generous commissions while building community.
        </p>

        {/* Benefits Section */}
        <div className={styles.benefitsSection}>
          <h2>Program Benefits</h2>

          <div className={styles.trackCards}>
            <div className={styles.trackCard}>
              <h3>Community Builder</h3>
              <div className={styles.commission}>30% Direct Commission</div>
              <ul>
                <li>$2.10 per sale direct commission</li>
                <li>$2.80 contribution to dinner party pool</li>
                <li>$0.70 override commission on your referrals' sales</li>
                <li>Dinner party invitations when pool fills</li>
              </ul>
              <div className={styles.badge}>Default Track</div>
            </div>

            <div className={styles.trackCard}>
              <h3>High Performer</h3>
              <div className={styles.commission}>40% Direct Commission</div>
              <ul>
                <li>$2.80 per sale direct commission</li>
                <li>$2.10 contribution to dinner party pool</li>
                <li>$0.70 override commission</li>
                <li>Higher direct earnings, still participate in dinners</li>
              </ul>
            </div>

            <div className={styles.trackCard}>
              <h3>Independent</h3>
              <div className={styles.commission}>60% Direct Commission</div>
              <ul>
                <li>$4.20 per sale - highest direct commission</li>
                <li>No dinner party participation</li>
                <li>$0.70 override commission on referrals</li>
                <li>Pure cash payouts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Earnings */}
        <div className={styles.exampleSection}>
          <h2>Example Earnings</h2>
          <div className={styles.examples}>
            <div className={styles.example}>
              <div className={styles.exampleTitle}>10 Direct Sales</div>
              <div className={styles.exampleEarnings}>$21 - $42</div>
              <div className={styles.exampleDetails}>Depending on track</div>
            </div>
            <div className={styles.example}>
              <div className={styles.exampleTitle}>5 People Join Under You</div>
              <div className={styles.exampleEarnings}>+$0.70 per their sale</div>
              <div className={styles.exampleDetails}>Override commissions</div>
            </div>
            <div className={styles.example}>
              <div className={styles.exampleTitle}>100 Sales Network</div>
              <div className={styles.exampleEarnings}>$210 - $420+</div>
              <div className={styles.exampleDetails}>Direct + override earnings</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className={styles.howItWorks}>
          <h2>How It Works</h2>
          <ol>
            <li>
              <strong>Get your unique referral link</strong>
              <p>Instantly generated when you join</p>
            </li>
            <li>
              <strong>Share with your network</strong>
              <p>Friends, family, social media, email lists</p>
            </li>
            <li>
              <strong>Earn commissions on every sale</strong>
              <p>Automatic tracking and commission calculation</p>
            </li>
            <li>
              <strong>Track earnings in your dashboard</strong>
              <p>Real-time stats and transaction history</p>
            </li>
            <li>
              <strong>Get paid via Stripe Connect</strong>
              <p>Set up payouts anytime - commissions tracked immediately</p>
            </li>
          </ol>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Call to Action */}
        <div className={styles.actions}>
          <button
            onClick={handleEnroll}
            className={styles.enrollButton}
            disabled={enrolling}
          >
            {enrolling ? 'Setting up your account...' : 'Join Affiliate Program'}
          </button>

          <button
            onClick={handleDecline}
            className={styles.declineButton}
            disabled={enrolling}
          >
            Maybe Later
          </button>
        </div>

        <p className={styles.note}>
          Note: You can set up payouts later. Your referral link works immediately after joining.
        </p>
      </div>
    </div>
  );
}
