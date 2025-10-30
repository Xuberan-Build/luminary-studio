"use client";

import { useEffect, useMemo, useRef } from "react";

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

      cards.forEach((el) => {
        const strength = 0.23;
        const travel = baseOffset - y * strength;
        el.style.transform = `translate3d(0, ${travel}px, 0)`;
      });

      if (sphereRef.current) {
        const driftY = (y / vh) * -140;
        const z = -y * 0.6;
        const scale = 1 + (y / (vh * 0.9)) * 0.35;
        const rot = y * 0.08;
        sphereRef.current.style.transform = `translate3d(0, ${driftY}px, ${z}px) scale(${scale}) rotateZ(${rot}deg)`;
      }

      if (ringsRef.current) {
        const py = -(y * 0.12);
        ringsRef.current.style.transform = `translate3d(0, ${py}px, 0)`;
      }
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

  const wrapStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "relative",
      padding: "clamp(2rem, 5vh, 3rem) 0 clamp(4.5rem, 8vh, 6rem)",
      overflow: "clip",
      isolation: "isolate",
      perspective: "1400px",
    }),
    []
  );

  const stars: React.CSSProperties = {
    position: "absolute",
    inset: "-10% -10% -10% -10%",
    zIndex: -4,
    background:
      "radial-gradient(1200px 600px at 50% -10%, rgba(93,63,211,.18), rgba(93,63,211,0) 70%), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.055) 0 1px, transparent 1px 9px)",
    opacity: 0.75,
    transform: "translate3d(0,0,0)",
    willChange: "transform",
    pointerEvents: "none",
  };

  const rings: React.CSSProperties = {
    position: "absolute",
    inset: "-15% -15% -5% -15%",
    zIndex: -3,
    background:
      "radial-gradient(2200px 900px at 50% -20%, rgba(93,63,211,.22), rgba(93,63,211,0) 60%), repeating-radial-gradient(circle at 50% 0%, rgba(255,255,255,.04) 0 2px, transparent 2px 12px)",
    opacity: 0.9,
    transform: "translate3d(0,0,0)",
    willChange: "transform",
    pointerEvents: "none",
  };

  const sphere: React.CSSProperties = {
    position: "absolute",
    right: "max(-140px, 3vw)",
    top: "-60px",
    width: "min(44vw, 680px)",
    aspectRatio: "1/1",
    borderRadius: "50%",
    background:
      "radial-gradient(42% 42% at 48% 42%, rgba(165,135,255,.55), rgba(165,135,255,.16) 45%, rgba(165,135,255,.08) 62%, rgba(165,135,255,0) 76%)",
    boxShadow: "inset 0 -80px 140px rgba(0,0,0,.5), 0 50px 140px rgba(93,63,211,.32)",
    filter: "saturate(112%)",
    pointerEvents: "none",
    zIndex: -2,
    transformStyle: "preserve-3d",
    transform: "translate3d(0,0,0)",
    willChange: "transform",
  };

  const container: React.CSSProperties = {
    width: "min(100% - 2rem, 1200px)",
    marginInline: "auto",
    position: "relative",
    zIndex: 1,
  };

  const headerWrap: React.CSSProperties = {
    position: "sticky",
    top: "calc(env(safe-area-inset-top, 0px))",
    zIndex: 2,
    padding: "clamp(1.25rem, 3vh, 1.75rem) 0 .5rem",
    textAlign: "center",
    backdropFilter: "blur(2px)",
  };

  const title: React.CSSProperties = {
    margin: 0,
    color: "#fff",
    fontSize: "var(--step-2)",
  };

  const sub: React.CSSProperties = {
    margin: ".35rem 0 0",
    opacity: 0.87,
  };

  const cardsWrap: React.CSSProperties = {
    display: "grid",
    gap: "1.1rem",
    marginTop: "clamp(1rem, 4vh, 2rem)",
    paddingBottom: "clamp(3rem, 6vh, 4rem)",
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: "16px",
    padding: "1.5rem",
    background: "rgba(93,63,211,.16)",
    border: "1px solid rgba(206,190,255,.22)",
    boxShadow: "0 14px 36px rgba(0,0,0,.28)",
    maxWidth: 860,
    backdropFilter: "blur(2px)",
    willChange: "transform",
  };

  return (
    <section aria-labelledby="results-heading" style={wrapStyle}>
      <div aria-hidden="true" ref={starsRef} style={stars} />
      <div aria-hidden="true" ref={ringsRef} style={rings} />
      <div aria-hidden="true" ref={sphereRef} style={sphere} />
      <div style={container}>
        <header style={headerWrap}>
          <h2 id="results-heading" style={title}>
            Results of Execution
          </h2>
          <p style={sub}>A few highlights from recent work.</p>
        </header>

        <div ref={cardsRef} style={cardsWrap}>
          {CARDS.map(({ title, copy, depth }, i) => (
            <article key={i} data-card data-depth={depth} style={cardStyle} aria-label={title}>
              <h3 style={{ margin: 0, color: "#fff" }}>{title}</h3>
              <p style={{ marginTop: ".75rem" }}>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
