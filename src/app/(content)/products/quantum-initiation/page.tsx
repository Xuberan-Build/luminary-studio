import { Metadata } from "next";
import ProductHeader from "@/components/products/ProductHeader";
import StripeCheckout from "@/components/products/StripeCheckout";
import { PRODUCTS } from "@/lib/constants/products";
import styles from "./quantum-initiation.module.css";

export const metadata: Metadata = {
  title: "Quantum Initiation Protocol - Know Exactly How to Earn",
  description:
    "Get a personalized money blueprint based on your Astrology & Human Design. Know what to sell, how to sell it, and your aligned pricing model in 20 minutes.",
};

export default function QuantumInitiationPage() {
  const product = PRODUCTS['quantum-initiation'];
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
            Know Exactly What to Sell
            <span className={styles.titleAccent}>& How Much to Charge</span>
          </h1>

          <p className={styles.heroDescription}>
            Your personalized money blueprint from your Astrology & Human Design.
            <br />
            Instant clarity on your offers, pricing, and sales approach—no guesswork.
          </p>

          <div className={styles.heroMicrocopy}>
            Get clear answers in 20 minutes using the Quantum Business Framework aligned with your cosmic design.
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
              <h3 className={styles.featureTitle}>Quantum Business Framework</h3>
              <p className={styles.featureDescription}>
                Interactive blueprint powered by proven methodology that's generated millions in revenue.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Astrology & Human Design Integration</h3>
              <p className={styles.featureDescription}>
                Your money-making strategy aligned with your unique energetic blueprint and cosmic design.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Know What to Sell</h3>
              <p className={styles.featureDescription}>
                Discover your ideal offers, products, and services based on your natural strengths and energy.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <h3 className={styles.featureTitle}>Know How to Sell It</h3>
              <p className={styles.featureDescription}>
                Get your personalized sales approach that feels natural and authentic to your design.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔐</div>
              <h3 className={styles.featureTitle}>Know Your Pricing Model</h3>
              <p className={styles.featureDescription}>
                Receive clear guidance on how to price your offers in alignment with your energetic frequency.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>♾️</div>
              <h3 className={styles.featureTitle}>Instant Results</h3>
              <p className={styles.featureDescription}>
                Complete the interactive experience in 20 minutes and get your personalized blueprint immediately.
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
              <li>✓ Personalized money blueprint based on your chart</li>
              <li>✓ Know exactly what to sell & how to sell it</li>
              <li>✓ Your aligned pricing model revealed</li>
              <li>✓ Quantum Business Framework methodology</li>
              <li>✓ Instant access, complete in 20 minutes</li>
              <li>✓ One-time payment, no recurring fees</li>
            </ul>

            {/* Stripe Checkout */}
            <StripeCheckout
              paymentLink={product.stripePaymentLink}
              productName={product.name}
              price={product.price}
              productSlug={product.slug}
            />

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
                It's an interactive blueprint experience that analyzes your Astrology and Human Design to give you a personalized money-making strategy. You'll discover exactly what to sell, how to sell it, and how to price your offers—all aligned with your unique energetic design.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How does it work?</h3>
              <p className={styles.faqAnswer}>
                After purchase, you'll receive instant access to an interactive experience. You'll upload your birth chart information, answer strategic questions, and receive a personalized blueprint in about 20 minutes. Everything is delivered immediately—no waiting.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What exactly will I learn?</h3>
              <p className={styles.faqAnswer}>
                You'll discover your ideal offers and products to sell, the sales approach that feels natural to your energy type, and your aligned pricing model. No more guessing or copying what others are doing—you'll have a personalized roadmap based on your cosmic design.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How is this different from the full QBF course?</h3>
              <p className={styles.faqAnswer}>
                The full Quantum Business Framework course offers deep transformation through modules, exercises, and comprehensive frameworks. The Quantum Initiation Protocol gives you instant clarity on your money-making strategy in 20 minutes. They complement each other beautifully.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Do I need to know my birth time?</h3>
              <p className={styles.faqAnswer}>
                Yes, you'll need your birth date, time, and location to get the most accurate reading. If you don't have your exact birth time, you can still participate, but the insights may be less precise.
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
