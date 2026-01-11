'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth/supabase-auth';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Reset your password</h1>
          <p>We will email you a secure reset link.</p>
        </div>

        {success ? (
          <>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.success}>
              Password reset email sent to <strong>{email}</strong>.
            </div>
            {process.env.NODE_ENV !== 'production' && (
              <button
                type="button"
                className={styles.button}
                onClick={async () => {
                  setError('');
                  setResetLink('');
                  try {
                    const response = await fetch('/api/auth/reset-link', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to generate reset link');
                    }
                    setResetLink(data.link || '');
                  } catch (err: any) {
                    setError(err.message || 'Failed to generate reset link');
                  }
                }}
              >
                Generate reset link (dev)
              </button>
            )}
            {resetLink && (
              <div className={styles.success}>
                <span>Reset link:</span>
                <a href={resetLink} className={styles.link}>
                  {resetLink}
                </a>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>
            Remembered your password?{' '}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
