# Calorie & Training Tracker — Project Context

A private web app for two users (me and my brother). Mobile-first, used from a phone browser.
Not a product, not going public — optimise for simplicity and for being easy to change, not for
scale.

## Why this exists

Calories are currently estimated in a chat with Claude at the end of each day (describe what was
eaten and what activity was done, Claude gives a calorie range, upper end is taken so as not to
underestimate). That works, but there's nowhere for the numbers to live — no way to see whether
the **week** is on track.

This app is the ledger. The estimating stays in the Claude chat. The final number gets pasted in
here.

**Important:** the app makes no AI/API calls. There is no API key, no cost. All calorie numbers
are entered manually by the user. Do not add AI estimation, food databases, or barcode scanning.

## Users

Two accounts, separate data. No sharing, no social features, no comparison between accounts.

## Tech stack

- **Next.js** (App Router, TypeScript)
- **Supabase** — Postgres, Auth (email + password), Row Level Security
- Hosting: Vercel free tier; Supabase free tier
- Every table scoped by `user_id` with RLS policies so a user can only read/write their own rows
- Disable public signups in Supabase once both accounts exist

## Docs

Reference material lives in `docs/` — read the relevant one before working on that area:

- [docs/domain-rules.md](docs/domain-rules.md) — calorie zones, weekly budget, eaten vs burned,
  muscle taxonomy, training scoring, the accuracy note
- [docs/data-model.md](docs/data-model.md) — schema sketch
- [docs/roadmap.md](docs/roadmap.md) — module-by-module build plan with done-when criteria
- [docs/open-questions.md](docs/open-questions.md) — decisions not yet made

## Instructions for working on this app

- **Build one module at a time**, per [docs/roadmap.md](docs/roadmap.md). Each module must be
  working and usable on a phone before the next one starts. Do not build ahead.
- **Favor a single page over navigation.** Keep as much as reasonably possible — quick-glance
  info, quick-add actions — on the home screen itself rather than a separate route. Not
  everything can fit (a full settings form, a full week view genuinely need their own screen),
  but default to adding to the home screen unless there's a real reason not to.
- **No AI calls, no API keys, no per-use cost.** No food database, no barcode scanning, no
  recipe builder.
- **No sets/reps/weights** in training logging.
- **No sharing, no social, no leaderboards, no streaks.** No native app.
- Must stay within Vercel and Supabase free tiers.
- Every number must be editable. Don't imply false precision — no decimal places on calories,
  no "you have exactly 412 calories left" framing where a range would be honest (see the
  accuracy note in [docs/domain-rules.md](docs/domain-rules.md)).
