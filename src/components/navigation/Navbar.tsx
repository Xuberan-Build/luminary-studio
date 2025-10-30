"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <ul>
        <li>
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/meet" className={pathname === "/meet" ? "active" : ""}>
            Meet
          </Link>
        </li>
        <li>
          <Link href="/values" className={pathname === "/values" ? "active" : ""}>
            Values
          </Link>
        </li>
      </ul>
    </nav>
  );
}
