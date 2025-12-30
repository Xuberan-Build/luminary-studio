export type PortfolioCase = {
  title: string;
  summary: string;
  bullets: string[];
  quote?: string;
  cite?: string;
};

export const portfolioCases: PortfolioCase[] = [
  {
    title: "Digital Marketing Transformation - Locus Digital",
    summary:
      "Transformed the legacy 'Site Booster' into a focused campaign engine and fulfillment system.",
    bullets: [
      "300% improvement in client retention",
      "20x increase in lifetime value",
      "150+ integrated B2B campaigns shipped",
      "10× growth in content engagement",
    ],
    quote:
      "Austin has been an amazing Marketing Strategist for our growing company. Organizational skills and professionalism are unmatched.",
    cite: "Abe Rubarts, Founder & CEO - Locus Digital",
  },
  {
    title: "SEO Visibility Growth - Amcon Consultants",
    summary:
      "From near-zero branded visibility to exponential growth via on-page fixes, messaging, and service clarity.",
    bullets: [
      "15,900% increase in page visits",
      "1,400% increase in leads",
      "$125,000 additional monthly revenue",
      "Branded ranking from #60 -> #20 in a week",
    ],
    quote: "With Austin we saw 5× growth in leads and 10× ROI.",
    cite: "Sean Pandya, Principal - Amcon Consultants",
  },
  {
    title: "Technical SEO Optimization - Resolved Analytics",
    summary:
      "Implemented canonicalization, internal linking, and content refinements to lift conversions.",
    bullets: [
      "2x conversion rate",
      "Improved qualified traffic",
      "Solid technical SEO foundation established",
    ],
    quote:
      "The project was a resounding success - clear impact from a strong technical SEO foundation.",
    cite: "Stewart Bible",
  },
  {
    title: "Traffic & Keyword Growth - Swish Dental",
    summary: "Targeted content program and keyword expansion to widen organic reach.",
    bullets: [
      "Monthly visits from 4,200 -> 7,600",
      "Added 216 new ranking keywords",
      "Sustained organic growth",
    ],
    quote: "Congrats on Swish. Y'all murked it.",
    cite: "Josh Hampson, Founder - HMPSN Studio",
  },
];
