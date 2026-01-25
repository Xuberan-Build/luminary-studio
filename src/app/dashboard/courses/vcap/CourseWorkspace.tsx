'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import styles from './vcap-workspace.module.css';
import portalStyles from '../../dashboard.module.css';

type CourseModule = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
};

type SubmoduleDefinition = {
  id: string;
  title: string;
  slides: number;
  minutes: number;
  coords: string;
};

type CourseWorkspaceProps = {
  courseTitle: string;
  courseTagline: string;
  courseDescription: string;
  modules: CourseModule[];
  initialModuleId: string;
  initialSubmoduleId?: string | null;
};

const submodulesByModule: Record<string, SubmoduleDefinition[]> = {
  module1: [
    { id: 'm1-1', title: 'Welcome & The Problem', slides: 4, minutes: 5, coords: '0,0 → 1,2' },
    { id: 'm1-2', title: 'The VCAP Method', slides: 3, minutes: 4, coords: '1,3 → 1,5' },
    { id: 'm1-3', title: 'Mental Rules: Foundation', slides: 5, minutes: 6, coords: '2,0 → 3,3' },
    { id: 'm1-4', title: 'Mental Rules 2-3', slides: 8, minutes: 9, coords: '4,0 → 5,3' },
    { id: 'm1-5', title: 'Mental Rules 4-5', slides: 8, minutes: 9, coords: '6,0 → 7,3' },
    { id: 'm1-6', title: 'Mental Rules 6-7', slides: 8, minutes: 9, coords: '8,0 → 9,3' },
    { id: 'm1-7', title: 'Mental Rules 8-9', slides: 8, minutes: 9, coords: '10,0 → 11,3' },
    { id: 'm1-8', title: 'Mental Rule 10', slides: 4, minutes: 5, coords: '12,0 → 12,3' },
    { id: 'm1-9', title: 'Money Operating System', slides: 6, minutes: 7, coords: '13,0 → 13,5' },
    { id: 'm1-10', title: 'Self-Concept: Identity Model', slides: 5, minutes: 6, coords: '14,0 → 14,4' },
    { id: 'm1-11', title: 'Self-Concept: Values Work', slides: 5, minutes: 6, coords: '14,5 → 14,9' },
    { id: 'm1-12', title: 'Integration', slides: 4, minutes: 5, coords: '15,0 → 15,3' },
    { id: 'm1-13', title: 'Rite I: The Diagnostic Scans', slides: 6, minutes: 7, coords: '16,0 → 16,5' },
    { id: 'm1-14', title: 'Rite I: Your Decision', slides: 5, minutes: 6, coords: '16,6 → 16,10' },
  ],
  module2: [
    { id: 'm2-1', title: 'Welcome & Foundation', slides: 4, minutes: 5, coords: '0-1' },
    { id: 'm2-2', title: 'Purpose: Your Why', slides: 4, minutes: 5, coords: '2' },
    { id: 'm2-3', title: 'Vision: The Blueprint', slides: 5, minutes: 6, coords: '3 (0-4)' },
    { id: 'm2-4', title: 'Vision: Heart & Transformation', slides: 5, minutes: 6, coords: '3 (5-9)' },
    { id: 'm2-5', title: "Where You're Starting", slides: 4, minutes: 5, coords: '4' },
    { id: 'm2-6', title: 'Vision Exercise: Preparation', slides: 4, minutes: 5, coords: '5 (0-3)' },
    { id: 'm2-7', title: 'Vision Exercise: The Journey', slides: 4, minutes: 5, coords: '5 (4-7)' },
    { id: 'm2-8', title: 'Vision Exercise: Integration', slides: 5, minutes: 6, coords: '5 (8-12)' },
    { id: 'm2-9', title: 'Making Your Vision Bigger', slides: 6, minutes: 7, coords: '6' },
    { id: 'm2-10', title: 'Mission: Defining Your Route', slides: 5, minutes: 6, coords: '7 (0-4)' },
    { id: 'm2-11', title: 'Mission: Testing & Living It', slides: 5, minutes: 6, coords: '7 (5-9)' },
    { id: 'm2-12', title: 'Values Alignment', slides: 3, minutes: 4, coords: '8' },
    { id: 'm2-13', title: 'Circle of Competence', slides: 6, minutes: 7, coords: '9' },
    { id: 'm2-14', title: 'Integration & Next Steps', slides: 3, minutes: 4, coords: '10' },
  ],
  module3: [
    { id: 'm3-1', title: 'Welcome & The Path Forward', slides: 4, minutes: 5, coords: '0-1' },
    { id: 'm3-2', title: 'Strategic Thinking', slides: 3, minutes: 4, coords: '2' },
    { id: 'm3-3', title: 'Mental Models', slides: 3, minutes: 4, coords: '3' },
    { id: 'm3-4', title: 'The Strategy Game', slides: 4, minutes: 5, coords: '4' },
    { id: 'm3-5', title: 'Systems Thinking: Core', slides: 4, minutes: 5, coords: '5 (0-3)' },
    { id: 'm3-6', title: 'Systems Thinking: Your OS', slides: 3, minutes: 4, coords: '5 (4-6)' },
    { id: 'm3-7', title: 'Frameworks: Lean Canvas', slides: 4, minutes: 5, coords: '6 (0-3)' },
    { id: 'm3-8', title: 'Frameworks: Authority & Revenue', slides: 4, minutes: 5, coords: '6 (4-7)' },
    { id: 'm3-9', title: 'Personal Brand: Foundation', slides: 4, minutes: 5, coords: '7 (0-3)' },
    { id: 'm3-10', title: 'Personal Brand: Implementation', slides: 4, minutes: 5, coords: '7 (4-7)' },
    { id: 'm3-11', title: 'Implementation Systems', slides: 4, minutes: 5, coords: '8 (0-3)' },
    { id: 'm3-12', title: 'Quantum Business: The Framework', slides: 5, minutes: 6, coords: '8 (4-8)' },
    { id: 'm3-13', title: 'Quantum Business: Tunneling', slides: 4, minutes: 5, coords: '8 (9-12)' },
    { id: 'm3-14', title: 'Quantum Business: Your Path', slides: 2, minutes: 3, coords: '8 (13-14)' },
    { id: 'm3-15', title: 'Integration & The Three Rites', slides: 3, minutes: 4, coords: '9' },
  ],
};

export default function CourseWorkspace({
  courseTitle,
  courseTagline,
  courseDescription,
  modules,
  initialModuleId,
  initialSubmoduleId,
}: CourseWorkspaceProps) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState(initialModuleId);
  const activeModule = modules.find((module) => module.id === activeModuleId) || modules[0];
  const submodules = useMemo(() => submodulesByModule[activeModule.id] || [], [activeModule.id]);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState(
    initialSubmoduleId && submodules.some((item) => item.id === initialSubmoduleId)
      ? initialSubmoduleId
      : submodules[0]?.id || null
  );

  const activeSubmodule = submodules.find((item) => item.id === activeSubmoduleId) || null;

  const handleModuleSelect = (moduleId: string) => {
    setActiveModuleId(moduleId);
    const nextSubmodules = submodulesByModule[moduleId] || [];
    setActiveSubmoduleId(nextSubmodules[0]?.id || null);
  };

  return (
    <div className={portalStyles.container}>
      <header className={portalStyles.header}>
        <h1>{courseTitle}</h1>
        <p className={portalStyles.subtitle}>{courseTagline}</p>
        <div className={portalStyles.tabRow}>
          <Link href="/dashboard/products" className={portalStyles.tabLink}>
            Products
          </Link>
          <Link href="/dashboard/courses" className={portalStyles.tabLink}>
            Courses
          </Link>
          <Link href="/dashboard/affiliate" className={portalStyles.tabLink}>
            Affiliate
          </Link>
        </div>
      </header>

      <main className={styles.layout}>
        {drawerOpen && <button className={styles.mobileOverlay} onClick={() => setDrawerOpen(false)} />}
        <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <div>
              <div className={styles.sidebarTitle}>Modules</div>
              <div className={styles.sidebarSubtitle}>{courseDescription}</div>
            </div>
            <button
              className={styles.drawerToggle}
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
            >
              {drawerOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className={styles.moduleList}>
            {modules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => handleModuleSelect(module.id)}
                className={`${styles.moduleItem} ${activeModule.id === module.id ? styles.moduleItemActive : ''}`}
              >
                <span className={styles.moduleBadge}>{module.number}</span>
                <span className={styles.moduleName}>{module.title}</span>
              </button>
            ))}
          </div>

          <div className={styles.submoduleListLabel}>Submodules</div>
          <nav className={styles.submoduleList}>
            {submodules.map((submodule, index) => {
              const isActive = submodule.id === activeSubmoduleId;
              return (
                <button
                  key={submodule.id}
                  type="button"
                  className={`${styles.submoduleItem} ${isActive ? styles.submoduleItemActive : ''}`}
                  onClick={() => setActiveSubmoduleId(submodule.id)}
                >
                  <div className={styles.submoduleIndex}>Submodule {index + 1}</div>
                  <div className={styles.submoduleTitle}>{submodule.title}</div>
                  <div className={styles.submoduleMeta}>
                    {submodule.minutes} min · {submodule.slides} slides
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className={styles.viewer}>
          <div className={styles.viewerHeader}>
            <div>
              <div className={styles.viewerTitle}>{activeSubmodule?.title || 'Select a submodule'}</div>
              <div className={styles.viewerMeta}>
                {activeSubmodule
                  ? `${activeSubmodule.minutes} min · ${activeSubmodule.slides} slides`
                  : 'Choose a submodule to begin'}
              </div>
            </div>
            <div className={styles.viewerActions}>
              <button
                className={styles.openDrawerButton}
                type="button"
                onClick={() => setDrawerOpen(true)}
              >
                Modules
              </button>
              <Link href="/dashboard/courses" className={styles.backLink}>
                Back to Courses
              </Link>
            </div>
          </div>

          <div className={styles.slideShell}>
            <div className={styles.slidePlaceholder}>
              <div className={styles.slideLabel}>Slide player (PWA experience)</div>
              <div className={styles.slideNote}>Progress saves automatically and resumes where you left off.</div>
            </div>

            <div className={styles.pipVideo}>
              <div className={styles.pipHeader}>
                <span>Instructor Video</span>
                <button className={styles.pipClose} type="button">
                  Close
                </button>
              </div>
              <div className={styles.pipBody}>Video overlay placeholder</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
