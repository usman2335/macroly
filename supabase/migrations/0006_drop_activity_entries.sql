-- activity_entries was always a stopgap: a plain label-only "did I go to the gym" log, put in
-- place before Module 4's real muscle-based training system (workouts / workout_muscles)
-- existed — see docs/domain-rules.md's original note on this. Now that training has its own
-- proper logging and the week strip's workout marker reads from `workouts` directly, this table
-- has no remaining reader or writer in the app. Dropping it rather than leaving it as unused
-- dead weight in the schema.

drop table if exists activity_entries;
