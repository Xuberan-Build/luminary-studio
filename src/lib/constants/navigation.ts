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
              { label: "Overview", href: "/resources/customer-acquisition" },
              { label: "B2B Digital Marketing", href: "/resources/customer-acquisition/b2b-digital-marketing-strategy" },
              { label: "SEO Lead Generation", href: "/resources/customer-acquisition/seo-customer-acquisition" },
              { label: "Content Marketing", href: "/resources/customer-acquisition/content-marketing-lead-generation" },
            ],
          },
          {
            title: "Product Development",
            links: [
              { label: "Overview", href: "/resources/product-development" },
              { label: "Product Market Fit", href: "/resources/product-development/product-market-fit-validation" },
              { label: "MVP Strategy", href: "/resources/product-development/mvp-development-strategy" },
              { label: "User Research", href: "/resources/product-development/user-research-methods" },
            ],
          },
          {
            title: "Operations & Systems",
            links: [
              { label: "Overview", href: "/resources/operations" },
              { label: "Marketing Operations", href: "/resources/operations/marketing-operations-setup" },
              { label: "CRM Implementation", href: "/resources/operations/crm-implementation-guide" },
              { label: "Automation Tools", href: "/resources/operations/marketing-automation-tools" },
            ],
          },
        ],
      },
    },
    { label: "Portfolio", href: "/portfolio" },
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
