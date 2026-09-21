# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two private users — the account owner and their brother — each with their own account and data,
no sharing or comparison between them. Used mobile-first, from a phone browser, for daily
calorie and training logging while pursuing a fat-loss goal.

## Product Purpose

A private ledger for calorie and training numbers that would otherwise have nowhere to live.
Calorie estimation happens separately, in a conversation with Claude, at the end of the day
(describe what was eaten and what activity was done, take the upper end of the estimated range).
This app is where the final number gets recorded, so the **week** — not just the day — can be
seen at a glance. Success means it's always clear whether the week is on track and how much room
is left.

## Positioning

Deliberately not a calorie-estimation product: no AI or API calls, no food database, no barcode
scanning, no recipe builder. The estimating step stays external, in a Claude chat; this app is
only the ledger and the trend line. That's the thing a mainstream tracker (MyFitnessPal-style)
couldn't truthfully copy without becoming a different product — it differentiates by being
radically simpler, free to run, and built for two known users rather than a market.

## Operating Context

Opened briefly, once or more a day, from a phone browser: log today's food entries and total
eaten, log a training session (muscles trained, no sets/reps/weights), check the week's zone
status before making evening food decisions, occasionally log a weigh-in. The calorie-estimating
conversation itself happens outside the app, in a separate Claude chat — this app never performs
that estimation.

## Capabilities and Constraints

- No AI/API calls anywhere in the app. No cost, no API key. No food database, no barcode
  scanning, no recipe builder — all calorie numbers are entered manually.
- No sets, reps, or weights in training logging. Training logging is a muscle-coverage tracker,
  not a progressive-overload tracker.
- No sharing, social features, comparison between accounts, leaderboards, or streaks. No native
  app.
- Every number in the app is manually editable, including computed figures (sedentary
  maintenance, activity-adjusted maintenance, weekly budget, per-muscle targets) — if the user's
  own number disagrees with the computed one, their number wins.
- No false precision: no decimal places on calories, no "exactly N calories left" framing where a
  range would be honest. Calorie estimates are a trend line, not a precise measurement (portions
  in home-cooked food vary a lot).
- Must stay within the Vercel free tier and Supabase free tier.
- Tech stack: Next.js (App Router, TypeScript), Supabase (Postgres, Auth via email + password,
  Row Level Security). Every table scoped by `user_id`. Public signups disabled once both
  accounts exist.
- Build discipline: one module at a time per docs/roadmap.md, each usable on a phone before the
  next starts.

## Brand Commitments

Product name: Macroly.

## Evidence on Hand

None — a private two-user tool, not a product with external users, testimonials, or case studies
to draw on. Nothing here should be fabricated.

## Product Principles

1. Optimise for simplicity and ease of change, not scale or completeness — this is a private
   tool for two people, not a product being shipped to a market.
2. The week is the unit that matters, not the day. A heavy day is fine if lighter days absorb it;
   design around the weekly picture, not daily perfection.
3. Every number must be editable, and the app must never imply more precision than the underlying
   estimate actually has.
4. Favor the single home screen over navigation — quick-glance status and quick-add actions
   belong on the home screen; a separate page needs a real reason to exist.
5. No AI or automation creep. The estimating step stays manual and external; this app never calls
   an API, never costs money to run, and never re-adds food databases or barcode scanning.
