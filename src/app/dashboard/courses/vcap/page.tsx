import fs from 'fs';
import path from 'path';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import styles from '../../dashboard.module.css';
import CourseWorkspace from './CourseWorkspace';

interface CourseModule {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  outcome: string;
  lessons: Array<{ type: string; slideCount?: number }>;
}

interface CourseData {
  title: string;
  tagline: string;
  description: string;
  modules: Array<{ id: string }>;
}

function getCourseData(): CourseData | null {
  try {
    const coursePath = path.join(process.cwd(), 'src/content/courses/vcap/course.json');
    return JSON.parse(fs.readFileSync(coursePath, 'utf-8'));
  } catch {
    return null;
  }
}

function getModuleData(moduleId: string): CourseModule | null {
  try {
    const modulePath = path.join(
      process.cwd(),
      `src/content/courses/vcap/modules/${moduleId}/module.json`
    );
    return JSON.parse(fs.readFileSync(modulePath, 'utf-8'));
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

async function enrollInCourse() {
  'use server';

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { error } = await supabase
    .from('course_enrollments')
    .insert({ user_id: session.user.id, course_slug: 'vcap' })
    .select()
    .single();

  if (error && error.code !== '23505') {
    console.error('Enrollment failed', error);
    return;
  }

  redirect('/dashboard/courses/vcap');
}

export default async function VcapCourseDashboard({
  searchParams,
}: {
  searchParams?: { module?: string; submodule?: string };
}) {
  const course = getCourseData();
  if (!course) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, status')
    .eq('user_id', session.user.id)
    .eq('course_slug', 'vcap')
    .maybeSingle();

  const isEnrolled = Boolean(enrollment?.id);

  const modules = course.modules
    .map((moduleEntry) => getModuleData(moduleEntry.id))
    .filter((module): module is CourseModule => Boolean(module));

  const initialModuleId = modules.find((module) => module.id === searchParams?.module)?.id || modules[0]?.id;
  const initialSubmoduleId = searchParams?.submodule || null;

  if (!isEnrolled) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>{course.title}</h1>
          <p className={styles.subtitle}>{course.tagline}</p>
        </header>
        <main className={styles.main}>
          <section className={styles.section}>
            <h2>Course Outline</h2>
            <div className={styles.coursesGrid}>
              <div className={styles.courseCard}>
                <div className={styles.courseMeta}>
                  <div className={styles.courseTitle}>{course.title}</div>
                  <p className={styles.courseTagline}>{course.tagline}</p>
                  <p className={styles.courseDescription}>{course.description}</p>
                </div>
                <div className={styles.courseActions}>
                  <span className={styles.courseBadge}>Active</span>
                  <form action={enrollInCourse}>
                    <button type="submit" className={styles.courseCta}>
                      Enroll to Start
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Modules</h2>
            <div className={styles.moduleGrid}>
              {modules.map((module) => (
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
                  <div className={styles.moduleActions}>
                    <span className={styles.moduleLocked}>
                      Enroll to access
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <CourseWorkspace
      courseTitle={course.title}
      courseTagline={course.tagline}
      courseDescription={course.description}
      modules={modules}
      initialModuleId={initialModuleId}
      initialSubmoduleId={initialSubmoduleId}
    />
  );
}
