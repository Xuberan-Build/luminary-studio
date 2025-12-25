import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function getSessionData(sessionId: string, userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: session, error } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error || !session) return null;

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id,step_number,messages,created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  return { session, conversations: conversations || [] };
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { session: authSession },
  } = await supabase.auth.getSession();

  if (!authSession) {
    redirect('/login');
  }

  const payload = await getSessionData(id, authSession.user.id);
  if (!payload) {
    redirect('/dashboard');
  }

  const { session, conversations } = payload;

  return (
    <div className="min-h-screen bg-[#05060d] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-teal-200/80">Session</p>
            <h1 className="text-3xl font-semibold">Briefing & Chat</h1>
            <p className="text-sm text-slate-300 mt-1">Product: {session.product_slug}</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Final Briefing</p>
            {session.deliverable_content ? (
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-100 leading-relaxed">
                {session.deliverable_content}
              </pre>
            ) : (
              <p className="mt-3 text-sm text-slate-300">
                Complete the experience to generate your briefing.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Placements</p>
            {session.placements ? (
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-100 leading-relaxed">
                {JSON.stringify(session.placements, null, 2)}
              </pre>
            ) : (
              <p className="mt-3 text-sm text-slate-300">
                Placements not recorded yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">Chat transcript</p>
            <span className="text-xs text-slate-400">{conversations.length} steps logged</span>
          </div>
          <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {conversations.length === 0 && (
              <p className="text-sm text-slate-300">No messages yet.</p>
            )}
            {conversations.flatMap((c: any) =>
              ((c.messages as any[]) || []).map((m: any, idx: number) => (
                <div
                  key={`${c.id}-${idx}`}
                  className="rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>
                      Step {c.step_number} · {m.type || m.role}
                    </span>
                    <span>{new Date(m.created_at || c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-100 whitespace-pre-wrap">
                    <span className="font-semibold text-teal-200">{m.role === 'assistant' ? 'Assistant' : 'You'}:</span>{' '}
                    {m.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
