"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error: string };

function parseNumber(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function saveProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const sex = String(formData.get("sex") ?? "");
  const birthDate = String(formData.get("birth_date") ?? "");
  const heightCm = parseNumber(formData, "height_cm");
  const weightKg = parseNumber(formData, "weight_kg");
  const gymDaysPerWeek = parseNumber(formData, "gym_days_per_week");
  const weekStartsOn = String(formData.get("week_starts_on") ?? "monday");
  const sedentaryMaintenance = parseNumber(formData, "sedentary_maintenance");
  const activeMaintenance = parseNumber(formData, "active_maintenance");

  if (
    !displayName ||
    (sex !== "male" && sex !== "female") ||
    !birthDate ||
    heightCm === null ||
    weightKg === null ||
    gymDaysPerWeek === null ||
    sedentaryMaintenance === null ||
    activeMaintenance === null
  ) {
    return { error: "Please fill in every field." };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    sex,
    birth_date: birthDate,
    height_cm: heightCm,
    weight_kg: weightKg,
    gym_days_per_week: gymDaysPerWeek,
    goal: "fat_loss",
    sedentary_maintenance: Math.round(sedentaryMaintenance),
    active_maintenance: Math.round(activeMaintenance),
    week_starts_on: weekStartsOn === "sunday" ? "sunday" : "monday",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
