import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import styles from "./declaration.module.css";

export const metadata: Metadata = {
  title: "Rite III: Declaration - Choose Your Direction",
  description:
    "Three declaration protocols to help you move from possibility to commitment. Transform vague intention into committed direction.",
};

export default function RiteIIIDeclarationPage() {
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
          <div className={styles.riteBadge}>RITE III: DECLARATION</div>

          <h1 className={styles.heroTitle}>
            Choose Your Direction
            <span className={styles.titleAccent}>Possibility → Commitment</span>
          </h1>

          <p className={styles.heroDescription}>
            Three declaration protocols to transform clarity into committed action.
            <br />
            This is where strategy begins.
          </p>

          <div className={styles.heroMicrocopy}>
            Get notified when Rite III launches. Be first to access the three declaration protocols.
          </div>

          <a href="#waitlist" className={styles.heroCta}>
            <span>Join the Waitlist</span>
          </a>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>3 Declaration Protocols</span>
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

      {/* What Declaration Does */}
      <section className={styles.purpose}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Declaration Does</h2>
          <div className={styles.purposeGrid}>
            <div className={styles.purposeCard}>
              <h3 className={styles.purposeTitle}>The Shift</h3>
              <p className={styles.purposeDescription}>
                Declaration moves you from <strong>possibility</strong> to <strong>commitment</strong>.
                You'll stop exploring options and start executing on a chosen direction. This is where clarity becomes strategy.
              </p>
            </div>
            <div className={styles.purposeCard}>
              <h3 className={styles.purposeTitle}>How It Fits</h3>
              <p className={styles.purposeDescription}>
                This is the third rite in the system. Rite I helps you <em>see</em> the patterns.
                Rite II helps you <em>locate yourself</em> within them. Rite III helps you <em>choose your direction</em>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Declaration Protocols */}
      <section className={styles.products}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Three Declaration Protocols</h2>
          <p className={styles.sectionSubtitle}>
            Each protocol transforms vague possibility into committed direction across a specific domain.
          </p>

          <div className={styles.productGrid}>
            {/* Protocol 1 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Protocol 1</div>
              <h3 className={styles.productTitle}>Personal Direction Declaration</h3>
              <p className={styles.productDescription}>
                Declare your personal direction—where you're going, what you're becoming, and what you're committing to in your life.
                No more vague aspirations. This is your chosen path.
              </p>
              <ul className={styles.productFeatures}>
                <li>Your chosen life direction</li>
                <li>Identity commitments</li>
                <li>Non-negotiable boundaries</li>
                <li>Success definitions</li>
                <li>Personal evolution milestones</li>
              </ul>
            </div>

            {/* Protocol 2 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Protocol 2</div>
              <h3 className={styles.productTitle}>Business Direction Declaration</h3>
              <p className={styles.productDescription}>
                Declare your business direction—the market you're serving, the problems you're solving, and the strategy you're executing.
                Transform business ideas into committed strategy.
              </p>
              <ul className={styles.productFeatures}>
                <li>Target market commitment</li>
                <li>Core problem statement</li>
                <li>Revenue model decision</li>
                <li>Growth strategy declaration</li>
                <li>Business evolution roadmap</li>
              </ul>
            </div>

            {/* Protocol 3 */}
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Protocol 3</div>
              <h3 className={styles.productTitle}>Ideal Life Direction Declaration</h3>
              <p className={styles.productDescription}>
                Declare your ideal life direction—how you want to live, what lifestyle you're building toward, and the integration of all domains.
                This is where personal and business directions converge.
              </p>
              <ul className={styles.productFeatures}>
                <li>Lifestyle architecture</li>
                <li>Work-life integration model</li>
                <li>Freedom definition</li>
                <li>Legacy intention</li>
                <li>Complete vision statement</li>
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
            <h2 className={styles.bundleTitle}>Join the Declaration Waitlist</h2>
            <p className={styles.bundleDescription}>
              Be first to access when Rite III launches. Waitlist members get early access and special pricing.
            </p>

            <div className={styles.bundlePrice}>
              <div className={styles.bundlePriceMain}>
                <span className={styles.bundlePriceAmount}>Early Access</span>
                <span className={styles.bundlePricePeriod}>coming soon</span>
              </div>
            </div>

            <ul className={styles.bundleFeatures}>
              <li>✓ First access to all 3 declaration protocols</li>
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

      {/* Why Declaration Comes Last */}
      <section className={styles.guide}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Declaration Comes Last</h2>
          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h3 className={styles.guideTitle}>You Can't Declare Without Foundation</h3>
              <p className={styles.guideDescription}>
                Declaration requires you to see the patterns (Rite I) and know where you are (Rite II).
                Without this foundation, declarations are hollow and commitments waver.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h3 className={styles.guideTitle}>Most People Skip the Foundation</h3>
              <p className={styles.guideDescription}>
                They declare goals without perception or orientation. That's why their strategies fail,
                their commitments dissolve, and their direction keeps shifting.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h3 className={styles.guideTitle}>The System Is Sequential</h3>
              <p className={styles.guideDescription}>
                Rite III works because it comes third. First you see what's possible. Then you know where you are.
                Only then can you commit to a direction with full conviction.
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
            <Link href="/products/perception" className={styles.riteCard}>
              <div className={styles.riteCardBadge}>RITE I</div>
              <h3 className={styles.riteCardTitle}>Perception</h3>
              <p className={styles.riteCardDescription}>Learn to see the patterns</p>
              <div className={styles.riteCardStatus}>Coming Soon</div>
            </Link>

            <Link href="/products/orientation" className={styles.riteCard}>
              <div className={styles.riteCardBadge}>RITE II</div>
              <h3 className={styles.riteCardTitle}>Orientation</h3>
              <p className={styles.riteCardDescription}>Locate yourself within the system</p>
              <div className={styles.riteCardStatus}>Available Now</div>
            </Link>

            <div className={styles.riteCard} style={{ opacity: 0.5, cursor: 'default' }}>
              <div className={styles.riteCardBadge}>RITE III</div>
              <h3 className={styles.riteCardTitle}>Declaration</h3>
              <p className={styles.riteCardDescription}>Choose your direction</p>
              <div className={styles.riteCardStatusCurrent}>You're here</div>
            </div>
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
