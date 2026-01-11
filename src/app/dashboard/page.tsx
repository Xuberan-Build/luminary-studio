import { redirect } from 'next/navigation';
import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase/server';
import styles from './dashboard.module.css';
import { revalidatePath } from 'next/cache';
import { getProductBySlug } from '@/lib/constants/products';
import ProductTable from '@/components/dashboard/ProductTable';
import Link from 'next/link';
import { ALL_BETA_PRODUCTS } from '@/lib/beta/constants';

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

function getRiteLabel(productSlug: string) {
  if (productSlug.startsWith('perception-rite-')) {
    return 'Rite I';
  }
  if (productSlug === 'personal-alignment' || productSlug === 'business-alignment' || productSlug === 'brand-alignment' || productSlug === 'orientation-bundle') {
    return 'Rite II';
  }
  if (productSlug.startsWith('declaration-rite-')) {
    return 'Rite III';
  }
  return 'Other';
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
  const sessionBySlug = new Map(sessions.map((s) => [s.product_slug, s]));
  const attemptsEntries = await Promise.all(
    sessions.map(async (s) => [
      s.product_slug,
      await getSessionAttempts(session.user.id, s.product_slug),
    ])
  );
  const attemptsBySlug = new Map(attemptsEntries);

  const nextActionItem = (() => {
    for (const s of sessions) {
      if (!s.completed_at) {
        return { slug: s.product_slug, label: 'Continue' };
      }
    }
    const unlocked = products.find((p: any) => p.hasAccess);
    if (unlocked) {
      return { slug: unlocked.product.product_slug, label: 'Start' };
    }
    const betaProduct = products.find((p: any) => ALL_BETA_PRODUCTS.includes(p.product.product_slug as any));
    if (betaProduct) {
      return { slug: 'beta', label: 'Join Beta' };
    }
    const first = products[0];
    if (first) {
      return { slug: first.product.product_slug, label: 'View' };
    }
    return null;
  })();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome back, {user?.name || 'there'}!</h1>
        <p className={styles.subtitle}>Manage your products and view your progress</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.nextActionCard}>
            <div>
              <h2 className={styles.nextActionTitle}>Next Action</h2>
              <p className={styles.nextActionSubtitle}>
                Continue where you left off or start your next product.
              </p>
            </div>
            {nextActionItem ? (
              <Link
                href={nextActionItem.slug === 'beta' ? '/products/beta' : `/products/${nextActionItem.slug}/experience`}
                className={styles.nextActionButton}
              >
                {nextActionItem.label} {nextActionItem.slug === 'beta' ? '' : (getProductBySlug(nextActionItem.slug)?.name || nextActionItem.slug)}
              </Link>
            ) : (
              <span className={styles.nextActionEmpty}>No products available yet.</span>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Your Products</h2>
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No products available yet.</p>
            </div>
          ) : (
            <ProductTable
              rows={products.map((item: any) => {
                const product = item.product;
                const access = item.access;
                const hasAccess = item.hasAccess;
                const sessionRow = sessionBySlug.get(product.product_slug);
                const attempts = attemptsBySlug.get(product.product_slug);
                const completed = !!sessionRow?.completed_at || !!access?.completed_at;
                const started = !!sessionRow || !!access?.started_at;
                const status = !hasAccess
                  ? 'Locked'
                  : completed
                    ? 'Complete'
                    : started
                      ? 'In Progress'
                      : 'Ready';
                const statusClass = !hasAccess
                  ? 'statusLocked'
                  : completed
                    ? 'statusComplete'
                    : started
                      ? 'statusInProgress'
                      : 'statusUnlocked';
                const statusRank = status === 'In Progress'
                  ? 0
                  : status === 'Ready'
                    ? 1
                    : status === 'Locked'
                      ? 2
                      : 3;
                const totalSteps = Number(sessionRow?.total_steps || product.total_steps || 0);
                const currentStep = Number(sessionRow?.current_step || 0);
                const progressValue = completed
                  ? 1
                  : totalSteps
                    ? Math.min(currentStep / totalSteps, 1)
                    : 0;
                const progress = completed
                  ? '100%'
                  : sessionRow && totalSteps
                    ? `Step ${currentStep || 1} / ${totalSteps}`
                    : '0%';
                const lastActivity = sessionRow?.last_activity_at || sessionRow?.updated_at || access?.purchase_date;
                const lastActivityTimestamp = lastActivity
                  ? new Date(lastActivity).getTime()
                  : 0;
                const lastActivityLabel = lastActivity
                  ? new Date(lastActivity).toLocaleDateString()
                  : '—';
                const isBetaProduct = ALL_BETA_PRODUCTS.includes(product.product_slug as any);
                const primaryHref = !hasAccess
                  ? isBetaProduct
                    ? '/products/beta'
                    : `/products/${product.product_slug}#purchase`
                  : completed && sessionRow
                    ? `/dashboard/sessions/${sessionRow.id}`
                    : `/products/${product.product_slug}/experience`;
                const primaryLabel = !hasAccess
                  ? isBetaProduct
                    ? 'Join Beta (Free)'
                    : `Buy Access $${product.price}`
                  : completed
                    ? 'View Report'
                    : started
                      ? 'Continue Scan'
                      : 'Start Scan';

                return {
                  slug: product.product_slug,
                  name: product.name,
                  estimatedDuration: product.estimated_duration || '—',
                  totalSteps: Number(product.total_steps || 0),
                  riteLabel: getRiteLabel(product.product_slug),
                  statusLabel: status,
                  statusClass,
                  statusRank,
                  progressLabel: progress,
                  progressValue,
                  lastActivityLabel,
                  lastActivityTimestamp,
                  primaryHref,
                  primaryLabel,
                  primaryVariant: hasAccess ? 'primary' : 'purchase',
                  detailsHref: `/products/${product.product_slug}`,
                  showChat: completed && !!sessionRow,
                  chatHref: sessionRow ? `/dashboard/sessions/${sessionRow.id}` : undefined,
                  sessionId: sessionRow?.id,
                  attemptsRemaining: attempts?.remaining ?? null,
                };
              })}
              createNewVersionAction={createNewVersion}
            />
          )}
        </section>
      </main>
    </div>
  );
}
