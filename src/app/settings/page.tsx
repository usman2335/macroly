import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm, { type ProfileFormValues } from "./ProfileForm";
import SettingsTabs from "./SettingsTabs";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: muscles }, { data: muscleTargets }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, sex, birth_date, height_cm, weight_kg, gym_days_per_week, sedentary_maintenance, active_maintenance, week_starts_on",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("muscles").select("id, name, muscle_group").order("sort_order"),
    supabase.from("muscle_targets").select("muscle_id, weekly_target").eq("user_id", user.id),
  ]);

  const initial: ProfileFormValues = {
    display_name: profile?.display_name ?? "",
    sex: (profile?.sex as ProfileFormValues["sex"]) ?? "",
    birth_date: profile?.birth_date ?? "",
    height_cm: profile?.height_cm?.toString() ?? "",
    weight_kg: profile?.weight_kg?.toString() ?? "",
    gym_days_per_week: profile?.gym_days_per_week?.toString() ?? "",
    sedentary_maintenance: profile?.sedentary_maintenance?.toString() ?? "",
    active_maintenance: profile?.active_maintenance?.toString() ?? "",
    week_starts_on: (profile?.week_starts_on as ProfileFormValues["week_starts_on"]) ?? "monday",
  };

  const targets: Record<string, number> = {};
  for (const row of muscleTargets ?? []) targets[row.muscle_id] = row.weekly_target;

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-paper px-6 py-10">
      <div className="w-full max-w-3xl">
        <h1 className="text-lg text-ink">{profile ? "Settings" : "Set up your profile"}</h1>
        <p className="mt-1 text-sm text-muted">
          {profile
            ? "Every field here is editable, including the maintenance numbers."
            : "A few stats to compute your maintenance calories."}
        </p>
      </div>

      {profile ? (
        <SettingsTabs initial={initial} muscles={muscles ?? []} targets={targets} />
      ) : (
        // No sections to switch between yet during onboarding — just the one form.
        <ProfileForm initial={initial} />
      )}

      {profile ? (
        <Link href="/" className="text-sm text-accent underline underline-offset-2">
          Back home
        </Link>
      ) : null}
    </main>
  );
}
