"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/lib/constants/navigation";
import DropdownPortal from "./DropdownPortal";
import styles from "./navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const navItemRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const updateDropdownPosition = (label: string) => {
    const element = navItemRefs.current[label];
    if (element) {
      const rect = element.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (activeDropdown) {
      updateDropdownPosition(activeDropdown);
    }
  }, [activeDropdown]);

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Luminary Studio
        </Link>

        <ul className={styles.navList}>
          {navigationConfig.main.map((item) => {
            if ("dropdown" in item && item.dropdown) {
              return (
                <li
                  key={item.label}
                  ref={(el) => (navItemRefs.current[item.label] = el)}
                  className={styles.navItem}
                  onMouseEnter={() => {
                    setActiveDropdown(item.label);
                    updateDropdownPosition(item.label);
                  }}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={styles.navLink}>
                    {item.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      style={{ marginLeft: "4px" }}
                    >
                      <path d="M6 9L1 4h10z" />
                    </svg>
                  </button>

                  {activeDropdown === item.label && (
                    <DropdownPortal>
                      <div
                        className={styles.dropdown}
                        style={{
                          position: "fixed",
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          minWidth: "280px",
                        }}
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {item.dropdown.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.dropdownLink} ${
                              isActive(link.href) ? styles.active : ""
                            }`}
                          >
                            <div>
                              <div className={styles.dropdownLabel}>{link.label}</div>
                              {link.description && (
                                <div className={styles.dropdownDescription}>
                                  {link.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </DropdownPortal>
                  )}
                </li>
              );
            }

            if ("megaMenu" in item && item.megaMenu) {
              return (
                <li
                  key={item.label}
                  ref={(el) => (navItemRefs.current[item.label] = el)}
                  className={styles.navItem}
                  onMouseEnter={() => {
                    setActiveDropdown(item.label);
                    updateDropdownPosition(item.label);
                  }}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={styles.navLink}>
                    {item.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      style={{ marginLeft: "4px" }}
                    >
                      <path d="M6 9L1 4h10z" />
                    </svg>
                  </button>

                  {activeDropdown === item.label && (
                    <DropdownPortal>
                      <div
                        className={styles.megaMenu}
                        style={{
                          position: "fixed",
                          top: `${dropdownPosition.top}px`,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className={styles.megaMenuContent}>
                          {item.megaMenu.sections.map((section) => (
                            <div key={section.title} className={styles.megaMenuSection}>
                              <h3 className={styles.megaMenuTitle}>{section.title}</h3>
                              <ul className={styles.megaMenuList}>
                                {section.links.map((link, linkIndex) => (
                                  <li key={`${section.title}-${linkIndex}`}>
                                    <Link
                                      href={link.href}
                                      className={`${styles.megaMenuLink} ${
                                        isActive(link.href) ? styles.active : ""
                                      }`}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownPortal>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label} className={styles.navItem}>
                <Link
                  href={item.href!}
                  className={`${styles.navLink} ${
                    isActive(item.href!) ? styles.active : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
