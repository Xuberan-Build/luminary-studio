import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProfileEditor from '@/components/profile/ProfileEditor';
import styles from '../dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch user's profile placements
  const { data: userData, error } = await supabase
    .from('users')
    .select('placements, placements_confirmed, placements_updated_at')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Chart Data</h1>
        <p className={styles.subtitle}>
          Manage your astrology and Human Design placements in one place
        </p>
      </div>
      <div className={styles.main}>
        <ProfileEditor
          initialPlacements={userData?.placements || null}
          placementsConfirmed={userData?.placements_confirmed || false}
          placementsUpdatedAt={userData?.placements_updated_at || null}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
