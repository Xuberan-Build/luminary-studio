"use client";

import { useState } from "react";
import styles from "./contact.module.css";

export default function ContactSection() {
  const [mode, setMode] = useState<"email" | "calendar">("email");

  return (
    <section aria-labelledby="contact-heading" className={styles.contactSection}>
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
              src="https://i.ibb.co/5kBrLSz/Austin-Headshot-cropped-2-transformed-2.png"
              alt="Austin Santos professional headshot"
              className={styles.headshot}
              loading="lazy"
              width={300}
              height={300}
            />
          </div>

          <div className={styles.rightColumn}>
            {mode === "email" ? (
              <iframe
                title="Contact form"
                role="tabpanel"
                aria-label="Contact form"
                className={styles.iframe}
                src="https://docs.google.com/forms/d/e/1FAIpQLSfiOL95LteVJpnqd-au0uO1oSAY-lpc_LKqnAOpRb9G2eFhSg/viewform?embedded=true"
              />
            ) : (
              <iframe
                title="Appointment booking calendar"
                role="tabpanel"
                aria-label="Appointment booking calendar"
                className={styles.iframe}
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ14pSdT57UMffOY9pWiLb0z0b0tu9WUZuJ1q050pXyTC0ADfI3d_DsAf3HjiSs2AlSX-yWs7F5e?gv=true"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
