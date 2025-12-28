import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import DeliverableViewer from './DeliverableViewer';

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
    <div className="min-h-screen bg-gradient-to-b from-[#05060d] via-[#0a0b14] to-[#05060d] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 inline-block rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 px-4 py-1.5 text-xs font-medium tracking-wide text-violet-200">
              YOUR QUANTUM BLUEPRINT
            </div>
            <h1 className="bg-gradient-to-r from-white via-violet-100 to-purple-200 bg-clip-text text-4xl font-bold text-transparent">
              {session.product_slug === 'quantum-initiation' ? 'Quantum Initiation Protocol' : 'Product Session'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Completed {new Date(session.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-violet-500/50 hover:bg-violet-500/10"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Main Briefing */}
        <DeliverableViewer
          deliverable={session.deliverable}
          productName={session.product_slug === 'quantum-initiation' ? 'Quantum Initiation Protocol' : 'Product'}
        />

        {/* Chat Transcript - Collapsible */}
        <details className="group mt-8" open>
          <summary className="cursor-pointer list-none">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-violet-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                    <span className="text-lg">💬</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Chat Transcript</h3>
                    <p className="text-xs text-slate-400">{conversations.length} conversation steps</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-1 text-xs text-violet-300 transition-transform group-open:rotate-180">
                  ▼
                </div>
              </div>
            </div>
          </summary>

          <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-6">
            {conversations.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {conversations.map((c: any, convIdx: number) => (
                  <div key={c.id} className="space-y-3">
                    {/* Step Header */}
                    <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30">
                        {c.step_number}
                      </div>
                      <span>Step {c.step_number}</span>
                    </div>

                    {/* Messages */}
                    {((c.messages as any[]) || []).map((m: any, idx: number) => (
                      <div
                        key={`${c.id}-${idx}`}
                        className={`rounded-xl border p-4 ${
                          m.role === 'assistant'
                            ? 'border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`text-xs font-semibold ${
                            m.role === 'assistant' ? 'text-violet-300' : 'text-blue-300'
                          }`}>
                            {m.role === 'assistant' ? '🔮 QBF Wizard' : '👤 You'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(m.created_at || c.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                          {m.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
