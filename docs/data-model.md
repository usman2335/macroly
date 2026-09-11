# Data model

Sketch, not final — expect it to shift as modules get built. See [domain-rules.md](domain-rules.md)
for what these fields mean and how they're used.

```
profiles          id (= auth.users.id), display_name, sex, birth_date, height_cm,
                  weight_kg, gym_days_per_week, goal, sedentary_maintenance,
                  active_maintenance, week_starts_on
food_entries      id, user_id, entry_date, label, calories, note, created_at
muscles           id, slug, name, muscle_group, sort_order        (reference data)
workouts          id, user_id, session_date, note, created_at
workout_muscles   workout_id, muscle_id
muscle_targets    user_id, muscle_id, weekly_target
```

Entries are dated by `entry_date` (the day they belong to), not `created_at` — logging happens
at the end of the day and sometimes the next morning.

Every table is scoped by `user_id` with RLS policies so a user can only read/write their own
rows (see [CLAUDE.md](../CLAUDE.md) for the Supabase/RLS approach).
