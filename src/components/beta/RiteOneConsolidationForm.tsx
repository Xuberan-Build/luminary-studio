'use client';

import { useRef, useState } from 'react';
import BaseFeedbackForm from './BaseFeedbackForm';
import RatingScale from './RatingScale';
import styles from './BetaFeedbackForm.module.css';

interface RiteOneConsolidationFormProps {
  onSubmitted?: () => void;
}

export default function RiteOneConsolidationForm({ onSubmitted }: RiteOneConsolidationFormProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [overallValueScore, setOverallValueScore] = useState<number | null>(null);
  const [completionTimeWeeks, setCompletionTimeWeeks] = useState('');
  const [riteOneNps, setRiteOneNps] = useState<number | null>(null);
  const [mostValuableScan, setMostValuableScan] = useState('');
  const [leastValuableScan, setLeastValuableScan] = useState('');
  const [keyTransformation, setKeyTransformation] = useState('');
  const [integrationChallenge, setIntegrationChallenge] = useState('');
  const [breakthroughMoment, setBreakthroughMoment] = useState('');
  const [perceivedValueVsPrice, setPerceivedValueVsPrice] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState('');
  const [testimonialConsent, setTestimonialConsent] = useState(false);
  const [testimonialText, setTestimonialText] = useState('');
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
          type: 'rite_one',
          surveyDurationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          responses: {
            overall_value_score: overallValueScore,
            completion_time_weeks: completionTimeWeeks ? Number(completionTimeWeeks) : null,
            rite_one_nps: riteOneNps,
            most_valuable_scan: mostValuableScan.trim() || null,
            least_valuable_scan: leastValuableScan.trim() || null,
            key_transformation: keyTransformation.trim() || null,
            integration_challenge: integrationChallenge.trim() || null,
            breakthrough_moment: breakthroughMoment.trim() || null,
            perceived_value_vs_price: perceivedValueVsPrice || null,
            would_recommend: wouldRecommend === 'yes' ? true : wouldRecommend === 'no' ? false : null,
            testimonial_consent: testimonialConsent,
            testimonial_text: testimonialText.trim() || null,
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
      title="Rite I Consolidation"
      description="A quick synthesis after completing all 5 Perception scans."
      submitLabel="Submit Rite I Feedback"
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage="Rite I consolidation saved."
      onSubmit={handleSubmit}
    >
      <div className={styles.gridTwo}>
        <RatingScale
          label="Overall value (1-10)"
          name="overallValueScore"
          min={1}
          max={10}
          value={overallValueScore}
          onChange={setOverallValueScore}
          required
        />
        <RatingScale
          label="Rite I NPS (0-10)"
          name="riteOneNps"
          min={0}
          max={10}
          value={riteOneNps}
          onChange={setRiteOneNps}
          required
        />
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="completionTimeWeeks">
            Weeks to complete
          </label>
          <input
            id="completionTimeWeeks"
            type="number"
            min="0"
            step="0.1"
            className={styles.input}
            value={completionTimeWeeks}
            onChange={(event) => setCompletionTimeWeeks(event.target.value)}
            placeholder="e.g. 2"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="perceivedValueVsPrice">
            Value vs $12
          </label>
          <select
            id="perceivedValueVsPrice"
            className={styles.select}
            value={perceivedValueVsPrice}
            onChange={(event) => setPerceivedValueVsPrice(event.target.value)}
            required
          >
            <option value="">Select one</option>
            <option value="much_less">Much less</option>
            <option value="less">Less</option>
            <option value="equal">Equal</option>
            <option value="more">More</option>
            <option value="much_more">Much more</option>
          </select>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="mostValuableScan">
            Most valuable scan
          </label>
          <input
            id="mostValuableScan"
            className={styles.input}
            value={mostValuableScan}
            onChange={(event) => setMostValuableScan(event.target.value)}
            placeholder="Scan name or slug"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="leastValuableScan">
            Least valuable scan
          </label>
          <input
            id="leastValuableScan"
            className={styles.input}
            value={leastValuableScan}
            onChange={(event) => setLeastValuableScan(event.target.value)}
            placeholder="Scan name or slug"
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="keyTransformation">
          Biggest shift in how you see yourself
        </label>
        <textarea
          id="keyTransformation"
          className={styles.textarea}
          value={keyTransformation}
          onChange={(event) => setKeyTransformation(event.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="integrationChallenge">
          Hardest integration challenge
        </label>
        <textarea
          id="integrationChallenge"
          className={styles.textarea}
          value={integrationChallenge}
          onChange={(event) => setIntegrationChallenge(event.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="breakthroughMoment">
          Biggest breakthrough moment
        </label>
        <textarea
          id="breakthroughMoment"
          className={styles.textarea}
          value={breakthroughMoment}
          onChange={(event) => setBreakthroughMoment(event.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="wouldRecommend">
            Would you recommend the Perception scans?
          </label>
          <select
            id="wouldRecommend"
            className={styles.select}
            value={wouldRecommend}
            onChange={(event) => setWouldRecommend(event.target.value)}
          >
            <option value="">Select one</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="testimonialText">
            Testimonial (optional)
          </label>
          <textarea
            id="testimonialText"
            className={styles.textarea}
            value={testimonialText}
            onChange={(event) => setTestimonialText(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={testimonialConsent}
          onChange={(event) => setTestimonialConsent(event.target.checked)}
        />
        I give permission to use this testimonial.
      </label>
    </BaseFeedbackForm>
  );
}
