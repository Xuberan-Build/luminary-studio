'use client';

import { useRef, useState } from 'react';
import BaseFeedbackForm from './BaseFeedbackForm';
import RatingScale from './RatingScale';
import styles from './BetaFeedbackForm.module.css';

interface RiteTwoConsolidationFormProps {
  onSubmitted?: () => void;
}

export default function RiteTwoConsolidationForm({ onSubmitted }: RiteTwoConsolidationFormProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [overallValueScore, setOverallValueScore] = useState<number | null>(null);
  const [completionTimeWeeks, setCompletionTimeWeeks] = useState('');
  const [riteTwoNps, setRiteTwoNps] = useState<number | null>(null);
  const [mostValuableBlueprint, setMostValuableBlueprint] = useState('');
  const [leastValuableBlueprint, setLeastValuableBlueprint] = useState('');
  const [strategicClarityBefore, setStrategicClarityBefore] = useState<number | null>(null);
  const [strategicClarityAfter, setStrategicClarityAfter] = useState<number | null>(null);
  const [businessModelConfidence, setBusinessModelConfidence] = useState('');
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
          type: 'rite_two',
          surveyDurationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
          responses: {
            overall_value_score: overallValueScore,
            completion_time_weeks: completionTimeWeeks ? Number(completionTimeWeeks) : null,
            rite_two_nps: riteTwoNps,
            most_valuable_blueprint: mostValuableBlueprint.trim() || null,
            least_valuable_blueprint: leastValuableBlueprint.trim() || null,
            strategic_clarity_before: strategicClarityBefore,
            strategic_clarity_after: strategicClarityAfter,
            business_model_confidence: businessModelConfidence.trim() || null,
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
      title="Rite II Consolidation"
      description="A synthesis after all three Orientation blueprints."
      submitLabel="Submit Rite II Feedback"
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage="Rite II consolidation saved."
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
          label="Rite II NPS (0-10)"
          name="riteTwoNps"
          min={0}
          max={10}
          value={riteTwoNps}
          onChange={setRiteTwoNps}
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
            placeholder="e.g. 3"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="perceivedValueVsPrice">
            Value vs $21
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
          <label className={styles.label} htmlFor="mostValuableBlueprint">
            Most valuable blueprint
          </label>
          <input
            id="mostValuableBlueprint"
            className={styles.input}
            value={mostValuableBlueprint}
            onChange={(event) => setMostValuableBlueprint(event.target.value)}
            placeholder="Blueprint name or slug"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="leastValuableBlueprint">
            Least valuable blueprint
          </label>
          <input
            id="leastValuableBlueprint"
            className={styles.input}
            value={leastValuableBlueprint}
            onChange={(event) => setLeastValuableBlueprint(event.target.value)}
            placeholder="Blueprint name or slug"
          />
        </div>
      </div>

      <div className={styles.gridTwo}>
        <RatingScale
          label="Strategic clarity before"
          name="strategicClarityBefore"
          min={1}
          max={10}
          value={strategicClarityBefore}
          onChange={setStrategicClarityBefore}
          required
        />
        <RatingScale
          label="Strategic clarity after"
          name="strategicClarityAfter"
          min={1}
          max={10}
          value={strategicClarityAfter}
          onChange={setStrategicClarityAfter}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="businessModelConfidence">
          Business model confidence
        </label>
        <textarea
          id="businessModelConfidence"
          className={styles.textarea}
          value={businessModelConfidence}
          onChange={(event) => setBusinessModelConfidence(event.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="wouldRecommend">
            Would you recommend the Orientation blueprints?
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
