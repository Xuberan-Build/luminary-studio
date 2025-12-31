import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import styles from "./perception.module.css";

export const metadata: Metadata = {
  title: "Rite I: Perception - Learn to See the System (Coming Soon)",
  description:
    "Five perception scans to help you move from ignorance to awareness. Learn to recognize the patterns, signals, and structures governing your reality. Join the waitlist.",
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
          <div className={styles.comingSoonBadge}>COMING SOON</div>
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
            Be first to access when Rite I launches. Waitlist members get early access and special pricing.
          </div>

          <a href="#waitlist" className={styles.heroCta}>
            <span>Join the Waitlist</span>
          </a>

          <div className={styles.trustIndicators}>
            <div className={styles.indicator}>
              <span className={styles.indicatorText}>5 Scans</span>
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

      {/* What Perception Does */}
      <section className={styles.purpose}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Perception Does</h2>
          <div className={styles.purposeGrid}>
            <div className={styles.purposeCard}>
              <h3 className={styles.purposeTitle}>The Shift</h3>
              <p className={styles.purposeDescription}>
                Perception moves you from <strong>ignorance</strong> to <strong>awareness</strong>.
                You'll stop being blind to the patterns governing your reality and start seeing the signals, structures, and systems at play.
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

      {/* The 5 Scans */}
      <section className={styles.scans}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>The Five Perception Scans</h2>
          <p className={styles.sectionSubtitle}>
            Each scan reveals a different layer of the system you've been operating within blindly.
          </p>

          <div className={styles.scansGrid}>
            {/* Signal Awareness Scan */}
            <div className={styles.scanCard}>
              <div className={styles.scanNumber}>1</div>
              <h3 className={styles.scanTitle}>Signal Awareness Scan</h3>
              <p className={styles.scanDescription}>
                Learn to recognize the signals your reality is sending you—through timing, synchronicities, and patterns.
                Stop missing the messages.
              </p>
              <div className={styles.scanWhat}>
                <h4>What you'll see:</h4>
                <ul>
                  <li>Recurring patterns in your environment</li>
                  <li>Timing signals you've been missing</li>
                  <li>Synchronicity recognition framework</li>
                  <li>Signal vs. noise differentiation</li>
                </ul>
              </div>
            </div>

            {/* Value Pattern Decoder */}
            <div className={styles.scanCard}>
              <div className={styles.scanNumber}>2</div>
              <h3 className={styles.scanTitle}>Value Pattern Decoder</h3>
              <p className={styles.scanDescription}>
                Identify the value systems driving your decisions—not what you think you value, but what your behavior reveals.
                See the invisible architecture of your choices.
              </p>
              <div className={styles.scanWhat}>
                <h4>What you'll see:</h4>
                <ul>
                  <li>Actual vs. stated values</li>
                  <li>Hidden value hierarchies</li>
                  <li>Value conflicts creating friction</li>
                  <li>Inherited vs. chosen values</li>
                </ul>
              </div>
            </div>

            {/* Boundary & Burnout Scan */}
            <div className={styles.scanCard}>
              <div className={styles.scanNumber}>3</div>
              <h3 className={styles.scanTitle}>Boundary & Burnout Scan</h3>
              <p className={styles.scanDescription}>
                See where your boundaries are porous and where your energy is leaking.
                Recognize the patterns leading to burnout before they consume you.
              </p>
              <div className={styles.scanWhat}>
                <h4>What you'll see:</h4>
                <ul>
                  <li>Energy leak identification</li>
                  <li>Boundary violation patterns</li>
                  <li>Burnout early warning signals</li>
                  <li>Recovery pattern analysis</li>
                </ul>
              </div>
            </div>

            {/* Money Signal Scan */}
            <div className={styles.scanCard}>
              <div className={styles.scanNumber}>4</div>
              <h3 className={styles.scanTitle}>Money Signal Scan</h3>
              <p className={styles.scanDescription}>
                Decode the money patterns in your life—earning, spending, saving, and the signals revealing your relationship with value exchange.
              </p>
              <div className={styles.scanWhat}>
                <h4>What you'll see:</h4>
                <ul>
                  <li>Money flow patterns</li>
                  <li>Value exchange beliefs</li>
                  <li>Scarcity vs. abundance signals</li>
                  <li>Revenue ceiling identification</li>
                </ul>
              </div>
            </div>

            {/* Competence Mapping Scan */}
            <div className={styles.scanCard}>
              <div className={styles.scanNumber}>5</div>
              <h3 className={styles.scanTitle}>Competence Mapping Scan</h3>
              <p className={styles.scanDescription}>
                See your actual competencies—not credentials or titles, but the real skills you've developed through lived experience.
                Map your mastery.
              </p>
              <div className={styles.scanWhat}>
                <h4>What you'll see:</h4>
                <ul>
                  <li>Real competencies vs. credentials</li>
                  <li>Mastery progression patterns</li>
                  <li>Skill transfer opportunities</li>
                  <li>Expertise blind spots</li>
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
            <h2 className={styles.bundleTitle}>The Complete Perception Bundle</h2>
            <p className={styles.bundleDescription}>
              Get all five perception scans and build complete pattern recognition across all domains.
            </p>

            <div className={styles.bundleValue}>
              <div className={styles.bundleValueLabel}>Estimated Value:</div>
              <div className={styles.bundleValueAmount}>$35</div>
              <div className={styles.bundleValueNote}>Bundle pricing TBD (waitlist gets special pricing)</div>
            </div>

            <div className={styles.bundleNote}>
              Join the waitlist to be notified when Perception launches and get early access pricing.
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className={styles.waitlist}>
        <div className={styles.container}>
          <div className={styles.waitlistCard}>
            <h2 className={styles.waitlistTitle}>Join the Waitlist</h2>
            <p className={styles.waitlistDescription}>
              Be first to know when Rite I: Perception launches. Waitlist members get:
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
              No spam. Unsubscribe anytime. We'll only email you about Rite I launch.
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Start Now? */}
      <section className={styles.readyNow}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Ready to Start Now?</h2>
          <p className={styles.readyNowDescription}>
            While you wait for Rite I, you can start with Rite II: Orientation.
            Most people have developed enough perception through experience—they just need help locating themselves.
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
              <div className={styles.riteCardStatusLive}>Available Now</div>
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
