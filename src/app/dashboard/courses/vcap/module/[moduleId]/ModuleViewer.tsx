'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './module.module.css';
import portalStyles from '../../../../dashboard.module.css';

type SubmoduleDefinition = {
  id: string;
  title: string;
  slides: number;
  minutes: number;
  coords: string;
};

type ModuleInfo = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
};

export default function ModuleViewer({
  module,
  submodules,
  activeSubmoduleId,
}: {
  module: ModuleInfo;
  submodules: SubmoduleDefinition[];
  activeSubmoduleId: string | null;
}) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const activeSubmodule = submodules.find((item) => item.id === activeSubmoduleId) || null;

  return (
    <div className={portalStyles.container}>
      <header className={portalStyles.header}>
        <h1>
          Module {module.number}: {module.title}
        </h1>
        <p className={portalStyles.subtitle}>{module.subtitle}</p>
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
              <div className={styles.sidebarTitle}>Submodules</div>
              <div className={styles.sidebarSubtitle}>{module.description}</div>
            </div>
            <button
              className={styles.drawerToggle}
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
            >
              {drawerOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          <nav className={styles.submoduleList}>
            {submodules.map((submodule, index) => {
              const isActive = submodule.id === activeSubmoduleId;
              return (
                <Link
                  key={submodule.id}
                  href={`/dashboard/courses/vcap/module/${module.id}?submodule=${submodule.id}`}
                  className={`${styles.submoduleItem} ${isActive ? styles.submoduleItemActive : ''}`}
                >
                  <div className={styles.submoduleIndex}>Submodule {index + 1}</div>
                  <div className={styles.submoduleTitle}>{submodule.title}</div>
                  <div className={styles.submoduleMeta}>
                    {submodule.minutes} min · {submodule.slides} slides
                  </div>
                </Link>
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
                Submodules
              </button>
              <Link href="/dashboard/courses/vcap" className={styles.backLink}>
                Back to VCAP
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
