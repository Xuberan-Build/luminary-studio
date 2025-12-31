import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import styles from "./declaration.module.css";

export const metadata: Metadata = {
  title: "Rite III: Declaration - Choose Your Direction (Coming Soon)",
  description:
    "Three declaration protocols to help you move from possibility to commitment. Transform vague intention into committed direction. Join the waitlist.",
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
          <div className={styles.comingSoonBadge}>COMING SOON</div>
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
            Be first to access when Rite III launches. Waitlist members get early access and special pricing.
          </div>

          <a href="#waitlist" className={styles.heroCta}>
            <span>Join the Waitlist</span>
          </a>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>3 Declarations</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>Early Access</span>
            </div>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>Special Pricing</span>
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

      {/* The 3 Declarations */}
      <section className={styles.declarations}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Three Declarations</h2>
          <p className={styles.sectionSubtitle}>
            Each declaration transforms vague possibility into committed direction across a specific domain.
          </p>

          <div className={styles.declarationsGrid}>
            {/* Personal Direction Declaration */}
            <div className={styles.declarationCard}>
              <div className={styles.declarationNumber}>1</div>
              <h3 className={styles.declarationTitle}>Personal Direction Declaration</h3>
              <p className={styles.declarationDescription}>
                Declare your personal direction—where you're going, what you're becoming, and what you're committing to in your life.
                No more vague aspirations. This is your chosen path.
              </p>
              <div className={styles.declarationWhat}>
                <h4>What you'll declare:</h4>
                <ul>
                  <li>Your chosen life direction</li>
                  <li>Identity commitments</li>
                  <li>Non-negotiable boundaries</li>
                  <li>Success definitions</li>
                  <li>Personal evolution milestones</li>
                </ul>
              </div>
            </div>

            {/* Business Direction Declaration */}
            <div className={styles.declarationCard}>
              <div className={styles.declarationNumber}>2</div>
              <h3 className={styles.declarationTitle}>Business Direction Declaration</h3>
              <p className={styles.declarationDescription}>
                Declare your business direction—the market you're serving, the problems you're solving, and the strategy you're executing.
                Transform business ideas into committed strategy.
              </p>
              <div className={styles.declarationWhat}>
                <h4>What you'll declare:</h4>
                <ul>
                  <li>Target market commitment</li>
                  <li>Core problem statement</li>
                  <li>Revenue model decision</li>
                  <li>Growth strategy declaration</li>
                  <li>Business evolution roadmap</li>
                </ul>
              </div>
            </div>

            {/* Ideal Life Direction Declaration */}
            <div className={styles.declarationCard}>
              <div className={styles.declarationNumber}>3</div>
              <h3 className={styles.declarationTitle}>Ideal Life Direction Declaration</h3>
              <p className={styles.declarationDescription}>
                Declare your ideal life direction—how you want to live, what lifestyle you're building toward, and the integration of all domains.
                This is where personal and business directions converge.
              </p>
              <div className={styles.declarationWhat}>
                <h4>What you'll declare:</h4>
                <ul>
                  <li>Lifestyle architecture</li>
                  <li>Work-life integration model</li>
                  <li>Freedom definition</li>
                  <li>Legacy intention</li>
                  <li>Complete vision statement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle Preview */}
      <section className={styles.bundle}>
        <div className={styles.container}>
          <div className={styles.bundleCard}>
            <div className={styles.bundleBadge}>COMING SOON</div>
            <h2 className={styles.bundleTitle}>The Complete Declaration Bundle</h2>
            <p className={styles.bundleDescription}>
              Get all three declaration protocols and build a complete directional strategy across all life domains.
            </p>

            <div className={styles.bundleValue}>
              <div className={styles.bundleValueLabel}>Estimated Value:</div>
              <div className={styles.bundleValueAmount}>$21</div>
              <div className={styles.bundleValueNote}>Bundle pricing TBD (waitlist gets special pricing)</div>
            </div>

            <div className={styles.bundleNote}>
              Join the waitlist to be notified when Declaration launches and get early access pricing.
            </div>
          </div>
        </div>
      </section>

      {/* Why Declaration Comes Last */}
      <section className={styles.whyLast}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Declaration Comes Last</h2>
          <div className={styles.whyLastContent}>
            <p className={styles.whyLastText}>
              You can't declare a direction if you can't see the patterns (Rite I) or don't know where you are (Rite II).
            </p>
            <p className={styles.whyLastText}>
              Declaration requires foundation. You need perception to see what's possible.
              You need orientation to know your starting point. Only then can you commit to a direction with full conviction.
            </p>
            <p className={styles.whyLastText}>
              Most people skip straight to declaring goals without building this foundation.
              That's why their declarations feel hollow, their commitments waver, and their strategies fail.
            </p>
            <p className={styles.whyLastText}>
              <strong>Rite III works because it comes third.</strong> The system is sequential for a reason.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className={styles.waitlist}>
        <div className={styles.container}>
          <div className={styles.waitlistCard}>
            <h2 className={styles.waitlistTitle}>Join the Waitlist</h2>
            <p className={styles.waitlistDescription}>
              Be first to know when Rite III: Declaration launches. Waitlist members get:
            </p>
            <ul className={styles.waitlistBenefits}>
              <li>✓ Early access before public launch</li>
              <li>✓ Special waitlist-only pricing</li>
              <li>✓ First pick of launch bonuses</li>
              <li>✓ Updates on development progress</li>
            </ul>

            <form className={styles.waitlistForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.waitlistInput}
                required
              />
              <button type="submit" className={styles.waitlistButton}>
                Join Waitlist
              </button>
            </form>

            <div className={styles.waitlistMeta}>
              No spam. Unsubscribe anytime. We'll only email you about Rite III launch.
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Start Now? */}
      <section className={styles.readyNow}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Ready to Start Now?</h2>
          <p className={styles.readyNowDescription}>
            While you wait for Rite III, start with Rite II: Orientation.
            You need to know where you are before you can declare where you're going.
          </p>
          <Link href="/products/orientation" className={styles.readyNowButton}>
            Try Rite II: Orientation ($17 bundle)
          </Link>
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
              <div className={styles.riteCardStatusLive}>Available Now</div>
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
