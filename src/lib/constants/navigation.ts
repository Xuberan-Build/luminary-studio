export interface NavLink {
  label: string;
  href?: string;
  description?: string;
  submenu?: NavLink[];
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
              {
                label: "Articles",
                href: "/articles",
                submenu: [
                  {
                    label: "Customer Acquisition",
                    submenu: [
                      { label: "Complete Guide", href: "/articles/customer-acquisition" },
                      { label: "B2B Digital Marketing", href: "/articles/b2b-digital-marketing-strategy" },
                      { label: "SEO Lead Generation", href: "/articles/seo-lead-generation" },
                      { label: "Content Marketing", href: "/articles/content-marketing" },
                    ],
                  },
                  {
                    label: "Operations",
                    submenu: [
                      { label: "Automation Tools", href: "/articles/automation-tools" },
                      { label: "CRM Implementation", href: "/articles/crm-implementation" },
                      { label: "Marketing Operations", href: "/articles/marketing-operations" },
                    ],
                  },
                  {
                    label: "Product Development",
                    submenu: [
                      { label: "MVP Strategy", href: "/articles/mvp-strategy" },
                      { label: "Product Market Fit", href: "/articles/product-market-fit" },
                      { label: "User Research", href: "/articles/user-research" },
                    ],
                  },
                ],
              },
              { label: "Courses", href: "/courses" },
              { label: "White Papers", href: "/whitepapers" },
              { label: "Blog", href: "/blog" },
            ],
          },
        ],
      },
    },
    {
      label: "Products",
      dropdown: [
        {
          label: "Quantum Initiation Protocol",
          href: "/products/quantum-initiation",
          description: "Your AI Brand Strategist - $7"
        },
      ],
    },
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
