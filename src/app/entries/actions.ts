"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayDateString } from "@/lib/date";
import { rankQuickFoods, type QuickFood } from "@/lib/quickFoods";

/** How far back to look for "usual" foods — long enough to catch a weekly staple, short enough
 * that a food you stopped eating months ago quietly ages out instead of staying suggested
 * forever. */
const QUICK_FOODS_WINDOW_DAYS = 90;

export type EntryRow = {
  id: string;
  entry_date: string;
  label: string;
  amount: number;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function addEntry(
  formData: FormData,
): Promise<{ error: string } | { entry: EntryRow }> {
  const { supabase, user } = await requireUser();

  const entryDate = String(formData.get("entry_date") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(formData.get("amount"));

  if (!entryDate || !label) return { error: "Enter a label." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Enter a non-negative number of calories." };
  }

  const { data, error } = await supabase
    .from("food_entries")
    .insert({ user_id: user.id, entry_date: entryDate, label, calories: Math.round(amount) })
    .select("id, entry_date, label, calories")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save." };

  return {
    entry: { id: data.id, entry_date: data.entry_date, label: data.label, amount: data.calories },
  };
}

export async function updateEntry(
  formData: FormData,
): Promise<{ error: string } | { entry: EntryRow }> {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(formData.get("amount"));

  if (!id || !label) return { error: "Enter a label." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Enter a non-negative number of calories." };
  }

  const { data, error } = await supabase
    .from("food_entries")
    .update({ label, calories: Math.round(amount) })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, entry_date, label, calories")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save." };

  return {
    entry: { id: data.id, entry_date: data.entry_date, label: data.label, amount: data.calories },
  };
}

export async function deleteEntry(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("food_entries").delete().eq("id", id).eq("user_id", user.id);
}

/**
 * Fetches a whole week's food entries plus which dates in that range had a workout logged
 * (any workout row implies muscles were logged — see docs/domain-rules.md, saveWorkout deletes
 * empty sessions, so a workout's mere existence already means "trained that day") — for the
 * client-side per-week cache and the week strip's workout marker.
 */
export async function fetchWeekEntries(
  weekStart: string,
  weekEnd: string,
): Promise<{ food: EntryRow[]; workoutDates: string[] }> {
  const { supabase, user } = await requireUser();

  const [{ data: food }, { data: workouts }] = await Promise.all([
    supabase
      .from("food_entries")
      .select("id, entry_date, label, calories")
      .eq("user_id", user.id)
      .gte("entry_date", weekStart)
      .lte("entry_date", weekEnd)
      .order("created_at", { ascending: true }),
    supabase
      .from("workouts")
      .select("session_date")
      .eq("user_id", user.id)
      .gte("session_date", weekStart)
      .lte("session_date", weekEnd),
  ]);

  return {
    food: (food ?? []).map((r) => ({
      id: r.id,
      entry_date: r.entry_date,
      label: r.label,
      amount: r.calories,
    })),
    workoutDates: (workouts ?? []).map((w) => w.session_date),
  };
}

/**
 * "Your usual" foods for the quick-add row — see lib/quickFoods.ts for the ranking. Fetches raw
 * recent history rather than aggregating in SQL: entry volume here is a couple of meals a day
 * for two people, so a plain JS reduce is simpler than a database view and just as fast.
 */
export async function fetchQuickFoods(): Promise<QuickFood[]> {
  const { supabase, user } = await requireUser();

  const since = addDays(todayDateString(), -QUICK_FOODS_WINDOW_DAYS);

  const { data } = await supabase
    .from("food_entries")
    .select("label, calories, entry_date")
    .eq("user_id", user.id)
    .gte("entry_date", since);

  return rankQuickFoods(data ?? []);
}
