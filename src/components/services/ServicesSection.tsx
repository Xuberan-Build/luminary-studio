"use client";

import { useState } from "react";

export default function ServicesSection() {
  const [activeCard, setActiveCard] = useState(2);

  const cards = [
    {
      id: 1,
      title: "Optimize Your Marketing Infrastructure",
      body: "I'll help you rebuild your marketing systems for maximum efficiency and scale. I've delivered 500% business growth and identified $150,000+ in annual cost savings through strategic optimization.",
    },
    {
      id: 2,
      title: "Maximize Your Customer Value",
      body: "I'll develop strategies to transform your customer relationships into long-term partnerships. My approach has increased customer lifetime value by 20X through targeted engagement programs.",
    },
    {
      id: 3,
      title: "Drive Revenue Through Strategic Campaigns",
      body: "I'll create and execute campaigns that deliver measurable business impact. I've personally generated over $8M in direct sales and over $20,000,000 in pipeline value across 150+ successful campaigns.",
    },
    {
      id: 4,
      title: "Execute Your Marketing Vision",
      body: "I'll help transform your marketing vision into actionable results. My strategic approach consistently achieves 8% month-over-month organic growth while optimizing acquisition costs.",
    },
  ];

  const card = cards.find((c) => c.id === activeCard)!;

  return (
    <section
      aria-labelledby="services-heading"
      className="container services-section"
      style={{ paddingBlock: "3rem", color: "white" }}
    >
      <h2
        id="services-heading"
        style={{ margin: 0, fontSize: "var(--step-2)", lineHeight: 1.2 }}
      >
        Strategic Execution That Powers Business Growth
      </h2>

      <div
        className="services-grid"
        style={{
          position: "relative",
          display: "grid",
          gap: "2rem",
          alignItems: "center",
          gridTemplateColumns: "1.2fr .8fr",
          marginTop: "2rem",
        }}
      >
        <article
          style={{
            background: "rgba(0,0,0,.8)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,.45)",
            padding: "2rem",
            border: "1px solid rgba(206,190,255,.15)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: ".75rem",
              fontSize: "var(--step-1)",
              color: "#fff",
            }}
          >
            {card.title}
          </h3>
          <p style={{ margin: 0, color: "white", opacity: 0.9 }}>{card.body}</p>
        </article>

        <div
          className="saturn-container"
          style={{ position: "relative", width: "100%", maxWidth: 620, justifySelf: "end" }}
        >
          <img
            src="https://i.ibb.co/wSRxNJF/Saturn-trans-transformed.png"
            alt="Saturn planet graphic"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,.45))",
            }}
            loading="lazy"
          />

          <div
            className="moons-container"
            style={{
              position: "absolute",
              left: "12%",
              bottom: "10%",
              display: "flex",
              gap: "1.25rem",
            }}
            role="tablist"
            aria-label="Service navigation"
          >
            {cards.map((c) => {
              const isActive = activeCard === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCard(c.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`card-${c.id}`}
                  aria-label={`Step ${c.id}`}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background: isActive ? "#ffffff" : "rgba(255,255,255,.55)",
                    boxShadow: isActive
                      ? "0 6px 16px rgba(255,255,255,.35)"
                      : "0 4px 12px rgba(0,0,0,.25)",
                    transition: "transform .15s ease, background .2s ease, box-shadow .2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                />
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .services-section h2 {
            font-size: clamp(1.5rem, 5vw, 2rem) !important;
            text-align: center;
          }
          
          .services-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .services-grid article {
            padding: 1.5rem !important;
          }
          
          .saturn-container {
            max-width: 100% !important;
            justify-self: center !important;
          }
          
          .moons-container {
            left: 50% !important;
            bottom: 5% !important;
            transform: translateX(-50%);
            gap: 0.75rem !important;
            justify-content: center;
          }
          
          .moons-container button {
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </section>
  );
}
