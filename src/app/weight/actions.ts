"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type WeightEntry = {
  id: string;
  entry_date: string;
  weight_kg: number;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** One weigh-in per day — logging the same day twice overwrites rather than duplicates, since a
 * second weigh-in the same day is a correction, not a separate data point. */
export async function logWeight(
  formData: FormData,
): Promise<{ error: string } | { entry: WeightEntry }> {
  const { supabase, user } = await requireUser();

  const entryDate = String(formData.get("entry_date") ?? "");
  const weight = Number(formData.get("weight_kg"));

  if (!entryDate) return { error: "Missing date." };
  if (!Number.isFinite(weight) || weight <= 0) {
    return { error: "Enter a valid weight." };
  }

  const { data, error } = await supabase
    .from("weight_logs")
    .upsert(
      { user_id: user.id, entry_date: entryDate, weight_kg: Math.round(weight * 10) / 10 },
      { onConflict: "user_id,entry_date" },
    )
    .select("id, entry_date, weight_kg")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save." };

  return { entry: data };
}

export async function deleteWeightEntry(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", user.id);
}
