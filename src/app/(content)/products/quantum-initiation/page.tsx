import { Metadata } from "next";
import ProductHeader from "@/components/products/ProductHeader";
import StripeCheckout from "@/components/products/StripeCheckout";
import styles from "./quantum-initiation.module.css";

export const metadata: Metadata = {
  title: "Quantum Initiation Protocol - Your AI Brand Strategist",
  description:
    "Personalized brand map from your Astrology & Human Design. Get instant strategic clarity through AI trained on the Quantum Business Framework.",
};

export default function QuantumInitiationPage() {
  return (
    <div className={styles.page}>
      <ProductHeader />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gridOverlay}></div>
          <div className={styles.radialGlow}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>Quantum Initiation Protocol</div>

          <h1 className={styles.heroTitle}>
            Your AI Brand Strategist
            <span className={styles.titleAccent}>Built From Your Design</span>
          </h1>

          <p className={styles.heroDescription}>
            Personalized brand map from your Astrology & Human Design.
            <br />
            Instant clarity. No templates. Built from your unique energetic blueprint.
          </p>

          <div className={styles.heroMicrocopy}>
            Get strategic guidance trained on the Quantum Business Framework—aligned with your cosmic design.
          </div>

          <a href="#purchase" className={styles.heroCta}>
            <span>Get Your Blueprint</span>
          </a>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>✨</span>
              <span className={styles.indicatorText}>Instant Access</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>🎯</span>
              <span className={styles.indicatorText}>Personalized Strategy</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorIcon}>🔒</span>
              <span className={styles.indicatorText}>Secure Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What's Included</h2>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🧠</div>
              <h3 className={styles.featureTitle}>AI Trained on QBF</h3>
              <p className={styles.featureDescription}>
                Custom ChatGPT trained on the complete Quantum Business Framework methodology.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Astrology & Human Design Integration</h3>
              <p className={styles.featureDescription}>
                Strategic guidance aligned with your unique energetic blueprint and cosmic design.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Personalized Brand Map</h3>
              <p className={styles.featureDescription}>
                Get a custom brand strategy built specifically for your business and energy.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <h3 className={styles.featureTitle}>24/7 Strategic Guidance</h3>
              <p className={styles.featureDescription}>
                Access QBF methodology anytime through conversational AI that remembers your context.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔐</div>
              <h3 className={styles.featureTitle}>Private & Secure</h3>
              <p className={styles.featureDescription}>
                Your own instance with memory of your unique situation and goals.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>♾️</div>
              <h3 className={styles.featureTitle}>Lifetime Access</h3>
              <p className={styles.featureDescription}>
                One-time payment. Use it forever. No subscriptions or recurring fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <section id="purchase" className={styles.purchase}>
        <div className={styles.container}>
          <div className={styles.purchaseCard}>
            <div className={styles.purchaseBadge}>Limited Time Offer</div>

            <h2 className={styles.purchaseTitle}>Get Your Quantum Blueprint</h2>

            <div className={styles.price}>
              <span className={styles.priceAmount}>$7</span>
              <span className={styles.pricePeriod}>one-time</span>
            </div>

            <ul className={styles.purchaseFeatures}>
              <li>✓ Custom GPT trained on QBF methodology</li>
              <li>✓ Astrology & Human Design integration</li>
              <li>✓ Personalized brand strategy map</li>
              <li>✓ 24/7 access to strategic guidance</li>
              <li>✓ Lifetime access, no recurring fees</li>
              <li>✓ Private & secure AI instance</li>
            </ul>

            {/* Stripe Checkout */}
            <StripeCheckout />

            <div className={styles.guarantee}>
              🔒 Secure checkout • Instant delivery • No recurring charges
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Common Questions</h2>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What is the Quantum Initiation Protocol?</h3>
              <p className={styles.faqAnswer}>
                It's a custom ChatGPT trained on our Quantum Business Framework, personalized with your Astrology and Human Design. Think of it as your AI brand strategist that speaks your energetic language.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I access it?</h3>
              <p className={styles.faqAnswer}>
                After purchase, you'll receive an email with a private link to your custom GPT. Click the link and it opens in ChatGPT. Requires a ChatGPT Plus subscription ($20/month from OpenAI).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Do I need ChatGPT Plus?</h3>
              <p className={styles.faqAnswer}>
                Yes, you need an active ChatGPT Plus subscription ($20/month from OpenAI) to use custom GPTs. This is separate from our $7 one-time fee for the Quantum Initiation Protocol.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How is this different from the full QBF course?</h3>
              <p className={styles.faqAnswer}>
                The full Quantum Business Framework course offers deep transformation through modules, exercises, and comprehensive frameworks. This GPT provides on-demand strategic guidance using QBF methodology. They complement each other beautifully.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I share the GPT link?</h3>
              <p className={styles.faqAnswer}>
                The link is for personal use only. Each purchase grants one license for your individual use.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What if I need help?</h3>
              <p className={styles.faqAnswer}>
                Email us anytime at support@quantumstrategies.com. We're here to help you get the most from your Quantum Blueprint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className={styles.footerCta}>
        <div className={styles.container}>
          <h2 className={styles.footerCtaTitle}>Ready for Instant Clarity?</h2>
          <p className={styles.footerCtaText}>
            Your personalized brand blueprint is one click away.
          </p>
          <a href="#purchase" className={styles.footerCtaButton}>
            Get Your Blueprint Now
          </a>
        </div>
      </section>
    </div>
  );
}
