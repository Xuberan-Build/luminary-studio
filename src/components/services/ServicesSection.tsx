"use client";

import { useState } from "react";
import styles from "./services.module.css";

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
      className={`container ${styles.servicesSection}`}
    >
      <h2 id="services-heading" className={styles.heading}>
        Strategic Execution That Powers Business Growth
      </h2>

      <div className={styles.servicesGrid}>
        <article className={styles.card}>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <p className={styles.cardBody}>{card.body}</p>
        </article>

        <div className={styles.saturnContainer}>
          <img
            src="https://i.ibb.co/wSRxNJF/Saturn-trans-transformed.png"
            alt="Saturn planet graphic"
            className={styles.saturnImage}
            loading="lazy"
          />

          <div
            className={styles.moonsContainer}
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
                  className={`${styles.moonButton} ${
                    isActive ? styles.moonButtonActive : styles.moonButtonInactive
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
