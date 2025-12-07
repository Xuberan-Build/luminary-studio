export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export interface MegaMenuConfig {
  label: string;
  sections: NavSection[];
}

export const navigationConfig = {
  main: [
    { label: "Home", href: "/" },
    {
      label: "About",
      dropdown: [
        { label: "Meet Austin", href: "/meet", description: "Learn about the founder" },
        { label: "Our Values", href: "/values", description: "What drives us" },
      ],
    },
    {
      label: "Resources",
      megaMenu: {
        sections: [
          {
            title: "Content Types",
            links: [
              { label: "All Articles", href: "/articles" },
              { label: "Courses", href: "/courses" },
              { label: "White Papers", href: "/whitepapers" },
              { label: "Blog", href: "/blog" },
            ],
          },
          {
            title: "Customer Acquisition",
            links: [
              { label: "Complete Guide", href: "/articles/customer-acquisition" },
              { label: "B2B Digital Marketing", href: "/articles/b2b-digital-marketing-strategy" },
              { label: "SEO Lead Generation", href: "/articles/seo-lead-generation" },
              { label: "Content Marketing", href: "/articles/content-marketing" },
            ],
          },
          {
            title: "Product & Operations",
            links: [
              { label: "Product Market Fit", href: "/articles/product-market-fit" },
              { label: "MVP Strategy", href: "/articles/mvp-strategy" },
              { label: "Marketing Operations", href: "/articles/marketing-operations" },
              { label: "CRM Implementation", href: "/articles/crm-implementation" },
            ],
          },
        ],
      },
    },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    company: [
      { label: "About", href: "/meet" },
      { label: "Values", href: "/values" },
      { label: "Contact", href: "/contact" },
    ],
    resources: [
      { label: "Articles", href: "/articles" },
      { label: "Courses", href: "/courses" },
      { label: "White Papers", href: "/whitepapers" },
      { label: "Blog", href: "/blog" },
    ],
    work: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Case Studies", href: "/portfolio#case-studies" },
      { label: "Results", href: "/#results" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};
