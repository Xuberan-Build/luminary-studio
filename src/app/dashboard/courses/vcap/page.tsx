import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
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

export default function VcapCourseDashboard({
  searchParams,
}: {
  searchParams?: { module?: string; submodule?: string };
}) {
  const course = getCourseData();
  if (!course) {
    notFound();
  }

  const modules = course.modules
    .map((moduleEntry) => getModuleData(moduleEntry.id))
    .filter((module): module is CourseModule => Boolean(module));

  const initialModuleId = modules.find((module) => module.id === searchParams?.module)?.id || modules[0]?.id;
  const initialSubmoduleId = searchParams?.submodule || null;

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
