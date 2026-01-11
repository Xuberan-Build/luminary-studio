'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth/supabase-auth';
import styles from '../login/login.module.css';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await auth.updatePassword(password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Set a new password</h1>
          <p>Choose a strong password to secure your account.</p>
        </div>

        {success ? (
          <div className={styles.success}>
            Password updated successfully. You can now{' '}
            <Link href="/login" className={styles.link}>
              sign in
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="At least 8 characters"
                minLength={8}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Re-enter password"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>
            <Link href="/login" className={styles.link}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
