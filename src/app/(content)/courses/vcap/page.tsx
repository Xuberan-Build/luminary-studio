import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import ModuleCard from "@/components/courses/ModuleCard";
import SacredGeometry from "@/components/courses/SacredGeometry";
import styles from "./vcap.module.css";

export const metadata: Metadata = {
  title: "Visionary Creator's Activation Protocol - Quantum Strategies",
  description:
    "Reprogram your consciousness for creative life mastery. Master the 10 presuppositions of NLP, discover your Life's Task, and build systems that turn consciousness into commerce.",
};

// Load course and module data
function getCourseData() {
  const coursePath = path.join(
    process.cwd(),
    "src/content/courses/vcap/course.json"
  );
  return JSON.parse(fs.readFileSync(coursePath, "utf-8"));
}

function getModuleData(moduleId: string) {
  const modulePath = path.join(
    process.cwd(),
    `src/content/courses/vcap/modules/${moduleId}/module.json`
  );
  return JSON.parse(fs.readFileSync(modulePath, "utf-8"));
}

export default function VCAPCoursePage() {
  const course = getCourseData();
  const modules = course.modules.map((m: any) => getModuleData(m.id));

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <SacredGeometry variant="circles" opacity={0.08} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>Course</div>
          <h1 className={styles.heroTitle}>{course.title}</h1>
          <p className={styles.heroSubtitle}>{course.tagline}</p>
          <p className={styles.heroDescription}>{course.description}</p>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>📚</span>
              <span className={styles.indicatorValue}>{course.stats.modules}</span>
              <span className={styles.indicatorLabel}>Modules</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>🎯</span>
              <span className={styles.indicatorValue}>{course.stats.totalSlides}+</span>
              <span className={styles.indicatorLabel}>Interactive Slides</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>⏱️</span>
              <span className={styles.indicatorValue}>{course.stats.totalDuration}</span>
              <span className={styles.indicatorLabel}>Total Duration</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>♾️</span>
              <span className={styles.indicatorValue}>{course.stats.students}</span>
              <span className={styles.indicatorLabel}>Potential</span>
            </div>
          </div>

          <div className={styles.heroCTA}>
            <Link href="#modules" className={styles.primaryButton}>
              Begin Protocol →
            </Link>
            <Link href="#curriculum" className={styles.secondaryButton}>
              View Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* What You'll Transform */}
      <section className={styles.transformSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Consciousness-to-Success Pipeline</h2>
          <p className={styles.sectionSubtitle}>
            Three integrated modules that transform how you think, what you pursue, and how you
            execute
          </p>

          <div className={styles.transformGrid}>
            <div className={styles.transformCard}>
              <div className={styles.transformNumber}>01</div>
              <h3 className={styles.transformTitle}>Transform Your Operating System</h3>
              <p className={styles.transformSubtitle}>Module 1: Identity & Presuppositions</p>
              <ul className={styles.transformList}>
                <li>Eliminate self-sabotage at the unconscious level</li>
                <li>Embody your highest values naturally</li>
                <li>Develop unshakeable confidence</li>
              </ul>
            </div>

            <div className={styles.transformCard}>
              <div className={styles.transformNumber}>02</div>
              <h3 className={styles.transformTitle}>Design Your Divine Blueprint</h3>
              <p className={styles.transformSubtitle}>Module 2: Vision & Mission</p>
              <ul className={styles.transformList}>
                <li>Discover your authentic Life's Task</li>
                <li>Create magnetic pull toward desires</li>
                <li>Align purpose with strategy</li>
              </ul>
            </div>

            <div className={styles.transformCard}>
              <div className={styles.transformNumber}>03</div>
              <h3 className={styles.transformTitle}>Build Your Success Architecture</h3>
              <p className={styles.transformSubtitle}>Module 3: Strategic Frameworks</p>
              <ul className={styles.transformList}>
                <li>Create predictable results through systems</li>
                <li>Become the obvious choice in your market</li>
                <li>Turn consciousness into commerce</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Curriculum */}
      <section id="curriculum" className={styles.curriculumSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Complete Curriculum</h2>
          <p className={styles.sectionSubtitle}>
            Three comprehensive modules with interactive slides, video recitations, and integration
            exercises
          </p>

          <div id="modules" className={styles.modulesTimeline}>
            {modules.map((module: any, index: number) => (
              <div key={module.id} className={styles.timelineItem}>
                {index < modules.length - 1 && <div className={styles.connector} />}
                <ModuleCard
                  number={module.number}
                  title={module.title}
                  subtitle={module.subtitle}
                  description={module.description}
                  highlights={module.highlights}
                  outcome={module.outcome}
                  icon={module.icon}
                  color={module.color}
                  href={`/courses/vcap/module/${module.id}`}
                  isLocked={false}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Inevitable Result */}
      <section className={styles.outcomeSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Inevitable Result</h2>
          <div className={styles.outcomeContent}>
            <p className={styles.outcomeParagraph}>
              You won't just have a business plan sitting in a drawer. You'll have fundamentally
              transformed <strong>who you are</strong> at the identity level.
            </p>
            <p className={styles.outcomeParagraph}>
              Your consciousness will naturally create value. Your authentic self will magnetically
              attract the right opportunities. Your strategic actions will manifest your desired
              outcomes.
            </p>
            <p className={styles.outcomeParagraph}>
              This isn't theory. It's a protocol—a systematic reprogramming of your unconscious
              operating system through proven NLP and Psychocybernetics frameworks.
            </p>
          </div>
        </div>
      </section>

      {/* Enrollment CTA */}
      <section className={styles.enrollSection}>
        <div className={styles.container}>
          <div className={styles.enrollCard}>
            <h2 className={styles.enrollTitle}>Begin Your Activation</h2>
            <p className={styles.enrollDescription}>
              Start with Module 1 free. No credit card required. Experience the protocol before
              committing.
            </p>
            <div className={styles.enrollButtons}>
              <Link href="/courses/vcap/module/module1" className={styles.enrollButton}>
                Start Free Preview →
              </Link>
              <div className={styles.enrollNote}>
                Preview includes full access to Module 1's interactive slideshow
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Common Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How long does it take to complete?</h3>
              <p className={styles.faqAnswer}>
                The protocol includes 8 hours of content across 3 modules. Most participants
                complete it over 2-3 weeks, spending 30-60 minutes per session. However, you have
                lifetime access to go at your own pace.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Do I need prior experience with NLP?</h3>
              <p className={styles.faqAnswer}>
                No prior experience needed. The protocol is designed to be accessible while
                maintaining depth. We break down complex NLP and Psychocybernetics concepts into
                practical, actionable frameworks.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How is this different from other courses?</h3>
              <p className={styles.faqAnswer}>
                Most courses focus on tactics without transforming identity. VCAP starts with
                reprogramming your unconscious operating system. The interactive slideshow format
                creates deeper retention than passive video watching.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I access on mobile?</h3>
              <p className={styles.faqAnswer}>
                Yes! The course is fully responsive. The interactive slideshows work on all
                devices, though we recommend desktop/tablet for the best experience with the
                larger visual elements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
