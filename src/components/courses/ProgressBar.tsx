import styles from "./progress-bar.module.css";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: string;
}

export default function ProgressBar({
  current,
  total,
  label,
  color = "#5D3FD3",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className={styles.container}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.stats}>
            {current} / {total} ({percentage}%)
          </span>
        </div>
      )}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
