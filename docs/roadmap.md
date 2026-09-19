# Roadmap

Build **one module at a time**. Each must be working and usable on a phone before starting the
next. Do not build ahead — see [CLAUDE.md](../CLAUDE.md) for the full instruction this expands on.

### Module 0 — Skeleton
Next.js project, Supabase connected, auth working (email + password), both accounts created, RLS
enabled, deployed to a live URL that opens on a phone. Empty shell beyond login/logout.

*Done when:* login works on a phone at a real URL and shows an empty home screen with the
user's name on it.

### Module 1 — Profile & targets
Onboarding form (sex, age, height, weight, gym days/week, goal). Computes and stores sedentary
and activity-adjusted maintenance plus weekly budget (see [domain-rules.md](domain-rules.md)).
Settings screen shows both numbers, all fields editable, manual override of the computed figures
allowed.

*Done when:* stats are filled in and both maintenance numbers plus the weekly budget are visible.

### Module 2 — Daily logging
Add food entries for a date: label + calories. Edit and delete any entry. Built into the home
screen itself, not a separate page (see the single-page UX preference). Today's view shows the
day's list and total eaten.

(This module originally also had a plain label-only activity/gym-session log, before Module 4's
muscle-based training system existed. Retired once Module 4/5 made it redundant — see
domain-rules.md's "Eaten vs burned".)

Entry must be fast — this is the screen used every single day. Minimum taps, date defaults to
today, easy to switch to yesterday.

*Done when:* a full day can be logged in under a minute on a phone.

### Module 3 — Weekly nutrition view
Seven days at a glance with each day's total and zone colour. Running weekly total vs weekly
budget. **Calories remaining for the rest of the week** shown prominently. Navigate to previous
weeks.

*Done when:* it's clear at a glance whether the week is on track and how much room is left.

### Module 4 — Training logging
Muscle reference data seeded. Set planned gym days per week. Log a session: pick a date, tap the
muscles trained. Edit and delete sessions.

*Done when:* a workout can be logged in a few taps.

### Module 5 — Weekly training view
Adherence score, coverage score, a combined score alongside them, per-muscle hit counts for the
week, and the focus-next-week list. Per-muscle weekly targets, editable in Settings (see
[open-questions.md](open-questions.md) for how these got decided).

*Done when:* it's clear which muscles were missed and what to prioritise.

### Module 6 — Dashboard & polish
One home screen combining this week's nutrition status and training status. Mobile polish — it
should feel like an app on a phone, not a shrunk-down desktop site.

### Module 7 — Quick add
All six modules above are built; this is a post-M6 enhancement, not part of the original plan.
A "Your usual" row above the quick-add form, surfacing foods logged often in the last 90 days
(see [lib/quickFoods.ts](../src/lib/quickFoods.ts)) so a repeat meal is one tap instead of
retyped label + calories. Still built into the home screen, not a separate page.

*Done when:* a food eaten regularly can be logged in one tap.

### Module 8 — Weight tracking
Another post-M6 enhancement, not part of the original plan (see
[open-questions.md](open-questions.md)). A `weight_logs` table, one row per day. A small
dashboard card showing the most recent weigh-in (falling back to the profile's onboarding weight
until a first one is logged). A "Weight" tab, alongside Nutrition and Training, holding the
trend-over-time chart and a day-based log/edit form (same pick-a-date-and-save shape as
Training's log). No target weight, no goal-tracking, no BMI — just the number over time.

*Done when:* a weigh-in can be logged in a few taps and the trend is visible at a glance.
