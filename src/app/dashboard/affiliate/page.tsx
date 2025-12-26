'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './affiliate.module.css';

interface AffiliateStats {
  referralCode: string;
  referralLink: string;
  currentTrack: string;
  totalEarningsCents: number;
  availableBalanceCents: number;
  totalReferrals: number;
  activeReferrals: number;
  dinnerPartyCreditsCents: number;
  stripeConnectOnboardingComplete: boolean;
}

interface Transaction {
  id: string;
  created_at: string;
  amount_cents: number;
  direct_commission_cents: number;
  override_commission_cents: number;
  commission_status: string;
  direct_track: string;
  purchaser: {
    email: string;
    name: string;
  };
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/affiliate/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
      setTransactions(data.recentTransactions);
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTrackInfo = (track: string) => {
    switch (track) {
      case 'community_builder':
        return { name: 'Community Builder', direct: '$2.10', dinner: '$2.80', color: '#8b5cf6' };
      case 'high_performer':
        return { name: 'High Performer', direct: '$2.80', dinner: '$2.10', color: '#3b82f6' };
      case 'independent':
        return { name: 'Independent', direct: '$4.20', dinner: '$0.00', color: '#10b981' };
      default:
        return { name: 'Unknown', direct: '$0.00', dinner: '$0.00', color: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading affiliate dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Failed to load affiliate data</div>
      </div>
    );
  }

  const trackInfo = getTrackInfo(stats.currentTrack);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Affiliate Dashboard</h1>
        <p className={styles.subtitle}>Track your referrals and earnings</p>
      </header>

      {/* Onboarding Warning */}
      {!stats.stripeConnectOnboardingComplete && (
        <div className={styles.warning}>
          <div className={styles.warningContent}>
            <h3>Complete Payout Setup</h3>
            <p>You need to complete your Stripe onboarding to receive commission payouts.</p>
            <button
              onClick={() => router.push('/dashboard/affiliate/onboarding')}
              className={styles.warningButton}
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}

      {/* Referral Link Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Your Referral Link</h2>
        <div className={styles.referralLinkContainer}>
          <code className={styles.referralLink}>{stats.referralLink}</code>
          <button onClick={copyReferralLink} className={styles.copyButton}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className={styles.referralCode}>
          Referral Code: <strong>{stats.referralCode}</strong>
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Earnings</div>
          <div className={styles.statValue}>{formatMoney(stats.totalEarningsCents)}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Available Balance</div>
          <div className={styles.statValue}>{formatMoney(stats.availableBalanceCents)}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Referrals</div>
          <div className={styles.statValue}>{stats.totalReferrals}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Dinner Party Credits</div>
          <div className={styles.statValue}>{formatMoney(stats.dinnerPartyCreditsCents)}</div>
        </div>
      </div>

      {/* Current Track */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Commission Track</h2>
        <div className={styles.trackInfo} style={{ borderLeftColor: trackInfo.color }}>
          <div className={styles.trackName}>{trackInfo.name}</div>
          <div className={styles.trackDetails}>
            <div className={styles.trackDetail}>
              <span>Direct Commission:</span>
              <strong>{trackInfo.direct}</strong>
            </div>
            <div className={styles.trackDetail}>
              <span>Dinner Party Contribution:</span>
              <strong>{trackInfo.dinner}</strong>
            </div>
            <div className={styles.trackDetail}>
              <span>Override Commission:</span>
              <strong>$0.70</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recent Commissions</h2>
        {transactions.length === 0 ? (
          <p className={styles.emptyState}>No commissions yet. Start sharing your referral link!</p>
        ) : (
          <div className={styles.transactionsTable}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.transactionRow}>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionName}>{tx.purchaser?.name || tx.purchaser?.email}</div>
                  <div className={styles.transactionDate}>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.transactionAmount}>
                  {formatMoney(tx.direct_commission_cents + tx.override_commission_cents)}
                </div>
                <div className={`${styles.transactionStatus} ${styles[tx.commission_status]}`}>
                  {tx.commission_status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
