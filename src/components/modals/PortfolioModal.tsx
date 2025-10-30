import Modal from "./Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Case = {
  title: string;
  summary: string;
  bullets: string[];
  quote?: string;
  cite?: string;
};

const cases: Case[] = [
  {
    title: "Digital Marketing Transformation — Locus Digital",
    summary:
      "Transformed the legacy 'Site Booster' into a focused campaign engine and fulfillment system.",
    bullets: [
      "300% improvement in client retention",
      "20× increase in lifetime value",
      "150+ integrated B2B campaigns shipped",
      "10× growth in content engagement",
    ],
    quote:
      "Austin has been an amazing Marketing Strategist for our growing company. Organizational skills and professionalism are unmatched.",
    cite: "Abe Rubarts, Founder & CEO — Locus Digital",
  },
  {
    title: "SEO Visibility Growth — Amcon Consultants",
    summary:
      "From near-zero branded visibility to exponential growth via on-page fixes, messaging, and service clarity.",
    bullets: [
      "15,900% increase in page visits",
      "1,400% increase in leads",
      "$125,000 additional monthly revenue",
      "Branded ranking from #60 → #20 in a week",
    ],
    quote: "With Austin we saw 5× growth in leads and 10× ROI.",
    cite: "Sean Pandya, Principal — Amcon Consultants",
  },
  {
    title: "Technical SEO Optimization — Resolved Analytics",
    summary:
      "Implemented canonicalization, internal linking, and content refinements to lift conversions.",
    bullets: [
      "2× conversion rate",
      "Improved qualified traffic",
      "Solid technical SEO foundation established",
    ],
    quote:
      "The project was a resounding success—clear impact from a strong technical SEO foundation.",
    cite: "Stewart Bible",
  },
  {
    title: "Traffic & Keyword Growth — Swish Dental",
    summary: "Targeted content program and keyword expansion to widen organic reach.",
    bullets: [
      "Monthly visits from 4,200 → 7,600",
      "Added 216 new ranking keywords",
      "Sustained organic growth",
    ],
    quote: "Congrats on Swish. Y'all murked it.",
    cite: "Josh Hampson, Founder — HMPSN Studio",
  },
];

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
        {cases.map((c) => (
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
