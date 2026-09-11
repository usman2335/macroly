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
Add food entries for a date: label + calories. Add activity entries: a plain gym-session log,
label only, no calories (see domain-rules.md — muscle detail is deferred to Module 4). Edit and
delete any entry. Built into the home screen itself, not a separate page (see the single-page
UX preference). Today's view shows the day's list and total eaten.

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
