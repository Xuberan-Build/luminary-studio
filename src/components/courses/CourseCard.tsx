import Link from "next/link";
import styles from "./course-card.module.css";

interface CourseCardProps {
  title: string;
  tagline: string;
  icon: string;
  modules: number;
  duration: string;
  status: "preview" | "enrolled" | "locked";
  href: string;
  outcomes?: string[];
}

export default function CourseCard({
  title,
  tagline,
  icon,
  modules,
  duration,
  status,
  href,
  outcomes = [],
}: CourseCardProps) {
  const statusConfig = {
    preview: { label: "Free Preview", color: "#10B981" },
    enrolled: { label: "Continue Learning", color: "#5D3FD3" },
    locked: { label: "Enroll Now", color: "#9333EA" },
  };

  const currentStatus = statusConfig[status];

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.tagline}>{tagline}</p>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {modules} Modules
          </span>
          <span className={styles.stat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {duration}
          </span>
        </div>

        {outcomes.length > 0 && (
          <ul className={styles.outcomes}>
            {outcomes.slice(0, 3).map((outcome, idx) => (
              <li key={idx}>{outcome}</li>
            ))}
          </ul>
        )}

        <div className={styles.statusBadge} style={{ backgroundColor: currentStatus.color }}>
          {currentStatus.label} →
        </div>
      </div>
    </Link>
  );
}
