import { Metadata } from "next";
import ProductInteractHeader from "@/components/products/ProductInteractHeader";
import GPTChatEmbed from "@/components/products/GPTChatEmbed";
import InteractHero from "@/components/products/InteractHero";
import { PRODUCTS } from "@/lib/constants/products";
import { notFound } from "next/navigation";
import styles from "./interact.module.css";

export const metadata: Metadata = {
  title: "Build Your Quantum Blueprint - Quantum Initiation Protocol",
  description: "Interactive GPT session to create your personalized brand strategy",
  robots: "noindex, nofollow",
};

export default function QuantumInitiationInteractPage() {
  const product = PRODUCTS['quantum-initiation'];

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <ProductInteractHeader productName={product.name} />

      <InteractHero
        title={product.interactTitle}
        instructions={product.interactInstructions}
        duration={product.estimatedDuration}
      />

      <GPTChatEmbed
        iframeUrl={product.gptIframeUrl}
        productSlug={product.slug}
      />
    </div>
  );
}
