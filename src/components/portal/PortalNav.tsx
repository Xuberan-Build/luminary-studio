'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './portal-nav.module.css';

interface PortalNavProps {
  userName: string;
}

export default function PortalNav({ userName }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);
  const hideOnScroll = pathname?.startsWith('/dashboard/courses');

  const navItems = [
    {
      label: 'Products',
      href: '/dashboard/products',
      active: pathname?.startsWith('/dashboard/products'),
    },
    {
      label: 'Courses',
      href: '/dashboard/courses',
      active: pathname?.startsWith('/dashboard/courses'),
    },
    {
      label: 'Affiliate',
      href: '/dashboard/affiliate',
      active: pathname?.startsWith('/dashboard/affiliate'),
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      active: pathname?.startsWith('/dashboard/profile'),
    },
  ];

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      if (response.ok) {
        router.refresh();
        router.push('/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even if there's an error
      router.push('/login');
    }
  };

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      rafId.current = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastScrollY.current;

        if (!hideOnScroll) {
          if (hidden) {
            setHidden(false);
          }
          lastScrollY.current = currentY;
          ticking.current = false;
          return;
        }

        if (currentY < 80) {
          setHidden(false);
        } else if (scrollingDown && !hidden) {
          setHidden(true);
        } else if (!scrollingDown && hidden) {
          setHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
      ticking.current = false;
    };
  }, [hidden, hideOnScroll]);

  return (
    <nav className={`${styles.nav} ${hidden ? styles.navHidden : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandText}>Quantum Strategies</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.navTabs}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navTab} ${item.active ? styles.navTabActive : ''}`}
            >
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className={styles.userMenu}>
          <div className={styles.userName}>{userName}</div>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
