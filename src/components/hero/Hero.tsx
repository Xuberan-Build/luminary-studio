"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  onOpenResume: () => void;
  onOpenPortfolio: () => void;
};

export default function Hero({ onOpenResume, onOpenPortfolio }: Props) {
  const [navH, setNavH] = useState(0);
  const rafId = useRef<number | null>(null);
  const t0 = useRef<number | null>(null);
  const [shipTransform, setShipTransform] = useState<string>("translate3d(0,0,0)");

  useEffect(() => {
    const nav = document.querySelector('nav[aria-label="Main navigation"]') as HTMLElement | null;
    const read = () => setNavH(nav?.offsetHeight ?? 0);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  useEffect(() => {
    const step = (now: number) => {
      if (t0.current == null) t0.current = now;
      const t = (now - t0.current) / 1000;

      const vh = window.innerHeight || 1;
      const progressRaw = window.scrollY / (vh * 0.9);
      const p = Math.max(0, Math.min(1, progressRaw));

      const x = easeOutCubic(p) * 80;
      const yArc = -22 * Math.sin(p * Math.PI);
      const yBob = -6 * Math.sin(t * 2.2);

      setShipTransform(`translate3d(${x}px, ${yArc + yBob}px, 0)`);
      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const heroStyle = useMemo<React.CSSProperties>(
    () => ({
      minHeight: `calc(100svh - ${navH}px)`,
      display: "grid",
      gridTemplateColumns: "1fr",
      alignItems: "center",
      justifyItems: "center",
      padding: "clamp(1rem, 3vw, 2rem)",
      position: "relative",
      overflow: "visible", // ← CHANGED FROM "hidden"
      backgroundImage: "url('https://i.ibb.co/4TkDk2p/bg.png')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
      backgroundSize: "contain",
    }),
    [navH]
  );

  const contentStyle: React.CSSProperties = {
    width: "min(100%, 1200px)",
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "clamp(1rem, 3vw, 2rem)",
    alignItems: "center",
  };

  const shipWrapStyle: React.CSSProperties = {
    position: "relative",
    isolation: "isolate",
    display: "grid",
    placeItems: "center",
    minHeight: "min(50vh, 420px)",
  };

  const shipStyle: React.CSSProperties = {
    width: "min(90%, 520px)",
    aspectRatio: "3 / 2",
    transform: shipTransform,
    transition: "transform 120ms linear",
    filter: "drop-shadow(0 12px 24px rgba(0,0,0,.38))",
    willChange: "transform",
  };

  const headingStyle: React.CSSProperties = {
    margin: 0,
    color: "#fff",
    fontSize: "var(--step-3)",
    lineHeight: 1.2,
  };

  const taglineStyle: React.CSSProperties = {
    marginTop: "0.25rem",
    color: "var(--ink-soft)",
    fontSize: "var(--step-0)",
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: ".75rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  };

  return (
    <section aria-labelledby="hero-heading" style={heroStyle}>
      <div style={contentStyle} className="container">
        <div style={shipWrapStyle}>
          <img
            src="https://i.ibb.co/4PRWQnT/ship1.png"
            alt="Futuristic spaceship representing innovative marketing strategies"
            style={shipStyle}
            loading="eager"
            width={500}
            height={333}
            onMouseEnter={(e) => {
              e.currentTarget.style.transition = "transform 140ms ease";
              e.currentTarget.style.transform = `${shipTransform} scale(1.03)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transition = "transform 140ms ease";
              e.currentTarget.style.transform = shipTransform;
            }}
          />
        </div>

        <div>
          <h1 id="hero-heading" style={headingStyle}>
            Mastering The Art of Creating &amp; Adding Value
          </h1>
          <p style={taglineStyle}>Co-Creating Asset Vehicles for Scalable Growth.</p>

          <div style={btnRow}>
            <button
              className="btn right-btn"
              aria-label="View portfolio of marketing projects"
              onClick={onOpenPortfolio}
            >
              See Portfolio
            </button>

            <button
              className="btn left-btn"
              aria-label="View professional experience"
              onClick={onOpenResume}
            >
              See Experience
            </button>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-20% -10% auto",
          height: "60%",
          background:
            "radial-gradient(60% 60% at 40% 45%, rgba(93,63,211,.22), rgba(93,63,211,0) 70%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </section>
  );
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
