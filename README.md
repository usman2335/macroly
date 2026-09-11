# Macroly

Personal calorie & training tracker. See [CLAUDE.md](CLAUDE.md) and [docs/](docs/) for full
project context.

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

3. In the Supabase dashboard, create the two user accounts (email + password) under
   Authentication -> Users, then disable public signups under Authentication -> Providers
   settings once both exist.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you should be redirected to `/login`.

## Deploying

Deploy to Vercel (free tier) and add the same two env vars in the project's Environment
Variables settings.
