import { redirect } from 'next/navigation';
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function resetSession(formData: FormData) {
  'use server';

  const productSlug = formData.get('productSlug') as string;
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return;
  }

  await supabase
    .from('product_sessions')
    .update({
      is_complete: false,
      completed_at: null,
      deliverable_content: null,
      deliverable_generated_at: null,
      current_step: 1,
      current_section: 1,
      placements_confirmed: false,
    })
    .eq('user_id', session.user.id)
    .eq('product_slug', productSlug);

  revalidatePath('/dashboard');
  redirect(`/products/${productSlug}/experience`);
}

async function getUserProducts(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get user's product access
  const { data: productAccess, error } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', userId)
    .eq('access_granted', true);

  if (error) {
    console.error('Error fetching product access:', error);
    return [];
  }

  if (!productAccess || productAccess.length === 0) {
    return [];
  }

  // Get product definitions for each access
  const products = await Promise.all(
    productAccess.map(async (access) => {
      const { data: product } = await supabase
        .from('product_definitions')
        .select('*')
        .eq('product_slug', access.product_slug)
        .single();

      return {
        ...access,
        product_definitions: product
      };
    })
  );

  return products;
}

async function getUserSessions(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_sessions')
      .select('*')
      .eq('user_id', userId)
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

  const products = await getUserProducts(session.user.id);
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
              <p>You don't have any products yet.</p>
              <Link href="/" className={styles.browseButton}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map((access: any) => {
                const product = access.product_definitions;
                const isStarted = access.started_at !== null;
                const isComplete = access.completed_at !== null;

                return (
                  <div key={access.id} className={styles.productCard}>
                    <div className={styles.productHeader}>
                      <h3>{product.name}</h3>
                      {isComplete && (
                        <span className={styles.badge}>✅ Complete</span>
                      )}
                      {!isComplete && isStarted && (
                        <span className={styles.badgeInProgress}>
                          In Progress
                        </span>
                      )}
                    </div>

                    <p className={styles.productDescription}>
                      {product.description}
                    </p>

                    <div className={styles.productMeta}>
                      <span>⏱️ {product.estimated_duration}</span>
                      <span>📝 {product.total_steps} steps</span>
                    </div>

                    <Link
                      href={`/products/${product.product_slug}/experience`}
                      className={styles.productButton}
                    >
                      {isComplete ? 'View Results' : isStarted ? 'Continue' : 'Start'}
                    </Link>
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
              {sessions.map((s: any) => {
                const completed = !!s.completed_at;
                return (
                  <div key={s.id} className={styles.productCard}>
                    <div className={styles.productHeader}>
                      <h3>{s.product_slug}</h3>
                      {completed ? (
                        <span className={styles.badge}>✅ Complete</span>
                      ) : (
                        <span className={styles.badgeInProgress}>In Progress</span>
                      )}
                    </div>
                    <p className={styles.productDescription}>
                      {completed
                        ? 'View your final briefing and full chat transcript.'
                        : 'Finish the experience to unlock your briefing.'}
                    </p>
                    <div className={styles.productMeta}>
                      <span>Started: {new Date(s.created_at).toLocaleDateString()}</span>
                      <span>Status: {completed ? 'Completed' : 'Active'}</span>
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
                      <form action={resetSession} style={{ display: 'inline' }}>
                        <input type="hidden" name="productSlug" value={s.product_slug} />
                        <button
                          type="submit"
                          className={styles.secondaryButton}
                          style={{
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          ↻ Reset Session
                        </button>
                      </form>
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
