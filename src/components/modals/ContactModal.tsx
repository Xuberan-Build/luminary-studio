"use client";

import Modal from "./Modal";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <Modal title="Get In Touch" isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: "1rem" }}>
        <p style={{ color: "#cebeff", marginBottom: "1.5rem" }}>
          Ready to drive measurable growth for your business? Let's discuss how I can help.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <a
            href="mailto:austin.j.santos.93@gmail.com"
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Email: austin.j.santos.93@gmail.com
          </a>

          <a
            href="tel:+19526882724"
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Phone: (952) 688-2724
          </a>

          <a
            href="https://www.linkedin.com/in/austinsantos"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            LinkedIn: /in/austinsantos
          </a>
        </div>
      </div>
    </Modal>
  );
}
