"use client";
import Link from "next/link";
import styles from "./product-interact-header.module.css";

interface ProductInteractHeaderProps {
  productName: string;
}

export default function ProductInteractHeader({ productName }: ProductInteractHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        Quantum Strategies
      </Link>

      <div className={styles.productTitle}>{productName}</div>

      <div className={styles.spacer} />
    </header>
  );
}
