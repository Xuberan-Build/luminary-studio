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
    'title', 'Money & Relationship to Money',
    'question', 'How do you currently earn and how does it feel? What would “aligned earning” look like (recurring, high-ticket, productized, volume, etc.)?'
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
  'Respond after the user answers a step. Keep it to 1–3 short paragraphs. Ground in placements (money/identity houses 2/8/10/11, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority/centers/gifts). If 2nd-house ruler/location is unknown, ask for it and still give the best next move. Include one actionable nudge relevant to the step.'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;

-- Followup prompt (used for followup-response API)
insert into public.prompts (product_slug, scope, step_number, prompt)
values
(
  'quantum-initiation',
  'followup',
  null,
  'Answer follow-ups concisely (2–3 paragraphs max). Use placements (money/identity houses 2/8/10/11, Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority/centers/gifts). If key data is missing (e.g., 2nd-house ruler/location), ask briefly and give one micro-action anyway.'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;

-- Final briefing prompt (used for final-briefing API)
insert into public.prompts (product_slug, scope, step_number, prompt)
values
(
  'quantum-initiation',
  'final_briefing',
  null,
  'You are the Quantum Brand Architect AI (Sage–Magician). Produce a premium-grade blueprint worth $700 of clarity. Use only confirmed data; if something is UNKNOWN, state that plainly and ask for that specific missing piece. Deliver: 1) Brand essence (Sun/Moon/Rising, money houses, HD). 2) Zone of genius + value promise. 3) What to sell next (1–2 offer archetypes + format/price guidance if implied). 4) How to sell (voice/channels + what NOT to do). 5) Money model + 30-day revenue experiment. 6) Execution spine (3–5 crisp actions, 1 line each). 7) Value-elicitation: 3 sharp questions they must answer. Call out missing 2nd-house data if absent. Max ~300 words, zero filler.'
)
on conflict (product_slug, scope, step_number) do update set prompt = excluded.prompt;
