# Quantum Strategies

Strategic consulting and course platform built with Next.js 16.

## Project Overview

**Quantum Strategies** is a professional consulting website featuring:
- Strategic consulting services
- Educational course platform (VCAP - Visionary Creator's Activation Protocol)
- Pillar/cluster content marketing (Articles, White Papers)
- Case studies and portfolio

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** Netlify
- **Styling:** Tailwind CSS 4
- **Content:** MDX (next-mdx-remote)
- **Video:** Vimeo embeds

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (marketing)/      # Public pages (Home, About, Values)
│   ├── (content)/        # Articles, Blog, White Papers
│   └── (courses)/        # Course platform (VCAP)
├── components/
├── content/              # MDX content files
└── lib/                  # Utilities and configs
```

## Deployment

Deployed on Netlify with automatic deployments from the `nextjs` branch.

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Documentation

- [Course Architecture](./COURSE_ARCHITECTURE.md)
- [Migration Plan](./MIGRATION_PLAN.md)
