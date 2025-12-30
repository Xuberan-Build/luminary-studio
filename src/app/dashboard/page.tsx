import { redirect } from 'next/navigation';
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { revalidatePath } from 'next/cache';
import SessionVersionManager from '@/components/dashboard/SessionVersionManager';

export const dynamic = 'force-dynamic';

async function createNewVersion(formData: FormData) {
  'use server';

  const productSlug = formData.get('productSlug') as string;
  const parentSessionId = formData.get('parentSessionId') as string;
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return;
  }

  // Call database function to create new version
  const { data: newSessionId, error } = await supabase.rpc(
    'create_session_version',
    {
      p_user_id: session.user.id,
      p_product_slug: productSlug,
      p_parent_session_id: parentSessionId,
    }
  );

  if (error) {
    console.error('Error creating new version:', error);
    return;
  }

  revalidatePath('/dashboard');
  redirect(`/products/${productSlug}/experience`);
}

async function getAllProductsWithAccess(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get ALL product definitions
  const { data: allProducts, error: productsError } = await supabase
    .from('product_definitions')
    .select('*')
    .order('created_at', { ascending: true });

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  if (!allProducts || allProducts.length === 0) {
    return [];
  }

  // Get user's product access
  const { data: productAccess } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', userId)
    .eq('access_granted', true);

  // Map products to include access status
  const productsWithAccess = allProducts.map((product) => {
    const access = productAccess?.find(
      (a) => a.product_slug === product.product_slug
    );

    return {
      product: product,
      access: access || null,
      hasAccess: !!access,
    };
  });

  return productsWithAccess;
}

async function getUserSessions(userId: string) {
  try {
    // Get only latest versions of each product
    const { data, error } = await supabaseAdmin
      .from('product_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_latest_version', true)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching sessions:', error?.message || error);
      return [];
    }
    return data || [];
  } catch (e: any) {
    console.error('Error fetching sessions:', e?.message || e);
    return [];
  }
}

async function getSessionAttempts(userId: string, productSlug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_access')
      .select('free_attempts_used, free_attempts_limit')
      .eq('user_id', userId)
      .eq('product_slug', productSlug)
      .single();

    if (error) {
      console.error('Error fetching attempts:', error?.message || error);
      return { used: 0, limit: 2, remaining: 2 };
    }

    return {
      used: data?.free_attempts_used || 0,
      limit: data?.free_attempts_limit || 2,
      remaining: (data?.free_attempts_limit || 2) - (data?.free_attempts_used || 0),
    };
  } catch (e: any) {
    console.error('Error fetching attempts:', e?.message || e);
    return { used: 0, limit: 2, remaining: 2 };
  }
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const products = await getAllProductsWithAccess(session.user.id);
  const sessions = await getUserSessions(session.user.id);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome back, {user?.name || 'there'}!</h1>
        <p className={styles.subtitle}>Manage your products and view your progress</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Your Products</h2>

          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No products available yet.</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map((item: any) => {
                const product = item.product;
                const access = item.access;
                const hasAccess = item.hasAccess;
                const isStarted = access?.started_at !== null;
                const isComplete = access?.completed_at !== null;

                return (
                  <div key={product.product_slug} className={styles.productCard}>
                    <div className={styles.productHeader}>
                      <h3>{product.name}</h3>
                      {hasAccess && isComplete && (
                        <span className={styles.badge}>Complete</span>
                      )}
                      {hasAccess && !isComplete && isStarted && (
                        <span className={styles.badgeInProgress}>
                          In Progress
                        </span>
                      )}
                      {!hasAccess && (
                        <span className={styles.badgeLocked}>
                          ${product.price}
                        </span>
                      )}
                    </div>

                    <p className={styles.productDescription}>
                      {product.description}
                    </p>

                    <div className={styles.productMeta}>
                      <span>{product.estimated_duration}</span>
                      <span>{product.total_steps} steps</span>
                    </div>

                    {hasAccess ? (
                      <Link
                        href={`/products/${product.product_slug}/experience`}
                        className={styles.productButton}
                      >
                        {isComplete ? 'View Results' : isStarted ? 'Continue' : 'Start'}
                      </Link>
                    ) : (
                      <Link
                        href={`/products/${product.product_slug}#purchase`}
                        className={styles.purchaseButton}
                      >
                        Purchase for ${product.price}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2>Your Assets & Briefings</h2>
          {sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No sessions yet for this account. Finish or resume a product to unlock your briefing and chat history.</p>
              <Link href="/products/quantum-initiation/experience" className={styles.browseButton}>
                Resume Quantum Initiation
              </Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {sessions.map(async (s: any) => {
                const completed = !!s.completed_at;
                const attempts = await getSessionAttempts(session.user.id, s.product_slug);

                return (
                  <div key={s.id} className={styles.productCard}>
                    <div className={styles.productHeader}>
                      <h3>{s.product_slug}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {s.version > 1 && (
                          <span className={styles.versionBadge}>v{s.version}</span>
                        )}
                        {completed ? (
                          <span className={styles.badge}>Complete</span>
                        ) : (
                          <span className={styles.badgeInProgress}>In Progress</span>
                        )}
                      </div>
                    </div>
                    <p className={styles.productDescription}>
                      {completed
                        ? 'View your final briefing and full chat transcript.'
                        : 'Finish the experience to unlock your briefing.'}
                    </p>
                    <div className={styles.productMeta}>
                      <span>Started: {new Date(s.created_at).toLocaleDateString()}</span>
                      <span>Attempts: {attempts.used}/{attempts.limit}</span>
                    </div>
                    <div className={styles.productActions}>
                      <Link
                        href={`/dashboard/sessions/${s.id}`}
                        className={styles.productButton}
                      >
                        {completed ? 'View Briefing & Chat' : 'Resume Session'}
                      </Link>
                      <Link
                        href={`/products/${s.product_slug}/experience`}
                        className={styles.secondaryButton}
                      >
                        Go to Experience
                      </Link>
                      <SessionVersionManager
                        sessionId={s.id}
                        productSlug={s.product_slug}
                        attemptsRemaining={attempts.remaining}
                        createNewVersionAction={createNewVersion}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
