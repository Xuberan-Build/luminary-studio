"use client";

import { useState } from "react";

export default function ContactSection() {
  const [mode, setMode] = useState<"email" | "calendar">("email");

  const wrap: React.CSSProperties = {
    width: "100%",
    padding: "clamp(.75rem, 1.25vw, 1.25rem) 0 clamp(1.5rem, 2.5vw, 2.5rem)",
    background:
      "linear-gradient(180deg, rgba(3,0,72,0) 0%, rgba(93,63,211,0.12) 20%, rgba(93,63,211,0.10) 100%)",
  };

  const container: React.CSSProperties = {
    width: "min(100% - 2rem, 1200px)",
    marginInline: "auto",
    display: "grid",
    gap: "clamp(1rem, 2.5vw, 2rem)",
  };

  const header: React.CSSProperties = {
    position: "sticky",
    top: "calc(env(safe-area-inset-top, 0px) + 0px)",
    padding: "0 .25rem",
    zIndex: 0,
  };

  const h2Style: React.CSSProperties = {
    margin: 0,
    color: "#fff",
    fontSize: "var(--step-2)",
    textAlign: "center",
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "clamp(1rem, 2vw, 1.5rem)",
    alignItems: "start",
  };

  const leftCol: React.CSSProperties = {
    display: "grid",
    gap: "1rem",
    justifyItems: "center",
  };

  const switches: React.CSSProperties = {
    display: "grid",
    gridAutoFlow: "column",
    gap: ".5rem",
    background: "rgba(93,63,211,.14)",
    border: "1px solid rgba(206,190,255,.25)",
    borderRadius: 999,
    padding: ".25rem",
  };

  const chip = (active: boolean): React.CSSProperties => ({
    appearance: "none",
    border: 0,
    padding: ".5rem .9rem",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
    color: active ? "#0b000f" : "var(--ink-soft)",
    background: active ? "var(--accent)" : "transparent",
    transition: "transform .15s ease, background .2s ease",
  });

  const headshot: React.CSSProperties = {
    width: "min(260px, 70vw)",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    borderRadius: "20px",
    border: "1px solid rgba(206,190,255,.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    background: "rgba(93,63,211,.12)",
  };

  const rightCol: React.CSSProperties = {
    minHeight: 520,
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(93,63,211,.10)",
    border: "1px solid rgba(206,190,255,.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  };

  const iframeStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: 520,
    border: 0,
    display: "block",
  };

  return (
    <section aria-labelledby="contact-heading" style={wrap}>
      <div style={container} className="container">
        <header style={header}>
          <h2 id="contact-heading" style={h2Style}>
            Contact
          </h2>
        </header>

        <div
          style={{
            ...grid,
            gridTemplateColumns: "1fr",
          }}
        >
          <style>{`
            @media (min-width: 900px){
              [data-contact-grid]{ 
                display:grid; 
                grid-template-columns: 0.9fr 1.1fr; 
                gap: clamp(1rem,2.5vw,2rem);
                align-items: start;
              }
            }
          `}</style>

          <div data-contact-grid>
            <div style={leftCol}>
              <div role="tablist" aria-label="Contact method selection" style={switches}>
                <button
                  role="tab"
                  aria-selected={mode === "email"}
                  onClick={() => setMode("email")}
                  style={chip(mode === "email")}
                >
                  Email
                </button>
                <button
                  role="tab"
                  aria-selected={mode === "calendar"}
                  onClick={() => setMode("calendar")}
                  style={chip(mode === "calendar")}
                >
                  Book a Call
                </button>
              </div>

              <img
                src="https://i.ibb.co/5kBrLSz/Austin-Headshot-cropped-2-transformed-2.png"
                alt="Austin Santos professional headshot"
                style={headshot}
                loading="lazy"
                width={300}
                height={300}
              />
            </div>

            <div style={rightCol}>
              {mode === "email" ? (
                <iframe
                  title="Contact form"
                  role="tabpanel"
                  aria-label="Contact form"
                  style={iframeStyle}
                  src="https://docs.google.com/forms/d/e/1FAIpQLSfiOL95LteVJpnqd-au0uO1oSAY-lpc_LKqnAOpRb9G2eFhSg/viewform?embedded=true"
                />
              ) : (
                <iframe
                  title="Appointment booking calendar"
                  role="tabpanel"
                  aria-label="Appointment booking calendar"
                  style={iframeStyle}
                  src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ14pSdT57UMffOY9pWiLb0z0b0tu9WUZuJ1q050pXyTC0ADfI3d_DsAf3HjiSs2AlSX-yWs7F5e?gv=true"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
