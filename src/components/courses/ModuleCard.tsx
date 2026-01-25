import Link from "next/link";
import styles from "./module-card.module.css";

interface ModuleCardProps {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  outcome: string;
  icon: string;
  color: string;
  href: string;
  isLocked?: boolean;
}

export default function ModuleCard({
  number,
  title,
  subtitle,
  description,
  highlights,
  outcome,
  icon,
  color,
  href,
  isLocked = false,
}: ModuleCardProps) {
  return (
    <div className={styles.card} style={{ borderLeftColor: color }}>
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
          <span className={styles.icon}>{icon}</span>
        </div>
        <div className={styles.headerContent}>
          <div className={styles.moduleNumber}>Module {number}</div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.highlights}>
        <h4 className={styles.highlightsTitle}>Key Components:</h4>
        <ul className={styles.highlightsList}>
          {highlights.map((highlight, idx) => (
            <li key={idx}>{highlight}</li>
          ))}
        </ul>
      </div>

      <div className={styles.outcome}>
        <strong>Outcome:</strong> {outcome}
      </div>

      <Link
        href={isLocked ? "#" : href}
        className={`${styles.cta} ${isLocked ? styles.locked : ""}`}
      >
        {isLocked ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Complete Previous Module
          </>
        ) : (
          <>
            Open Module {number} in Portal →
          </>
        )}
      </Link>
    </div>
  );
}
