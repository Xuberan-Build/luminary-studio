'use client';

import { useRef, useState } from 'react';
import BaseFeedbackForm from './BaseFeedbackForm';
import RatingScale from './RatingScale';
import styles from './BetaFeedbackForm.module.css';

interface DeclarationFeedbackFormProps {
  productSlug: string;
  sessionId?: string;
  onSubmitted?: () => void;
}

export default function DeclarationFeedbackForm({
  productSlug,
  sessionId,
  onSubmitted,
}: DeclarationFeedbackFormProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [commitmentClarityScore, setCommitmentClarityScore] = useState<number | null>(null);
  const [executionConfidenceScore, setExecutionConfidenceScore] = useState<number | null>(null);
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);
  const [decisionMade, setDecisionMade] = useState('');
  const [commitmentLevel, setCommitmentLevel] = useState<number | null>(null);
  const [supportNeeded, setSupportNeeded] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/beta/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'declaration',
          productSlug,
          sessionId,
          surveyDurationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          responses: {
            commitment_clarity_score: commitmentClarityScore,
            execution_confidence_score: executionConfidenceScore,
            alignment_score: alignmentScore,
            decision_made: decisionMade.trim() || null,
            commitment_level: commitmentLevel,
            support_needed: supportNeeded.trim() || null,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      onSubmitted?.();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseFeedbackForm
      title="Declaration Feedback"
      description="Help us refine commitment clarity and execution support."
      submitLabel="Submit Declaration Feedback"
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage="Thanks! Your declaration feedback is saved."
      onSubmit={handleSubmit}
    >
      <div className={styles.gridTwo}>
        <RatingScale
          label="Commitment clarity"
          name="commitmentClarityScore"
          min={1}
          max={5}
          value={commitmentClarityScore}
          onChange={setCommitmentClarityScore}
          required
        />
        <RatingScale
          label="Execution confidence"
          name="executionConfidenceScore"
          min={1}
          max={5}
          value={executionConfidenceScore}
          onChange={setExecutionConfidenceScore}
          required
        />
        <RatingScale
          label="Alignment score"
          name="alignmentScore"
          min={1}
          max={5}
          value={alignmentScore}
          onChange={setAlignmentScore}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="decisionMade">
          Decision you made
        </label>
        <textarea
          id="decisionMade"
          className={styles.textarea}
          value={decisionMade}
          onChange={(event) => setDecisionMade(event.target.value)}
          placeholder="What decision did you commit to?"
          rows={3}
        />
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="commitmentLevel">
            Commitment level (1-10)
          </label>
          <input
            id="commitmentLevel"
            type="number"
            min="1"
            max="10"
            className={styles.input}
            value={commitmentLevel ?? ''}
            onChange={(event) => setCommitmentLevel(event.target.value ? Number(event.target.value) : null)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="supportNeeded">
            Support you need
          </label>
          <textarea
            id="supportNeeded"
            className={styles.textarea}
            value={supportNeeded}
            onChange={(event) => setSupportNeeded(event.target.value)}
            rows={3}
          />
        </div>
      </div>
    </BaseFeedbackForm>
  );
}
