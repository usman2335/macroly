# Macroly

A private calorie & training ledger for two people — me and my brother. Not a product, not
going public.

## Why this exists

Calories were already being estimated in a chat at the end of each day: describe what was eaten
and what activity was done, get a calorie range back, take the upper end so as not to
underestimate. That part worked fine. What didn't exist was anywhere for the numbers to
**live** — no way to look at a day, a week, or a training session and tell whether things were
actually on track.

There wasn't a need for a fitness platform. Just a simple, honest place to log a number after
dinner and see, at a glance, how the week is going — and the same for whether the right muscles
are actually getting trained, not just "the gym" in the abstract.

So: no AI calls in the app itself (that estimating step stays in the chat, out of scope here),
no food database, no barcode scanning, no calorie-counting gamification. Just a ledger — every
number typed in by hand, every number editable, because the estimates are a trend line, not a
lab measurement.

## What it does

**Nutrition**
- Log food (label + calories) and see the day's total against your maintenance number.
- A week-at-a-glance strip — one cell per day, colored by zone (on target / acceptable / over),
  with a small marker on days a workout was logged.
- The one number that actually matters day to day: calories remaining for the rest of the week.

**Training**
- Log a session by tapping which of 20 muscles (grouped by body region) were trained that day —
  no sets, reps, or weights, ever. This is a coverage tracker, not a progressive-overload app.
- A weekly score: adherence (sessions logged vs. planned gym days) and coverage (per-muscle hit
  rate against your own targets), shown separately — plus a combined number and a "focus next
  week" list of whatever fell short.

**Dashboard**
- Both of the above, summarized, on one home screen — no digging through tabs to find out how
  the week's actually going.

See [docs/domain-rules.md](docs/domain-rules.md) for the exact rules behind the zones and
scores, and [docs/roadmap.md](docs/roadmap.md) for how this got built, module by module.

## Tech stack

Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, Row Level Security), deployed on
Vercel. Two accounts, no sharing, no comparison between them — every table is scoped by
`user_id` under RLS. Free tier on both Vercel and Supabase; no other infrastructure.

See [CLAUDE.md](CLAUDE.md) for the full project context and build instructions, and
[docs/](docs/) for schema and domain-rule detail.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then create a `.env.local` file in the project root with your
   keys (Project Settings -> API -> Project URL / anon public key, called the **publishable
   key** on newer projects — either works, same value goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   Claude Code's permissions block writes to `.env*` files, so this one has to be created by
   hand:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. Run the migrations in `supabase/migrations/` (in order) against your project — via the
   Supabase SQL editor, or the Supabase CLI (`supabase db push`).

4. In the Supabase dashboard, create the two user accounts (email + password) under
   Authentication -> Users, then disable public signups under Authentication -> Providers
   settings once both exist.

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you should be redirected to `/login`.

## Deploying

Deploy to Vercel (free tier) and add the same two env vars in the project's Environment
Variables settings.
