import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PortalNav from '@/components/portal/PortalNav';
import styles from './portal-layout.module.css';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', session.user.id)
    .single();

  return (
    <div className={styles.portalContainer}>
      <PortalNav userName={user?.name || user?.email || 'User'} />
      <main className={styles.portalMain}>
        {children}
      </main>
    </div>
  );
}
