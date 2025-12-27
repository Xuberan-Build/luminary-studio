-- Step titles/questions for quantum-initiation (steps are 1-indexed)
update product_definitions
set steps = jsonb_build_array(
  jsonb_build_object(
    'step', 1,
    'title', 'Upload Your Charts',
    'description', 'Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Quantum Brand Identity Blueprint.',
    'allow_file_upload', true,
    'file_upload_prompt', 'Upload your charts as PDF, PNG, or JPG. You can upload multiple files.'
  ),
  jsonb_build_object(
    'step', 2,
    'title', 'Money & Current Reality',
    'question', 'How are you currently earning money and how aligned does it feel (1-10)? Then describe your desired state: What would perfectly aligned earning look like for you? (Think: recurring, high-ticket, productized, volume, passive, etc.)'
  ),
  jsonb_build_object(
    'step', 3,
    'title', 'Current Bottleneck',
    'question', 'Which block fits best right now: audience, offer clarity, delivery/ops, cashflow, or confidence/visibility? If unsure, describe your biggest day-to-day frustration.'
  ),
  jsonb_build_object(
    'step', 4,
    'title', 'Offer / Creation Focus',
    'question', 'What do you want to create or sell next? What outcome should it deliver, and what proof/assets support it (testimonials, IP, community, brand materials)?'
  ),
  jsonb_build_object(
    'step', 5,
    'title', 'Energy & Readiness',
    'question', 'What drains you vs. energizes you? What is the fastest proof or revenue you could produce in 30 days?'
  )
)
where product_slug = 'quantum-initiation';

-- Prompts table: create if not exists (idempotent check)
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'prompts'
  ) then
    create table public.prompts (
      id uuid primary key default gen_random_uuid(),
      product_slug text not null,
      scope text not null, -- e.g., system, step_insight, followup, final_briefing
      step_number int,     -- nullable for global prompts
      prompt text not null,
      created_at timestamptz default now()
    );
    create index on public.prompts (product_slug, scope, step_number);
  end if;
end$$;

-- Upsert prompts for quantum-initiation
-- System prompt (global)
insert into public.prompts (product_slug, scope, step_number, prompt)
values
(
  'quantum-initiation',
  'system',
  null,
  'You are the Quantum Brand Architect AI (Sage–Magician). You must be concise, chart-aware (money/identity houses 2/8/10/11; Sun/Moon/Rising; Mars/Venus/Mercury/Saturn/Pluto; HD type/strategy/authority/profile/centers/gifts), and always offer an actionable nudge. Never fabricate unknown data; ask for missing pieces briefly (especially 2nd-house ruler/location).'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;

-- Step insight prompt (used for step-insight API)
insert into public.prompts (product_slug, scope, step_number, prompt)
values
(
  'quantum-initiation',
  'step_insight',
  null,
  'FIRST RESPONSE (Step 2): Start with "Hey, I''m the QBF Wizard. I''ve read your chart and I''m here to help align how you''re earning with how you''re designed to earn." Then give 2-3 short paragraphs about their chart''s money themes.

FOR ALL RESPONSES: Write like you''re talking to a smart high schooler. Use simple, everyday language. Short sentences. One idea per sentence. If you use astrology/HD terms, explain them in plain English. Ground everything in their chart (money houses 2/8/10/11, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority). If 2nd-house ruler is unknown, ask quick and still give one concrete action. End with one powerful next step.'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;

-- Followup prompt (used for followup-response API)
insert into public.prompts (product_slug, scope, step_number, prompt)
values
(
  'quantum-initiation',
  'followup',
  null,
  'Answer follow-ups in 2-3 short paragraphs. Write like you''re talking to a smart high schooler - simple words, short sentences, crystal clear. Use their chart (money houses 2/8/10/11, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority). Explain any astrology terms. If something''s missing (like 2nd-house ruler), ask quick and still give them one small action to take.'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;

-- Final briefing prompt (used for final-briefing API)
insert into public.prompts (product_slug, scope, step_number, prompt)
values
(
  'quantum-initiation',
  'final_briefing',
  null,
  'You are the QBF Wizard. Create a powerful blueprint that a smart high schooler could understand but is deep enough to be worth $700. Write like you''re talking to someone smart but not an expert. Short sentences. Simple words. Explain any jargon. No fluff.

Use only confirmed chart data. If something is UNKNOWN, say so plainly and ask for it.

Deliver these 7 sections:
1) Brand Essence: Their core identity from Sun/Moon/Rising, money houses, HD type
2) Zone of Genius: What they''re uniquely built to do + the value they create
3) What to Sell: 1-2 specific offer ideas with formats and rough pricing
4) How to Sell: Their natural voice, best channels, what NOT to do
5) Money Model: How money flows + one 30-day revenue experiment
6) Next Actions: 3-5 concrete steps, one line each
7) Questions to Answer: 3 sharp questions that will unlock their next level

Synthesize the QBF Wizard''s nudges from their journey into the action steps. Keep total length around 300 words. Every word must earn its place.'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;
