'use client';

import { useRef, useState } from 'react';
import BaseFeedbackForm from './BaseFeedbackForm';
import RatingScale from './RatingScale';
import styles from './BetaFeedbackForm.module.css';

interface ScanFeedbackFormProps {
  productSlug: string;
  sessionId?: string;
  onSubmitted?: () => void;
}

export default function ScanFeedbackForm({
  productSlug,
  sessionId,
  onSubmitted,
}: ScanFeedbackFormProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [clarityScore, setClarityScore] = useState<number | null>(null);
  const [relevanceScore, setRelevanceScore] = useState<number | null>(null);
  const [actionabilityScore, setActionabilityScore] = useState<number | null>(null);
  const [surpriseLevel, setSurpriseLevel] = useState<number | null>(null);
  const [biggestAha, setBiggestAha] = useState('');
  const [implementationPlan, setImplementationPlan] = useState('');
  const [confusionPoints, setConfusionPoints] = useState('');
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
          type: 'scan',
          productSlug,
          sessionId,
          surveyDurationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          responses: {
            clarity_score: clarityScore,
            relevance_score: relevanceScore,
            actionability_score: actionabilityScore,
            surprise_level: surpriseLevel,
            biggest_aha: biggestAha.trim() || null,
            implementation_plan: implementationPlan.trim() || null,
            confusion_points: confusionPoints.trim() || null,
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
      title="Scan Feedback"
      description="Quick 2-minute check-in. Your answers help us improve clarity and actionability."
      submitLabel="Submit Scan Feedback"
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage="Thanks! Your scan feedback is recorded."
      onSubmit={handleSubmit}
    >
      <div className={styles.gridTwo}>
        <RatingScale
          label="Clarity"
          name="clarityScore"
          min={1}
          max={5}
          value={clarityScore}
          onChange={setClarityScore}
          required
        />
        <RatingScale
          label="Relevance"
          name="relevanceScore"
          min={1}
          max={5}
          value={relevanceScore}
          onChange={setRelevanceScore}
          required
        />
        <RatingScale
          label="Actionability"
          name="actionabilityScore"
          min={1}
          max={5}
          value={actionabilityScore}
          onChange={setActionabilityScore}
          required
        />
        <RatingScale
          label="Surprise Level"
          name="surpriseLevel"
          min={1}
          max={5}
          value={surpriseLevel}
          onChange={setSurpriseLevel}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="biggestAha">
          Biggest aha moment
        </label>
        <textarea
          id="biggestAha"
          className={styles.textarea}
          value={biggestAha}
          onChange={(event) => setBiggestAha(event.target.value)}
          placeholder="What hit you the hardest or felt most true?"
          rows={4}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="implementationPlan">
          What will you do differently?
        </label>
        <textarea
          id="implementationPlan"
          className={styles.textarea}
          value={implementationPlan}
          onChange={(event) => setImplementationPlan(event.target.value)}
          placeholder="Share the action you plan to take next."
          rows={4}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="confusionPoints">
          What felt unclear?
        </label>
        <textarea
          id="confusionPoints"
          className={styles.textarea}
          value={confusionPoints}
          onChange={(event) => setConfusionPoints(event.target.value)}
          placeholder="Let us know what was confusing or missing."
          rows={3}
        />
      </div>
    </BaseFeedbackForm>
  );
}
