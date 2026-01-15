"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/modals/Modal";
import { redirectToCheckout } from "@/lib/stripe/checkout";
import styles from "./BetaCommitmentModal.module.css";

type BetaCommitmentModalProps = {
  productSlug: string;
  productName: string;
  price: number;
  completedAt: string;
};

export default function BetaCommitmentModal({
  productSlug,
  productName,
  price,
  completedAt,
}: BetaCommitmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const priceLabel = useMemo(() => {
    if (Number.isInteger(price)) {
      return price.toFixed(0);
    }
    return price.toFixed(2);
  }, [price]);

  useEffect(() => {
    if (!productSlug || !completedAt) return;
    const storageKey = `beta_commitment_last_seen:${productSlug}`;
    const lastSeen = typeof window !== "undefined"
      ? window.localStorage.getItem(storageKey)
      : null;
    if (lastSeen === completedAt) {
      return;
    }
    setIsOpen(true);
  }, [productSlug, completedAt]);

  const handleClose = () => {
    const storageKey = `beta_commitment_last_seen:${productSlug}`;
    window.localStorage.setItem(storageKey, completedAt);
    setIsOpen(false);
  };

  const handleCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await redirectToCheckout(productSlug);
  };

  return (
    <Modal title="Complete the circuit" isOpen={isOpen} onClose={handleClose}>
      <div className={styles.wrapper}>
        <p className={styles.eyebrow}>{productName} complete</p>
        <h3 className={styles.headline}>
          Did this scan deliver ${priceLabel} worth of insight?
        </h3>
        <p className={styles.body}>
          Paying activates your commitment. It signals to yourself and the field:
          &quot;I&apos;m serious about my transformation, and I invest in what works.&quot;
        </p>
        <div className={styles.ctaRow}>
          <button
            className={styles.primaryCta}
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing
              ? "Redirecting..."
              : `Activate Commitment - $${priceLabel}`}
          </button>
          <button className={styles.secondaryCta} onClick={handleClose}>
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
