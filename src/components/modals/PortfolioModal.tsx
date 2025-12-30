import Modal from "./Modal";
import { portfolioCases } from "@/lib/constants/portfolio";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PortfolioModal({ isOpen, onClose }: Props) {
  return (
    <Modal title="SEO Portfolio" isOpen={isOpen} onClose={onClose}>
      <div
        className="stack"
        style={{
          marginTop: ".25rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        {portfolioCases.map((c) => (
          <article
            key={c.title}
            style={{
              borderRadius: "16px",
              padding: "1rem 1.25rem",
              background: "rgba(93,63,211,.14)",
              border: "1px solid rgba(206,190,255,.22)",
              boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            }}
          >
            <h3 style={{ margin: 0, color: "#fff" }}>{c.title}</h3>
            <p style={{ marginTop: ".5rem" }}>{c.summary}</p>
            <ul style={{ margin: ".5rem 0 0 1rem" }}>
              {c.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: ".25rem" }}>
                  {b}
                </li>
              ))}
            </ul>
            {c.quote && (
              <blockquote
                style={{
                  margin: "0.75rem 0 0",
                  paddingLeft: "1rem",
                  borderLeft: "3px solid rgba(206,190,255,.35)",
                  opacity: 0.9,
                }}
              >
                {c.quote}
                {c.cite && (
                  <footer style={{ marginTop: ".25rem", opacity: 0.8 }}>— {c.cite}</footer>
                )}
              </blockquote>
            )}
          </article>
        ))}
      </div>
    </Modal>
  );
}
