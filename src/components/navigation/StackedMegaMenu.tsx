"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./stacked-mega-menu.module.css";

interface Article {
  label: string;
  href: string;
}

interface Category {
  label: string;
  articles: Article[];
}

interface ContentType {
  label: string;
  href?: string;
  categories?: Category[];
}

interface StackedMegaMenuProps {
  isActive: (href: string) => boolean;
  onMouseLeave: () => void;
}

const contentTypes: ContentType[] = [
  {
    label: "Articles",
    href: "/articles",
    categories: [
      {
        label: "Customer Acquisition",
        articles: [
          { label: "Complete Guide", href: "/articles/customer-acquisition" },
          { label: "B2B Digital Marketing", href: "/articles/b2b-digital-marketing-strategy" },
          { label: "SEO Lead Generation", href: "/articles/seo-lead-generation" },
          { label: "Content Marketing", href: "/articles/content-marketing" },
        ],
      },
      {
        label: "Operations",
        articles: [
          { label: "Automation Tools", href: "/articles/automation-tools" },
          { label: "CRM Implementation", href: "/articles/crm-implementation" },
          { label: "Marketing Operations", href: "/articles/marketing-operations" },
        ],
      },
      {
        label: "Product Development",
        articles: [
          { label: "MVP Strategy", href: "/articles/mvp-strategy" },
          { label: "Product Market Fit", href: "/articles/product-market-fit" },
          { label: "User Research", href: "/articles/user-research" },
        ],
      },
    ],
  },
  {
    label: "Courses",
    href: "/courses",
    categories: [
      {
        label: "Visionary Creator's Activation Protocol",
        articles: [
          { label: "Reprogram Your Consciousness for Creative Life Mastery", href: "/courses/vcap" },
          { label: "3 Modules • 125+ Interactive Slides • 8 Hours", href: "/courses/vcap" },
          { label: "Preview Module 1 Free →", href: "/courses/vcap" },
        ],
      },
      {
        label: "Quantum Business Framework",
        articles: [
          { label: "Align Energy & Strategy for Sustainable Growth", href: "/courses/quantum-business-framework" },
          { label: "Quantum Initiation Protocol →", href: "/products/quantum-initiation" },
          { label: "Coming Soon: Consciousness Meets Commerce", href: "/courses" },
        ],
      },
    ],
  },
  {
    label: "White Papers",
    href: "/whitepapers",
    categories: [
      {
        label: "Energy & Business",
        articles: [
          { label: "Strategic Alignment: Bridging Consciousness & Commerce", href: "/whitepapers/strategic-alignment" },
          { label: "Conscious Leadership in Modern Business", href: "/whitepapers/conscious-leadership" },
          { label: "Energy Work as Competitive Advantage", href: "/whitepapers/energy-advantage" },
        ],
      },
      {
        label: "Transformation",
        articles: [
          { label: "From Hustle to Flow: Sustainable Growth", href: "/whitepapers/hustle-to-flow" },
          { label: "Quantum Leaps in Business Development", href: "/whitepapers/quantum-leaps" },
          { label: "The Awakened Entrepreneur Framework", href: "/whitepapers/awakened-entrepreneur" },
        ],
      },
    ],
  },
  { label: "Case Studies", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
];

export default function StackedMegaMenu({ isActive, onMouseLeave }: StackedMegaMenuProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleTypeHover = (label: string) => {
    setActiveType(label);
    setActiveCategory(null);
  };

  const handleCategoryHover = (label: string) => {
    setActiveCategory(label);
  };

  const activeTypeData = contentTypes.find((t) => t.label === activeType);
  const activeCategoryData = activeTypeData?.categories?.find((c) => c.label === activeCategory);

  return (
    <div className={styles.stackedMenu} onMouseLeave={onMouseLeave}>
      {/* Row 1: Content Types (Horizontal) - This IS the header */}
      <div className={`${styles.row} ${styles.headerRow}`}>
        {contentTypes.map((type) => (
          <div
            key={type.label}
            className={`${styles.typeItem} ${activeType === type.label ? styles.active : ""}`}
            onMouseEnter={() => handleTypeHover(type.label)}
          >
            {type.href ? (
              <Link href={type.href} className={styles.typeLink}>
                {type.label}
                {type.categories && <span className={styles.arrow}>▶</span>}
              </Link>
            ) : (
              <span className={styles.typeLabel}>
                {type.label}
                {type.categories && <span className={styles.arrow}>▶</span>}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Row 2: Categories (Horizontal) - Shows when hovering a type with categories */}
      {activeTypeData?.categories && (
        <div className={`${styles.row} ${styles.categoriesRow}`}>
          {activeTypeData.categories.map((category) => (
            <div
              key={category.label}
              className={`${styles.categoryItem} ${
                activeCategory === category.label ? styles.active : ""
              }`}
              onMouseEnter={() => handleCategoryHover(category.label)}
            >
              <span className={styles.categoryLabel}>
                {category.label}
                <span className={styles.arrow}>▶</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Row 3: Articles (Vertical List) - Shows when hovering a category */}
      {activeCategoryData && (
        <div className={`${styles.articlesRow}`}>
          {activeCategoryData.articles.map((article, idx) => (
            <Link
              key={`${article.label}-${idx}`}
              href={article.href}
              className={`${styles.articleLink} ${isActive(article.href) ? styles.active : ""}`}
            >
              • {article.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
