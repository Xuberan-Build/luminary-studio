import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductExperience from '@/components/product-experience/ProductExperience';

export const dynamic = 'force-dynamic';

export default async function ProductExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params (Next.js 15+ requirement)
  const { slug } = await params;

  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirect=/products/${slug}/experience`);
  }

  // Check product access
  const { data: access } = await supabase
    .from('product_access')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('product_slug', slug)
    .eq('access_granted', true)
    .single();

  if (!access) {
    redirect('/dashboard?error=no-access');
  }

  // Get product definition
  const { data: product } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', slug)
    .single();

  if (!product) {
    redirect('/dashboard?error=product-not-found');
  }

  // Get or create session
  let { data: productSession } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('product_slug', slug)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!productSession) {
    // Create new session
    const { data: newSession } = await supabase
      .from('product_sessions')
      .insert({
        user_id: session.user.id,
        product_slug: slug,
        total_steps: product.total_steps,
        current_step: 1,
        placements_confirmed: false,
        placements: null,
        current_section: 1,
      })
      .select()
      .single();

      productSession = newSession;

      // Update access started_at
      await supabase
        .from('product_access')
      .update({ started_at: new Date().toISOString() })
        .eq('id', access.id);
  }

  // Treat missing/placeholder placements as not confirmed
  const placementsEmpty = (pl: any) => {
    if (!pl) return true;
    const astro = pl.astrology || {};
    const hd = pl.human_design || {};
    const astroHas = Object.values(astro).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    );
    const hdHas = Object.values(hd).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    );
    const notesHas =
      pl.notes && typeof pl.notes === 'string' && pl.notes.trim().length > 0;
    return !(astroHas || hdHas || notesHas);
  };

  const needsConfirmation =
    !productSession.placements_confirmed || placementsEmpty(productSession.placements);

  console.log('[experience] Session loaded:', {
    sessionId: productSession.id,
    placementsConfirmed: productSession.placements_confirmed,
    placementsEmpty: placementsEmpty(productSession.placements),
    placementsPresent: !!productSession.placements,
    currentStep: productSession.current_step,
    totalSteps: product.total_steps,
  });

  if (productSession.placements) {
    console.log('[experience] Placements from DB:', JSON.stringify(productSession.placements, null, 2));
  }

  if (needsConfirmation) {
    console.log('[experience] Forcing confirmation due to missing/empty placements');
    // Normalize session on the server so the client can't skip confirmation
    await supabase
      .from('product_sessions')
      .update({
        current_step: 1,
        placements_confirmed: false,
        placements: placementsEmpty(productSession.placements) ? null : productSession.placements,
        current_section: 1,
      })
      .eq('id', productSession.id);

    productSession = {
      ...productSession,
      current_step: 1,
      placements_confirmed: false,
      placements: placementsEmpty(productSession.placements)
        ? null
        : productSession.placements,
      current_section: 1,
    };
  } else if (productSession.current_step === 1 && productSession.placements_confirmed) {
    // Placements are valid and confirmed - keep on step 1 to show confirmation gate
    // The client will show a gate asking user to confirm or re-upload
    console.log('[experience] Placements confirmed - keeping on step 1 to show confirmation gate');
  }

  return (
    <ProductExperience
      product={product}
      session={productSession}
      userId={session.user.id}
    />
  );
}
