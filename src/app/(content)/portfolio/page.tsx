import styles from "./portfolio.module.css";
import { portfolioCases } from "@/lib/constants/portfolio";

export const metadata = {
  title: "Case Studies | Quantum Strategies",
  description:
    "A portfolio of strategic marketing transformations and measurable growth outcomes.",
  alternates: {
    canonical: "https://quantumstrategies.online/portfolio/",
  },
};

export default function PortfolioPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.heroContent} container`}>
          <p className={styles.eyebrow}>Case Studies</p>
          <h1 className={styles.title}>Portfolio of Strategic Growth</h1>
          <p className={styles.subtitle}>
            Evidence-backed results across acquisition, retention, and revenue systems. Each case
            study highlights the strategic decisions, execution, and impact delivered.
          </p>
        </div>
      </section>

      <section className={`${styles.gridSection} container`}>
        <div className={styles.grid}>
          {portfolioCases.map((entry) => (
            <article key={entry.title} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{entry.title}</h3>
                <p className={styles.cardSummary}>{entry.summary}</p>
              </div>
              <ul className={styles.cardList}>
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {entry.quote && (
                <blockquote className={styles.cardQuote}>
                  {entry.quote}
                  {entry.cite && <footer>{entry.cite}</footer>}
                </blockquote>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`${styles.ctaInner} container`}>
          <h2>Ready to build your next growth story?</h2>
          <p>
            Share your goals and I will map the exact systems to reach them.
          </p>
          <a className={styles.ctaButton} href="mailto:austin.j.santos.93@gmail.com">
            Start a project -&gt;
          </a>
        </div>
      </section>
    </div>
  );
}
