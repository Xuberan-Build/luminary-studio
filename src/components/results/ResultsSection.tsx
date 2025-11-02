"use client";

import { useEffect, useRef } from "react";
import styles from "./results.module.css";

type Card = { title: string; copy: string; depth: number };

const CARDS: Card[] = [
  {
    title: "$8M+ in Direct Sales",
    copy: "Generated $8M in direct sales and $20M+ in pipeline via optimized multi-channel campaigns.",
    depth: 0.25,
  },
  {
    title: "300% Client Retention",
    copy: "Strategic frameworks and productization increased retention and LTV.",
    depth: 0.5,
  },
  {
    title: "8× Lead Growth",
    copy: "Targeted acquisition systems and a compounding content engine.",
    depth: 0.8,
  },
];

export default function ResultsSection() {
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const sphereRef = useRef<HTMLDivElement | null>(null);
  const ringsRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cards = Array.from(
      cardsRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []
    );

    let raf: number | null = null;
    let yTarget = window.scrollY;
    let yCurrent = yTarget;

    let baseOffset = Math.round(window.innerHeight * 0.33);
    const onResize = () => {
      baseOffset = Math.round(window.innerHeight * 0.25);
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      yCurrent = lerp(yCurrent, yTarget, 0.12);
      const y = yCurrent;
      const vh = Math.max(1, window.innerHeight);

      // Parallax cards
      cards.forEach((el) => {
        const strength = 0.23;
        const travel = baseOffset - y * strength;
        el.style.transform = `translate3d(0, ${travel}px, 0)`;
      });

      // Sphere animation
      if (sphereRef.current) {
        const driftY = (y / vh) * -140;
        const z = -y * 0.6;
        const scale = 1 + (y / (vh * 0.9)) * 0.35;
        const rot = y * 0.08;
        sphereRef.current.style.transform = `translate3d(0, ${driftY}px, ${z}px) scale(${scale}) rotateZ(${rot}deg)`;
      }

      // Rings parallax
      if (ringsRef.current) {
        const py = -(y * 0.12);
        ringsRef.current.style.transform = `translate3d(0, ${py}px, 0)`;
      }

      // Stars parallax
      if (starsRef.current) {
        const py = -(y * 0.06);
        starsRef.current.style.transform = `translate3d(0, ${py}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      yTarget = window.scrollY;
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section aria-labelledby="results-heading" className={styles.resultsSection}>
      <div aria-hidden="true" ref={starsRef} className={styles.stars} />
      <div aria-hidden="true" ref={ringsRef} className={styles.rings} />
      <div aria-hidden="true" ref={sphereRef} className={styles.sphere} />
      
      <div className={styles.container}>
        <header className={styles.headerWrap}>
          <h2 id="results-heading" className={styles.title}>
            Results of Execution
          </h2>
          <p className={styles.subtitle}>A few highlights from recent work.</p>
        </header>

        <div ref={cardsRef} className={styles.cardsWrap}>
          {CARDS.map(({ title, copy, depth }, i) => (
            <article 
              key={i} 
              data-card 
              data-depth={depth} 
              className={styles.card}
              aria-label={title}
            >
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardCopy}>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
