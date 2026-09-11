import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm, { type ProfileFormValues } from "./ProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, sex, birth_date, height_cm, weight_kg, gym_days_per_week, sedentary_maintenance, active_maintenance, week_starts_on",
    )
    .eq("id", user.id)
    .maybeSingle();

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

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <div className="w-full max-w-sm space-y-1">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {profile ? "Settings" : "Set up your profile"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {profile
            ? "Every field here is editable, including the maintenance numbers."
            : "A few stats to compute your maintenance calories."}
        </p>
      </div>

      <ProfileForm initial={initial} />

      {profile ? (
        <Link
          href="/"
          className="text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
        >
          Back home
        </Link>
      ) : null}
    </main>
  );
}
