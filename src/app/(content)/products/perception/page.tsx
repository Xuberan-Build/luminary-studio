import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import styles from "./perception.module.css";

export const metadata: Metadata = {
  title: "Rite I: Perception - Learn to See the System",
  description:
    "Five perception scans to help you move from ignorance to awareness. Learn to recognize the patterns, signals, and structures governing your reality.",
};

export default function RiteIPerceptionPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gridOverlay}></div>
          <div className={styles.radialGlow}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.riteBadge}>RITE I: PERCEPTION</div>

          <h1 className={styles.heroTitle}>
            Learn to See the System
            <span className={styles.titleAccent}>Ignorance → Awareness</span>
          </h1>

          <p className={styles.heroDescription}>
            Five perception scans to reveal the patterns you've been blind to.
            <br />
            You can't navigate what you can't see.
          </p>

          <div className={styles.heroMicrocopy}>
            Get notified when Rite I launches. Be first to access the five perception scans.
          </div>

          <a href="#waitlist" className={styles.heroCta}>
            <span>Join the Waitlist</span>
          </a>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>5 Perception Scans</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>Coming Soon</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>Early Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* What Perception Does */}
      <section className={styles.purpose}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Perception Does</h2>
          <div className={styles.purposeGrid}>
            <div className={styles.purposeCard}>
              <h3 className={styles.purposeTitle}>The Shift</h3>
              <p className={styles.purposeDescription}>
                Perception moves you from <strong>ignorance</strong> to <strong>awareness</strong>.
                You'll stop being blind to the patterns and start seeing the system that governs your reality.
              </p>
            </div>
            <div className={styles.purposeCard}>
              <h3 className={styles.purposeTitle}>How It Fits</h3>
              <p className={styles.purposeDescription}>
                This is the first rite in the system. Rite I helps you <em>see</em> the patterns.
                Rite II helps you <em>locate yourself</em> within them. Rite III helps you <em>choose your direction</em>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Five Perception Scans */}
      <section className={styles.products}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Five Perception Scans</h2>
          <p className={styles.sectionSubtitle}>
            Each scan reveals a different layer of the system you're operating within.
          </p>

          <div className={styles.productGrid}>
            {/* Scan 1 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Scan 1</div>
              <h3 className={styles.productTitle}>Market Perception Scan</h3>
              <p className={styles.productDescription}>
                See how the market actually works—beyond the surface narrative.
                Understand demand signals, competitive dynamics, and opportunity gaps.
              </p>
              <ul className={styles.productFeatures}>
                <li>Market pattern recognition</li>
                <li>Demand signal detection</li>
                <li>Competitive landscape mapping</li>
                <li>Opportunity identification</li>
              </ul>
            </div>

            {/* Scan 2 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Scan 2</div>
              <h3 className={styles.productTitle}>Value Perception Scan</h3>
              <p className={styles.productDescription}>
                Learn to see what people actually value—not what they say they value.
                Recognize buying triggers and decision patterns.
              </p>
              <ul className={styles.productFeatures}>
                <li>Value signal detection</li>
                <li>Buying trigger recognition</li>
                <li>Decision pattern mapping</li>
                <li>Price perception analysis</li>
              </ul>
            </div>

            {/* Scan 3 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Scan 3</div>
              <h3 className={styles.productTitle}>Power Perception Scan</h3>
              <p className={styles.productDescription}>
                See who holds real influence and how power actually flows.
                Understand leverage points and strategic relationships.
              </p>
              <ul className={styles.productFeatures}>
                <li>Power structure mapping</li>
                <li>Influence network analysis</li>
                <li>Leverage point identification</li>
                <li>Strategic relationship recognition</li>
              </ul>
            </div>

            {/* Scan 4 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Scan 4</div>
              <h3 className={styles.productTitle}>Resource Perception Scan</h3>
              <p className={styles.productDescription}>
                Recognize what resources you actually have access to—including the hidden ones.
                See what's available that you've been blind to.
              </p>
              <ul className={styles.productFeatures}>
                <li>Resource inventory mapping</li>
                <li>Hidden asset identification</li>
                <li>Access pathway recognition</li>
                <li>Resource leverage analysis</li>
              </ul>
            </div>

            {/* Scan 5 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Scan 5</div>
              <h3 className={styles.productTitle}>System Perception Scan</h3>
              <p className={styles.productDescription}>
                See how all the pieces connect—the full system view.
                Understand the meta-patterns that govern everything else.
              </p>
              <ul className={styles.productFeatures}>
                <li>System architecture mapping</li>
                <li>Meta-pattern recognition</li>
                <li>Feedback loop identification</li>
                <li>Systemic leverage detection</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className={styles.bundle}>
        <div className={styles.container}>
          <div className={styles.bundleCard}>
            <div className={styles.bundleBadge}>COMING SOON</div>
            <h2 className={styles.bundleTitle}>Join the Perception Waitlist</h2>
            <p className={styles.bundleDescription}>
              Be first to access when Rite I launches. Waitlist members get early access and special pricing.
            </p>

            <div className={styles.bundlePrice}>
              <div className={styles.bundlePriceMain}>
                <span className={styles.bundlePriceAmount}>Early Access</span>
                <span className={styles.bundlePricePeriod}>coming soon</span>
              </div>
            </div>

            <ul className={styles.bundleFeatures}>
              <li>✓ First access to all 5 perception scans</li>
              <li>✓ Special early-bird pricing</li>
              <li>✓ Exclusive launch bonuses</li>
              <li>✓ Priority support during launch</li>
            </ul>

            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <a
                href="https://forms.gle/your-waitlist-form"
                className={styles.heroCta}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Join Waitlist</span>
              </a>
            </div>

            <div className={styles.guarantee}>
              No commitment • Get notified at launch • Exclusive early access
            </div>
          </div>
        </div>
      </section>

      {/* Why Perception Comes First */}
      <section className={styles.guide}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Perception Comes First</h2>
          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h3 className={styles.guideTitle}>You Can't Navigate What You Can't See</h3>
              <p className={styles.guideDescription}>
                Before you can locate yourself (Rite II) or choose a direction (Rite III),
                you need to see the system you're operating within. Perception is the foundation.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h3 className={styles.guideTitle}>Most People Are Blind</h3>
              <p className={styles.guideDescription}>
                They react to symptoms without seeing causes. They chase opportunities
                without recognizing patterns. They make decisions in the dark.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h3 className={styles.guideTitle}>Awareness Changes Everything</h3>
              <p className={styles.guideDescription}>
                Once you see the patterns, you can't unsee them. Once you recognize the system,
                you can work with it instead of against it. Perception unlocks everything else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Linking to Other Rites */}
      <section className={styles.otherRites}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Explore the Other Rites</h2>
          <div className={styles.ritesGrid}>
            <div className={styles.riteCard} style={{ opacity: 0.5, cursor: 'default' }}>
              <div className={styles.riteCardBadge}>RITE I</div>
              <h3 className={styles.riteCardTitle}>Perception</h3>
              <p className={styles.riteCardDescription}>Learn to see the patterns</p>
              <div className={styles.riteCardStatusCurrent}>You're here</div>
            </div>

            <Link href="/products/orientation" className={styles.riteCard}>
              <div className={styles.riteCardBadge}>RITE II</div>
              <h3 className={styles.riteCardTitle}>Orientation</h3>
              <p className={styles.riteCardDescription}>Locate yourself within the system</p>
              <div className={styles.riteCardStatus}>Available Now</div>
            </Link>

            <Link href="/products/declaration" className={styles.riteCard}>
              <div className={styles.riteCardBadge}>RITE III</div>
              <h3 className={styles.riteCardTitle}>Declaration</h3>
              <p className={styles.riteCardDescription}>Choose your direction</p>
              <div className={styles.riteCardStatus}>Coming Soon</div>
            </Link>
          </div>
          <div className={styles.ritesFooter}>
            <Link href="/the-rite-system" className={styles.ritesLink}>
              Learn more about The Rite System →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
