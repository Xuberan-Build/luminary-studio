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
            title: "Customer Acquisition",
            links: [
              { label: "Complete Guide", href: "/resources/customer-acquisition/complete-guide" },
              { label: "B2B Digital Marketing Strategy", href: "/resources/customer-acquisition/b2b-digital-marketing-strategy" },
              { label: "SEO Lead Generation", href: "/resources/customer-acquisition/seo-lead-generation" },
              { label: "Content Marketing", href: "/resources/customer-acquisition/content-marketing" },
            ],
          },
          {
            title: "Product Development",
            links: [
              { label: "Product Market Fit", href: "/resources/product-development/product-market-fit" },
              { label: "MVP Strategy", href: "/resources/product-development/mvp-strategy" },
              { label: "User Research", href: "/resources/product-development/user-research" },
            ],
          },
          {
            title: "Operations & Systems",
            links: [
              { label: "Marketing Operations", href: "/resources/operations/marketing-operations" },
              { label: "CRM Implementation", href: "/resources/operations/crm-implementation" },
              { label: "Automation Tools", href: "/resources/operations/automation-tools" },
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
      { label: "All Resources", href: "/resources" },
      { label: "Customer Acquisition", href: "/resources/customer-acquisition" },
      { label: "Product Development", href: "/resources/product-development" },
      { label: "Operations & Systems", href: "/resources/operations" },
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
