import Link from "next/link";
import { navigationConfig } from "@/lib/constants/navigation";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brandColumn}>
            <h3 className={styles.brandName}>Quantum Strategies</h3>
            <p className={styles.brandTagline}>
              Mastering the art of creating and adding value through strategic execution
            </p>
            <div className={styles.social}>
              <a
                href="https://www.linkedin.com/in/austinsantos"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Company</h4>
            <ul className={styles.linkList}>
              {navigationConfig.footer.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Resources</h4>
            <ul className={styles.linkList}>
              {navigationConfig.footer.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Work Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Our Work</h4>
            <ul className={styles.linkList}>
              {navigationConfig.footer.work.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Legal</h4>
            <ul className={styles.linkList}>
              {navigationConfig.footer.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Quantum Strategies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
