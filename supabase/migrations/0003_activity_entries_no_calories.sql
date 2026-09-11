-- Module 2 revision: activity entries are just a gym-session log (label only) now — no
-- calories burned. Per-muscle detail is deferred to Module 4's separate workouts /
-- workout_muscles tables (see data-model.md), not bolted onto this table.
-- See docs/domain-rules.md — zones already use calories *eaten* only, so this has no effect
-- on zone math; it only removes the now-pointless "burned"/"net" display.

alter table activity_entries
  alter column calories_burned drop not null;

alter table activity_entries
  drop constraint if exists activity_entries_calories_burned_check;

alter table activity_entries
  add constraint activity_entries_calories_burned_check
  check (calories_burned is null or calories_burned >= 0);
