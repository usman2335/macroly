# Domain rules

Reference detail for the calorie and training logic. See [CLAUDE.md](../CLAUDE.md) for the
project overview and build instructions, [data-model.md](data-model.md) for schema, and
[roadmap.md](roadmap.md) for when each piece gets built.

## Calories

Onboarding collects: sex, age (or date of birth), height, weight, gym days per week, goal (fat loss).

From that, compute and store **two** maintenance figures:

1. **Sedentary maintenance** — BMR × 1.2. The "no activity" number.
2. **Activity-adjusted maintenance** — BMR × a multiplier based on gym days per week.

Use Mifflin–St Jeor for BMR. Both figures must be manually overridable in settings — if the
user disagrees with the math, their number wins.

**The target is sedentary maintenance.** Goal is fat loss, and eating at sedentary maintenance
while training 4×/week already produces a deficit of roughly 300–400 cal/day. Do not subtract a
further deficit on top of that — it would be cutting twice.

**Three zones**, applied to both a single day and a whole week:

| Zone | Condition | Meaning |
|---|---|---|
| On target | ≤ sedentary maintenance | Good |
| Acceptable | between sedentary and activity-adjusted | Fine, not a failure |
| Over | > activity-adjusted maintenance | Over |

### Weekly budget

Weekly budget = sedentary maintenance × 7.

The week is the unit that matters, not the day. A heavy day is fine if lighter days absorb it.
The most important number in the whole app is **calories remaining for the rest of the week**.

Week starts Monday (make this a setting, default Monday).

### Eaten vs burned

There is no separate activity/calories-burned log. Training is logged once, properly, in the
Training tab (which muscles were trained — see below); a day counts as a workout day if it has
a `workouts` row, which the nutrition week strip reads directly to show its workout marker. An
earlier, simpler stand-in (`activity_entries`, a plain label-only gym-session log with no
calories) existed before the muscle-based system was built and has since been retired.

Zone calculations use **eaten** only. Training isn't logged with a calorie figure, so there's
nothing to double-count — the activity-adjusted maintenance figure already accounts for training
via the gym-days multiplier.

## Training

Log which muscles were trained per session. No sets, reps, or weights — not in v1, and probably
not ever. This is a coverage tracker, not a progressive-overload tracker.

**Muscle taxonomy** — specific enough that "arm day" can't hide a skipped rear delt, not so
specific it lists individual small muscles:

| Group | Muscles |
|---|---|
| Chest | upper chest, mid chest, lower chest |
| Shoulders | front delt, side delt, rear delt |
| Back | lats, mid back (traps/rhomboids), upper traps, lower back |
| Arms | biceps, triceps, forearms |
| Legs | quads, hamstrings, glutes, calves, adductors |
| Core | abs, obliques |

20 muscles. Store as a reference table, not a hardcoded array.

**Weekly training score, two parts, shown separately — never averaged into hiding one behind
the other:**

1. **Adherence** — sessions logged ÷ planned gym days for the week. Capped at 100%.
2. **Coverage** — how well the muscles hit match their per-muscle weekly targets.
   `sum(min(hits, target)) / sum(targets)`. Hitting chest 4× while missing hamstrings entirely
   must score badly.

A **combined score** is also shown, alongside (not instead of) the two above: the plain average
of adherence and coverage. It's a headline convenience, not a replacement — the two parts stay
visible so a bad half never hides behind a decent-looking average.

Plus a **focus next week** list: muscles that fell short of target, worst first.

Per-muscle weekly targets: a flat default (currently 2×/week for every muscle), fully editable
per muscle in Settings — same computed-default-with-override pattern as the Module 1 maintenance
figures.

## A note on accuracy

The calorie numbers are estimates of Pakistani home food, where portions vary a lot — one
paratha can swing 150 cal either way. Taking the upper end of the range is the right instinct,
but the weekly total is a **trend line, not a precise measurement**. Every number in the app
must be editable so it can be corrected when better information exists. Don't build anything
that implies false precision (no decimal places on calories, no "you have exactly 412 calories
left" framing where a range would be honest).
