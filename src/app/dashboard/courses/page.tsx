import Link from 'next/link';
import styles from '../dashboard.module.css';
import vcapCourse from '@/content/courses/vcap/course.json';
import module1 from '@/content/courses/vcap/modules/module1/module.json';
import module2 from '@/content/courses/vcap/modules/module2/module.json';
import module3 from '@/content/courses/vcap/modules/module3/module.json';

export const dynamic = 'force-dynamic';

type VcapModule = typeof module1;

export default async function CoursesDashboard({
  searchParams,
}: {
  searchParams?: { module?: string };
}) {
  const vcapModuleById = new Map<string, VcapModule>([
    [module1.id, module1],
    [module2.id, module2],
    [module3.id, module3],
  ]);

  const vcapModules = vcapCourse.modules
    .map((moduleEntry) => vcapModuleById.get(moduleEntry.id))
    .filter((module): module is VcapModule => Boolean(module));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Courses</h1>
        <p className={styles.subtitle}>
          Continue your portal courses and open a module to begin.
        </p>
        <div className={styles.tabRow}>
          <Link
            href="/dashboard/products"
            className={styles.tabLink}
          >
            Products
          </Link>
          <Link
            href="/dashboard/courses"
            className={`${styles.tabLink} ${styles.tabLinkActive}`}
          >
            Courses
          </Link>
          <Link href="/dashboard/affiliate" className={styles.tabLink}>
            Affiliate
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Available Courses</h2>
          <div className={styles.coursesGrid}>
            <div className={styles.courseCard} id="vcap">
              <div className={styles.courseMeta}>
                <div className={styles.courseTitle}>{vcapCourse.title}</div>
                <p className={styles.courseTagline}>{vcapCourse.tagline}</p>
                <p className={styles.courseDescription}>{vcapCourse.description}</p>
              </div>
              <div className={styles.courseActions}>
                <span className={styles.courseBadge}>Active</span>
                <Link
                  href="/dashboard/courses/vcap"
                  className={styles.courseCta}
                >
                  Open Course
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>VCAP Modules</h2>
          <div className={styles.moduleGrid}>
            {vcapModules.map((module) => {
              const slidesLesson = module.lessons.find((lesson) => lesson.type === 'slides');
              const slideCount = slidesLesson && 'slideCount' in slidesLesson ? slidesLesson.slideCount : null;
              return (
                <div className={styles.moduleCard} key={module.id}>
                  <div className={styles.moduleHeader}>
                    <span
                      className={styles.moduleIcon}
                      style={{ backgroundColor: module.color }}
                    >
                      {module.number}
                    </span>
                    <div>
                      <div className={styles.moduleTitle}>
                        Module {module.number}: {module.title}
                      </div>
                      <div className={styles.moduleSubtitle}>{module.subtitle}</div>
                    </div>
                  </div>
                  <p className={styles.moduleOutcome}>{module.outcome}</p>
                  <div className={styles.moduleMetaRow}>
                    <span>{slideCount ? `${slideCount} slides` : 'Slides coming soon'}</span>
                    <span>{module.lessons.length} lessons</span>
                  </div>
                  <div className={styles.moduleActions}>
                    <Link
                      href={`/dashboard/courses/vcap?module=${module.id}`}
                      className={styles.moduleButton}
                    >
                      Open Module
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.emptyState}>
            <p>Select a module to view its submodules and begin the slides.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
