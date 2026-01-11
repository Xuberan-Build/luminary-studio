'use client';

import styles from './BetaFeedbackForm.module.css';

interface RatingScaleProps {
  label: string;
  name: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
  hint?: string;
}

export default function RatingScale({
  label,
  name,
  min,
  max,
  value,
  onChange,
  required,
  hint,
}: RatingScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return (
    <fieldset className={styles.ratingScale}>
      <legend className={styles.ratingLegend}>{label}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.ratingOptions}>
        {options.map((option) => (
          <span className={styles.ratingOption} key={option}>
            <input
              type="radio"
              id={`${name}-${option}`}
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              required={required}
            />
            <label htmlFor={`${name}-${option}`}>{option}</label>
          </span>
        ))}
      </div>
    </fieldset>
  );
}
