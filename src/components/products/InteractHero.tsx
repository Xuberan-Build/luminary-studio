"use client";
import styles from "./interact-hero.module.css";

interface InteractHeroProps {
  title: string;
  instructions: string;
  duration: string;
}

export default function InteractHero({ title, instructions, duration }: InteractHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.badge}>Let's Begin</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.instructions}>{instructions}</p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <span>Answer honestly ({duration})</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <span>Complete the GPT session</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <span>Blueprint emailed to you</span>
          </div>
        </div>
      </div>
    </section>
  );
}
