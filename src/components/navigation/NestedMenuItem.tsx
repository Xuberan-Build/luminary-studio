"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { NavLink } from "@/lib/constants/navigation";
import styles from "./navbar.module.css";

interface NestedMenuItemProps {
  link: NavLink;
  isActive: (href: string) => boolean;
}

export default function NestedMenuItem({ link, isActive }: NestedMenuItemProps) {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const itemRef = useRef<HTMLLIElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateSubmenuPosition = () => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    setSubmenuPosition({
      top: rect.top,
      left: rect.right + 8
    });
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (link.submenu) {
      updateSubmenuPosition();
      setShowSubmenu(true);
    }
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setShowSubmenu(false);
    }, 150);
  };

  const handleSubmenuEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleSubmenuLeave = () => {
    setShowSubmenu(false);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!link.submenu) {
    // No submenu - render as regular link
    return (
      <li>
        <Link
          href={link.href!}
          className={`${styles.megaMenuLink} ${isActive(link.href!) ? styles.active : ""}`}
        >
          {link.label}
        </Link>
      </li>
    );
  }

  // Has submenu - render with hover behavior
  return (
    <>
      <li
        ref={itemRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative" }}
      >
        {link.href ? (
          <Link
            href={link.href}
            className={`${styles.megaMenuLink} ${styles.hasSubmenu} ${
              isActive(link.href) ? styles.active : ""
            }`}
          >
            {link.label}
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
              style={{ marginLeft: "auto" }}
            >
              <path d="M4 1l5 5-5 5z" />
            </svg>
          </Link>
        ) : (
          <div className={`${styles.megaMenuLink} ${styles.hasSubmenu}`}>
            {link.label}
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
              style={{ marginLeft: "auto" }}
            >
              <path d="M4 1l5 5-5 5z" />
            </svg>
          </div>
        )}
      </li>

      {showSubmenu && link.submenu && typeof document !== 'undefined' && (
        <>
          {(() => {
            const portal = document.getElementById('dropdown-portal') || document.body;
            return (
              <div
                ref={submenuRef}
                className={styles.nestedSubmenu}
                style={{
                  position: "fixed",
                  top: `${submenuPosition.top}px`,
                  left: `${submenuPosition.left}px`
                }}
                onMouseEnter={handleSubmenuEnter}
                onMouseLeave={handleSubmenuLeave}
              >
                <ul className={styles.nestedSubmenuList}>
                  {link.submenu.map((sublink, idx) => (
                    <NestedMenuItem key={idx} link={sublink} isActive={isActive} />
                  ))}
                </ul>
              </div>
            );
          })()}
        </>
      )}
    </>
  );
}
