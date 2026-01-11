'use client';

import { useRef, useState } from 'react';
import BaseFeedbackForm from './BaseFeedbackForm';
import RatingScale from './RatingScale';
import styles from './BetaFeedbackForm.module.css';

interface BlueprintFeedbackFormProps {
  productSlug: string;
  sessionId?: string;
  onSubmitted?: () => void;
}

export default function BlueprintFeedbackForm({
  productSlug,
  sessionId,
  onSubmitted,
}: BlueprintFeedbackFormProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [insightDepthScore, setInsightDepthScore] = useState<number | null>(null);
  const [personalizationScore, setPersonalizationScore] = useState<number | null>(null);
  const [actionabilityScore, setActionabilityScore] = useState<number | null>(null);
  const [immediateAction, setImmediateAction] = useState('');
  const [biggestGap, setBiggestGap] = useState('');
  const [integrationWithPerception, setIntegrationWithPerception] = useState('');
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
          type: 'blueprint',
          productSlug,
          sessionId,
          surveyDurationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          responses: {
            insight_depth_score: insightDepthScore,
            personalization_score: personalizationScore,
            actionability_score: actionabilityScore,
            immediate_action: immediateAction.trim() || null,
            biggest_gap_revealed: biggestGap.trim() || null,
            integration_with_perception: integrationWithPerception.trim() || null,
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
      title="Orientation Blueprint Feedback"
      description="Quick feedback on depth, personalization, and next steps."
      submitLabel="Submit Blueprint Feedback"
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage="Thanks! Your blueprint feedback is saved."
      onSubmit={handleSubmit}
    >
      <div className={styles.gridTwo}>
        <RatingScale
          label="Insight depth"
          name="insightDepthScore"
          min={1}
          max={5}
          value={insightDepthScore}
          onChange={setInsightDepthScore}
          required
        />
        <RatingScale
          label="Personalization"
          name="personalizationScore"
          min={1}
          max={5}
          value={personalizationScore}
          onChange={setPersonalizationScore}
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
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="immediateAction">
          First action you will take
        </label>
        <textarea
          id="immediateAction"
          className={styles.textarea}
          value={immediateAction}
          onChange={(event) => setImmediateAction(event.target.value)}
          placeholder="What are you implementing first?"
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="biggestGap">
          Biggest gap revealed
        </label>
        <textarea
          id="biggestGap"
          className={styles.textarea}
          value={biggestGap}
          onChange={(event) => setBiggestGap(event.target.value)}
          placeholder="Where did this show a gap in your current approach?"
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="integrationWithPerception">
          Integration with Perception insights
        </label>
        <textarea
          id="integrationWithPerception"
          className={styles.textarea}
          value={integrationWithPerception}
          onChange={(event) => setIntegrationWithPerception(event.target.value)}
          placeholder="How did this build on your Perception scans?"
          rows={3}
        />
      </div>
    </BaseFeedbackForm>
  );
}
