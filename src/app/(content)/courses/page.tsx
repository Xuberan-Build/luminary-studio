import { Metadata } from "next";
import Link from "next/link";
import CourseCard from "@/components/courses/CourseCard";
import SacredGeometry from "@/components/courses/SacredGeometry";
import styles from "./courses.module.css";

export const metadata: Metadata = {
  title: "Courses - Quantum Strategies",
  description:
    "Transform your consciousness and business strategy with our comprehensive courses. From identity transformation to strategic frameworks, master the bridge between consciousness and commerce.",
  alternates: {
    canonical: "https://quantumstrategies.online/courses/",
  },
};

const courses = [
  {
    id: "vcap",
    title: "Visionary Creator's Activation Protocol",
    tagline: "Reprogram Your Consciousness for Creative Life Mastery",
    icon: "🧠",
    modules: 3,
    duration: "8 hours",
    status: "preview" as const,
    href: "/courses/vcap",
    outcomes: [
      "Eliminate self-sabotage at unconscious level",
      "Discover authentic Life's Task",
      "Create predictable results through systems",
    ],
  },
];

export default function CoursesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.portalBanner}>
        Portal access required. You will be redirected to sign in or create an account.
      </div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <SacredGeometry variant="minimal" opacity={0.1} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Quantum Learning Experiences</h1>
          <p className={styles.heroSubtitle}>
            Where consciousness meets commerce. Transform your identity, clarify your vision, and
            build systems that create predictable results.
          </p>
          <p className={styles.heroSubtitle}>
            Access is delivered inside your portal.
          </p>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorValue}>∞</span>
              <span className={styles.indicatorLabel}>Transformation Potential</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorValue}>125+</span>
              <span className={styles.indicatorLabel}>Interactive Slides</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorValue}>7</span>
              <span className={styles.indicatorLabel}>Core Modules</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorValue}>18+</span>
              <span className={styles.indicatorLabel}>Hours of Content</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className={styles.coursesSection}>
        <div className={styles.container}>
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Quantum Strategies */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Quantum Strategies?</h2>
          <p className={styles.sectionSubtitle}>
            Our approach integrates consciousness work with strategic business frameworks
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🧠</div>
              <h3 className={styles.featureTitle}>Consciousness-First</h3>
              <p className={styles.featureDescription}>
                Transform your identity and unconscious operating system before building strategy.
                True success flows from who you are, not just what you do.
              </p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Strategic Frameworks</h3>
              <p className={styles.featureDescription}>
                Proven systems and frameworks from NLP, Psychocybernetics, and business strategy.
                No fluff—just practical tools that create measurable results.
              </p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Energy + Commerce</h3>
              <p className={styles.featureDescription}>
                Bridge the gap between spiritual growth and business success. Learn to manifest
                through strategic action, not wishful thinking.
              </p>
            </div>
          </div>

          <div className={styles.socialProof}>
            <blockquote className={styles.testimonial}>
              <p>
                "This isn't another business course. It's a complete reprogramming of how you think
                about success, identity, and your place in the market. The slideshow format makes
                complex NLP concepts actually stick."
              </p>
              <footer>— Early Protocol Participant</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Begin Your Transformation</h2>
          <p className={styles.ctaDescription}>
            Start with the Visionary Creator's Activation Protocol inside your portal.
          </p>
          <Link href="/login?redirect=/dashboard/courses" className={styles.ctaButton}>
            Access Courses in Portal →
          </Link>
        </div>
      </section>
    </div>
  );
}
