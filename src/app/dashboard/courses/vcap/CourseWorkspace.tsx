'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './vcap-workspace.module.css';
import portalStyles from '../../dashboard.module.css';
import SlideDeck from '@/components/courses/SlideDeck';
import { supabase } from '@/lib/supabase/client';

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
  startCoord: string;
  endCoord: string;
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
    { id: 'm1-1', title: 'Welcome & The Problem', slides: 4, minutes: 5, coords: '0,0 → 1,2', startCoord: '0,0', endCoord: '1,2' },
    { id: 'm1-2', title: 'The VCAP Method', slides: 3, minutes: 4, coords: '1,3 → 1,5', startCoord: '1,3', endCoord: '1,5' },
    { id: 'm1-3', title: 'Mental Rules: Foundation', slides: 5, minutes: 6, coords: '2,0 → 3,3', startCoord: '2,0', endCoord: '3,3' },
    { id: 'm1-4', title: 'Mental Rules 2-3', slides: 8, minutes: 9, coords: '4,0 → 5,3', startCoord: '4,0', endCoord: '5,3' },
    { id: 'm1-5', title: 'Mental Rules 4-5', slides: 8, minutes: 9, coords: '6,0 → 7,3', startCoord: '6,0', endCoord: '7,3' },
    { id: 'm1-6', title: 'Mental Rules 6-7', slides: 8, minutes: 9, coords: '8,0 → 9,3', startCoord: '8,0', endCoord: '9,3' },
    { id: 'm1-7', title: 'Mental Rules 8-9', slides: 8, minutes: 9, coords: '10,0 → 11,3', startCoord: '10,0', endCoord: '11,3' },
    { id: 'm1-8', title: 'Mental Rule 10', slides: 4, minutes: 5, coords: '12,0 → 12,3', startCoord: '12,0', endCoord: '12,3' },
    { id: 'm1-9', title: 'Money Operating System', slides: 6, minutes: 7, coords: '13,0 → 13,5', startCoord: '13,0', endCoord: '13,5' },
    { id: 'm1-10', title: 'Self-Concept: Identity Model', slides: 5, minutes: 6, coords: '14,0 → 14,4', startCoord: '14,0', endCoord: '14,4' },
    { id: 'm1-11', title: 'Self-Concept: Values Work', slides: 5, minutes: 6, coords: '14,5 → 14,9', startCoord: '14,5', endCoord: '14,9' },
    { id: 'm1-12', title: 'Integration', slides: 4, minutes: 5, coords: '15,0 → 15,3', startCoord: '15,0', endCoord: '15,3' },
    { id: 'm1-13', title: 'Rite I: The Diagnostic Scans', slides: 6, minutes: 7, coords: '16,0 → 16,5', startCoord: '16,0', endCoord: '16,5' },
    { id: 'm1-14', title: 'Rite I: Your Decision', slides: 5, minutes: 6, coords: '16,6 → 16,10', startCoord: '16,6', endCoord: '16,10' },
  ],
  module2: [
    { id: 'm2-1', title: 'Welcome & Foundation', slides: 4, minutes: 5, coords: '0-1', startCoord: '0,0', endCoord: '1,2' },
    { id: 'm2-2', title: 'Purpose: Your Why', slides: 4, minutes: 5, coords: '2', startCoord: '2,0', endCoord: '2,3' },
    { id: 'm2-3', title: 'Vision: The Blueprint', slides: 5, minutes: 6, coords: '3 (0-4)', startCoord: '3,0', endCoord: '3,4' },
    { id: 'm2-4', title: 'Vision: Heart & Transformation', slides: 5, minutes: 6, coords: '3 (5-9)', startCoord: '3,5', endCoord: '3,9' },
    { id: 'm2-5', title: "Where You're Starting", slides: 4, minutes: 5, coords: '4', startCoord: '4,0', endCoord: '4,3' },
    { id: 'm2-6', title: 'Vision Exercise: Preparation', slides: 4, minutes: 5, coords: '5 (0-3)', startCoord: '5,0', endCoord: '5,3' },
    { id: 'm2-7', title: 'Vision Exercise: The Journey', slides: 4, minutes: 5, coords: '5 (4-7)', startCoord: '5,4', endCoord: '5,7' },
    { id: 'm2-8', title: 'Vision Exercise: Integration', slides: 5, minutes: 6, coords: '5 (8-12)', startCoord: '5,8', endCoord: '5,12' },
    { id: 'm2-9', title: 'Making Your Vision Bigger', slides: 6, minutes: 7, coords: '6', startCoord: '6,0', endCoord: '6,0' },
    { id: 'm2-10', title: 'Mission: Defining Your Route', slides: 5, minutes: 6, coords: '7 (0-4)', startCoord: '7,0', endCoord: '7,4' },
    { id: 'm2-11', title: 'Mission: Testing & Living It', slides: 5, minutes: 6, coords: '7 (5-9)', startCoord: '7,5', endCoord: '7,9' },
    { id: 'm2-12', title: 'Values Alignment', slides: 3, minutes: 4, coords: '8', startCoord: '8,0', endCoord: '8,2' },
    { id: 'm2-13', title: 'Circle of Competence', slides: 6, minutes: 7, coords: '9', startCoord: '9,0', endCoord: '9,5' },
    { id: 'm2-14', title: 'Integration & Next Steps', slides: 3, minutes: 4, coords: '10', startCoord: '10,0', endCoord: '10,2' },
  ],
  module3: [
    { id: 'm3-1', title: 'Welcome & The Path Forward', slides: 4, minutes: 5, coords: '0-1', startCoord: '0,0', endCoord: '1,2' },
    { id: 'm3-2', title: 'Strategic Thinking', slides: 3, minutes: 4, coords: '2', startCoord: '2,0', endCoord: '2,2' },
    { id: 'm3-3', title: 'Mental Models', slides: 3, minutes: 4, coords: '3', startCoord: '3,0', endCoord: '3,2' },
    { id: 'm3-4', title: 'The Strategy Game', slides: 4, minutes: 5, coords: '4', startCoord: '4,0', endCoord: '4,3' },
    { id: 'm3-5', title: 'Systems Thinking: Core', slides: 4, minutes: 5, coords: '5 (0-3)', startCoord: '5,0', endCoord: '5,3' },
    { id: 'm3-6', title: 'Systems Thinking: Your OS', slides: 3, minutes: 4, coords: '5 (4-6)', startCoord: '5,4', endCoord: '5,6' },
    { id: 'm3-7', title: 'Frameworks: Lean Canvas', slides: 4, minutes: 5, coords: '6 (0-3)', startCoord: '6,0', endCoord: '6,3' },
    { id: 'm3-8', title: 'Frameworks: Authority & Revenue', slides: 4, minutes: 5, coords: '6 (4-7)', startCoord: '6,4', endCoord: '6,7' },
    { id: 'm3-9', title: 'Personal Brand: Foundation', slides: 4, minutes: 5, coords: '7 (0-3)', startCoord: '7,0', endCoord: '7,3' },
    { id: 'm3-10', title: 'Personal Brand: Implementation', slides: 4, minutes: 5, coords: '7 (4-7)', startCoord: '7,4', endCoord: '7,7' },
    { id: 'm3-11', title: 'Implementation Systems', slides: 4, minutes: 5, coords: '8 (0-3)', startCoord: '8,0', endCoord: '8,3' },
    { id: 'm3-12', title: 'Quantum Business: The Framework', slides: 5, minutes: 6, coords: '8 (4-8)', startCoord: '8,4', endCoord: '8,8' },
    { id: 'm3-13', title: 'Quantum Business: Tunneling', slides: 4, minutes: 5, coords: '8 (9-12)', startCoord: '8,9', endCoord: '8,12' },
    { id: 'm3-14', title: 'Quantum Business: Your Path', slides: 2, minutes: 3, coords: '8 (13-14)', startCoord: '8,13', endCoord: '8,14' },
    { id: 'm3-15', title: 'Integration & The Three Rites', slides: 3, minutes: 4, coords: '9', startCoord: '9,0', endCoord: '9,2' },
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
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState(
    initialSubmoduleId && submodules.some((item) => item.id === initialSubmoduleId)
      ? initialSubmoduleId
      : submodules[0]?.id || null
  );
  const [currentSubmoduleId, setCurrentSubmoduleId] = useState(
    initialSubmoduleId && submodules.some((item) => item.id === initialSubmoduleId)
      ? initialSubmoduleId
      : submodules[0]?.id || null
  );
  const [currentCoords, setCurrentCoords] = useState<string | null>(null);
  const [completedSubmoduleId, setCompletedSubmoduleId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const slideFrameRef = useRef<HTMLIFrameElement>(null);
  const userIdRef = useRef<string | null>(null);
  const lastSentCoordRef = useRef<string | null>(null);
  const courseSlug = 'vcap';

  const activeSubmodule = submodules.find((item) => item.id === selectedSubmoduleId) || null;
  const currentSubmodule = submodules.find((item) => item.id === currentSubmoduleId) || null;

  const sendSlideNavigate = (direction: 'next' | 'prev') => {
    slideFrameRef.current?.contentWindow?.postMessage(
      { type: 'navigate', direction, source: 'lms' },
      '*'
    );
  };

  const updateQuery = (moduleId: string, submoduleId: string | null, startCoord?: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('module', moduleId);
    if (submoduleId) {
      params.set('submodule', submoduleId);
    } else {
      params.delete('submodule');
    }
    if (startCoord) {
      params.set('coords', startCoord);
    } else {
      params.delete('coords');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleModuleSelect = (moduleId: string) => {
    setActiveModuleId(moduleId);
    const nextSubmodules = submodulesByModule[moduleId] || [];
    const nextSubmoduleId = nextSubmodules[0]?.id || null;
    const nextCoords = nextSubmodules[0]?.startCoord || null;
    setSelectedSubmoduleId(nextSubmoduleId);
    setCurrentSubmoduleId(nextSubmoduleId);
    setCompletedSubmoduleId(null);
    updateQuery(moduleId, nextSubmoduleId, nextCoords);
  };

  const handleSubmoduleSelect = (submoduleId: string) => {
    setSelectedSubmoduleId(submoduleId);
    setCurrentSubmoduleId(submoduleId);
    setCompletedSubmoduleId(null);
    const nextSubmodule = submodules.find((item) => item.id === submoduleId);
    updateQuery(activeModule.id, submoduleId, nextSubmodule?.startCoord || null);
  };

  useEffect(() => {
    const moduleParam = searchParams.get('module');
    const submoduleParam = searchParams.get('submodule');
    const moduleExists = moduleParam ? modules.some((module) => module.id === moduleParam) : false;

    if (moduleParam && moduleExists && moduleParam !== activeModuleId) {
      const nextSubmodules = submodulesByModule[moduleParam] || [];
      const nextSubmoduleId =
        submoduleParam && nextSubmodules.some((item) => item.id === submoduleParam)
          ? submoduleParam
          : nextSubmodules[0]?.id || null;
      setActiveModuleId(moduleParam);
      setSelectedSubmoduleId(nextSubmoduleId);
      setCurrentSubmoduleId(nextSubmoduleId);
      setCompletedSubmoduleId(null);
      return;
    }

    if (submoduleParam && submoduleParam !== selectedSubmoduleId) {
      if (submodules.some((item) => item.id === submoduleParam)) {
        setSelectedSubmoduleId(submoduleParam);
        setCurrentSubmoduleId(submoduleParam);
        setCompletedSubmoduleId(null);
      }
    }
  }, [searchParams, modules, activeModuleId, selectedSubmoduleId, submodules]);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && isMounted) {
        userIdRef.current = data.user?.id || null;
      }
    };
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event?.data;
      if (!data || data.type !== 'coords' || data.source !== 'slides') return;
      if (data.moduleId && data.moduleId !== activeModule.id) return;
      if (typeof data.coords !== 'string') return;
      setCurrentCoords(data.coords);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [activeModule.id]);

  useEffect(() => {
    if (!currentCoords) return;

    const parseCoord = (coord: string) => {
      const [x, y] = coord.split(',').map((value) => Number(value));
      return { x, y };
    };

    const inRange = (coord: string, start: string, end: string) => {
      const point = parseCoord(coord);
      const a = parseCoord(start);
      const b = parseCoord(end);
      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      const minY = Math.min(a.y, b.y);
      const maxY = Math.max(a.y, b.y);
      return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
    };

    const match = submodules.find((item) => inRange(currentCoords, item.startCoord, item.endCoord));
    if (match && match.id !== currentSubmoduleId) {
      setCurrentSubmoduleId(match.id);
    }

    if (match && currentCoords === match.endCoord) {
      setCompletedSubmoduleId(match.id);
    }
  }, [currentCoords, submodules, currentSubmoduleId]);

  useEffect(() => {
    if (!currentCoords) return;
    if (!userIdRef.current) return;
    if (lastSentCoordRef.current === currentCoords) return;

    const [xRaw, yRaw] = currentCoords.split(',');
    const coordX = Number(xRaw);
    const coordY = Number(yRaw);

    if (Number.isNaN(coordX) || Number.isNaN(coordY)) return;

    lastSentCoordRef.current = currentCoords;

    const recordEvent = async () => {
      const { error } = await supabase.rpc('record_course_slide_event', {
        p_user_id: userIdRef.current,
        p_course_slug: courseSlug,
        p_module_id: activeModule.id,
        p_submodule_id: currentSubmoduleId,
        p_coord: currentCoords,
        p_coord_x: coordX,
        p_coord_y: coordY,
      });

      if (error) {
        console.error('Failed to record slide event', error);
        lastSentCoordRef.current = null;
      }
    };

    void recordEvent();
  }, [currentCoords, activeModule.id, currentSubmoduleId]);

  const nextSubmodule = currentSubmoduleId
    ? submodules[submodules.findIndex((item) => item.id === currentSubmoduleId) + 1]
    : null;

  return (
    <div className={portalStyles.container}>
      <header className={portalStyles.header}>
        <h1>{courseTitle}</h1>
        <p className={portalStyles.subtitle}>{courseTagline}</p>
      </header>

      <main className={styles.layout}>
        {drawerOpen && <button className={styles.mobileOverlay} onClick={() => setDrawerOpen(false)} />}
        {!drawerOpen && (
          <button className={styles.drawerHandle} type="button" onClick={() => setDrawerOpen(true)}>
            Modules
          </button>
        )}
        <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <div>
              <div className={styles.sidebarTitle}>Modules</div>
              <div className={styles.sidebarSubtitle}>{courseDescription}</div>
            </div>
            {drawerOpen && (
              <button
                className={styles.drawerCorner}
                type="button"
                onClick={() => setDrawerOpen(false)}
              >
                Hide
              </button>
            )}
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
              const isActive = submodule.id === currentSubmoduleId;
              return (
                <button
                  key={submodule.id}
                  type="button"
                  className={`${styles.submoduleItem} ${isActive ? styles.submoduleItemActive : ''}`}
                  onClick={() => handleSubmoduleSelect(submodule.id)}
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
              <div className={styles.viewerTitle}>{currentSubmodule?.title || 'Select a submodule'}</div>
              <div className={styles.viewerMeta}>
                {currentSubmodule
                  ? `${currentSubmodule.minutes} min · ${currentSubmodule.slides} slides`
                  : 'Choose a submodule to begin'}
              </div>
            </div>
            <div className={styles.viewerActions}>
              <button
                className={styles.slideNavButton}
                type="button"
                onClick={() => sendSlideNavigate('prev')}
              >
                Prev Slide
              </button>
              <button
                className={styles.slideNavButton}
                type="button"
                onClick={() => sendSlideNavigate('next')}
              >
                Next Slide
              </button>
              <Link href="/dashboard/courses" className={styles.backLink}>
                Back to Courses
              </Link>
            </div>
          </div>
          {completedSubmoduleId === currentSubmoduleId && nextSubmodule && (
            <div className={styles.completionBanner}>
              <div>
                <strong>Submodule complete.</strong> Ready for {nextSubmodule.title}?
              </div>
              <button
                type="button"
                className={styles.completionButton}
                onClick={() => handleSubmoduleSelect(nextSubmodule.id)}
              >
                Start Next Submodule
              </button>
            </div>
          )}

          <div className={styles.slideShell}>
            <SlideDeck
              moduleId={activeModule.id}
              submoduleId={selectedSubmoduleId}
              startCoords={activeSubmodule?.startCoord || null}
              iframeRef={slideFrameRef}
              title={
                activeSubmodule ? `${activeModule.title} - ${activeSubmodule.title}` : 'VCAP Slide Deck'
              }
            />

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
