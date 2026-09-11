"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Kind = "food" | "activity";

export type EntryRow = {
  id: string;
  entry_date: string;
  label: string;
  amount: number | null;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function tableFor(kind: Kind) {
  return kind === "food" ? "food_entries" : "activity_entries";
}

function amountColumnFor(kind: Kind) {
  return kind === "food" ? "calories" : "calories_burned";
}

export async function addEntry(
  formData: FormData,
): Promise<{ error: string } | { entry: EntryRow }> {
  const { supabase, user } = await requireUser();

  const kind = formData.get("kind") as Kind;
  const entryDate = String(formData.get("entry_date") ?? "");
  const label = String(formData.get("label") ?? "").trim();

  if (!entryDate || !label) {
    return { error: "Enter a label." };
  }

  const row: Record<string, unknown> = { user_id: user.id, entry_date: entryDate, label };

  // Activity entries are a plain gym-session log — no calories. Food entries need an amount.
  if (kind === "food") {
    const amount = Number(formData.get("amount"));
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: "Enter a non-negative number of calories." };
    }
    row.calories = Math.round(amount);
  }

  const { data, error } = await supabase
    .from(tableFor(kind))
    .insert(row)
    .select(`id, entry_date, label, ${amountColumnFor(kind)}`)
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save." };

  return {
    entry: {
      id: data.id,
      entry_date: data.entry_date,
      label: data.label,
      amount: (data as Record<string, number | null>)[amountColumnFor(kind)] ?? null,
    },
  };
}

export async function updateEntry(
  formData: FormData,
): Promise<{ error: string } | { entry: EntryRow }> {
  const { supabase, user } = await requireUser();

  const kind = formData.get("kind") as Kind;
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();

  if (!id || !label) {
    return { error: "Enter a label." };
  }

  const row: Record<string, unknown> = { label };

  if (kind === "food") {
    const amount = Number(formData.get("amount"));
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: "Enter a non-negative number of calories." };
    }
    row.calories = Math.round(amount);
  }

  const { data, error } = await supabase
    .from(tableFor(kind))
    .update(row)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`id, entry_date, label, ${amountColumnFor(kind)}`)
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save." };

  return {
    entry: {
      id: data.id,
      entry_date: data.entry_date,
      label: data.label,
      amount: (data as Record<string, number | null>)[amountColumnFor(kind)] ?? null,
    },
  };
}

export async function deleteEntry(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const kind = formData.get("kind") as Kind;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from(tableFor(kind)).delete().eq("id", id).eq("user_id", user.id);
}

/** Fetches a whole week's entries in two queries, for the client-side per-week cache. */
export async function fetchWeekEntries(
  weekStart: string,
  weekEnd: string,
): Promise<{ food: EntryRow[]; activity: EntryRow[] }> {
  const { supabase, user } = await requireUser();

  const [{ data: food }, { data: activity }] = await Promise.all([
    supabase
      .from("food_entries")
      .select("id, entry_date, label, calories")
      .eq("user_id", user.id)
      .gte("entry_date", weekStart)
      .lte("entry_date", weekEnd)
      .order("created_at", { ascending: true }),
    supabase
      .from("activity_entries")
      .select("id, entry_date, label, calories_burned")
      .eq("user_id", user.id)
      .gte("entry_date", weekStart)
      .lte("entry_date", weekEnd)
      .order("created_at", { ascending: true }),
  ]);

  return {
    food: (food ?? []).map((r) => ({
      id: r.id,
      entry_date: r.entry_date,
      label: r.label,
      amount: r.calories,
    })),
    activity: (activity ?? []).map((r) => ({
      id: r.id,
      entry_date: r.entry_date,
      label: r.label,
      amount: r.calories_burned,
    })),
  };
}
