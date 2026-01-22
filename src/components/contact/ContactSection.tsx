"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./contact.module.css";

export default function ContactSection() {
  const [mode, setMode] = useState<"email" | "calendar">("email");
  const [isReady, setIsReady] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isReady) return;
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isReady]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className={styles.contactSection}
    >
      <div className={`${styles.container} container`}>
        <header className={styles.header}>
          <h2 id="contact-heading" className={styles.heading}>
            Contact
          </h2>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <div 
              role="tablist" 
              aria-label="Contact method selection" 
              className={styles.switchesContainer}
            >
              <button
                role="tab"
                aria-selected={mode === "email"}
                onClick={() => setMode("email")}
                className={`${styles.switchButton} ${
                  mode === "email" 
                    ? styles.switchButtonActive 
                    : styles.switchButtonInactive
                }`}
              >
                Email
              </button>
              <button
                role="tab"
                aria-selected={mode === "calendar"}
                onClick={() => setMode("calendar")}
                className={`${styles.switchButton} ${
                  mode === "calendar" 
                    ? styles.switchButtonActive 
                    : styles.switchButtonInactive
                }`}
              >
                Book a Call
              </button>
            </div>

            <img
              src="/images/headshot.webp"
              alt="Austin Santos professional headshot"
              className={styles.headshot}
              loading="lazy"
              width={300}
              height={300}
            />
          </div>

          <div className={styles.rightColumn}>
            {isReady && mode === "email" ? (
              <iframe
                title="Contact form"
                role="tabpanel"
                aria-label="Contact form"
                className={styles.iframe}
                src="https://docs.google.com/forms/d/e/1FAIpQLSfiOL95LteVJpnqd-au0uO1oSAY-lpc_LKqnAOpRb9G2eFhSg/viewform?embedded=true"
                loading="lazy"
              />
            ) : isReady ? (
              <iframe
                title="Appointment booking calendar"
                role="tabpanel"
                aria-label="Appointment booking calendar"
                className={styles.iframe}
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ14pSdT57UMffOY9pWiLb0z0b0tu9WUZuJ1q050pXyTC0ADfI3d_DsAf3HjiSs2AlSX-yWs7F5e?gv=true"
                loading="lazy"
              />
            ) : (
              <div className={styles.iframe} aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
