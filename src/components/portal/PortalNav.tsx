'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './portal-nav.module.css';

interface PortalNavProps {
  userName: string;
}

export default function PortalNav({ userName }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      active: pathname?.startsWith('/dashboard/profile'),
    },
    {
      label: 'Affiliate',
      href: '/dashboard/affiliate',
      active: pathname?.startsWith('/dashboard/affiliate'),
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

  return (
    <nav className={styles.nav}>
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
