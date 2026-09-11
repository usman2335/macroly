"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** The muscles trained in the session logged for this date, if any. */
export async function fetchWorkoutMuscles(date: string): Promise<string[]> {
  const { supabase, user } = await requireUser();

  const { data: workout } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", user.id)
    .eq("session_date", date)
    .maybeSingle();

  if (!workout) return [];

  const { data: links } = await supabase
    .from("workout_muscles")
    .select("muscle_id")
    .eq("workout_id", workout.id);

  return (links ?? []).map((l) => l.muscle_id);
}

/**
 * Replaces the whole muscle set for a date's session in one go — one save, not one round-trip
 * per muscle tapped (see docs/domain-rules.md: no sets/reps, just which muscles were trained).
 * An empty set deletes the session entirely rather than leaving an empty one behind.
 */
export async function saveWorkout(
  date: string,
  muscleIds: string[],
): Promise<{ error: string } | void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", user.id)
    .eq("session_date", date)
    .maybeSingle();

  if (muscleIds.length === 0) {
    if (existing) await supabase.from("workouts").delete().eq("id", existing.id);
    return;
  }

  let workoutId = existing?.id;
  if (!workoutId) {
    const { data: created, error } = await supabase
      .from("workouts")
      .insert({ user_id: user.id, session_date: date })
      .select("id")
      .single();
    if (error || !created) return { error: error?.message ?? "Could not save." };
    workoutId = created.id;
  } else {
    await supabase.from("workout_muscles").delete().eq("workout_id", workoutId);
  }

  const { error } = await supabase
    .from("workout_muscles")
    .insert(muscleIds.map((muscleId) => ({ workout_id: workoutId, muscle_id: muscleId })));

  if (error) return { error: error.message };
}
