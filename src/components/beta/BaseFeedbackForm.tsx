'use client';

import { ReactNode } from 'react';
import styles from './BetaFeedbackForm.module.css';

interface BaseFeedbackFormProps {
  title: string;
  description?: string;
  submitLabel?: string;
  isSubmitting: boolean;
  error?: string | null;
  success?: boolean;
  successMessage?: string;
  footerNote?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export default function BaseFeedbackForm({
  title,
  description,
  submitLabel = 'Submit feedback',
  isSubmitting,
  error,
  success,
  successMessage,
  footerNote,
  onSubmit,
  children,
}: BaseFeedbackFormProps) {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>

      <form className={styles.form} onSubmit={onSubmit}>
        {children}

        {error && (
          <div className={styles.errorMessage}>
            <span aria-hidden>⚠️</span>
            {error}
          </div>
        )}

        {success ? (
          <div className={styles.successMessage}>
            {successMessage || 'Thanks for your feedback. You are all set!'}
          </div>
        ) : (
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : submitLabel}
          </button>
        )}

        {footerNote && <p className={styles.footerNote}>{footerNote}</p>}
      </form>
    </section>
  );
}
