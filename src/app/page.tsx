import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays, getWeekStart, todayDateString } from "@/lib/date";
import WeekLog from "./entries/WeekLog";
import DailyAllowance from "./entries/DailyAllowance";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = todayDateString();

  // A week can start at most 6 days before or after today depending on the week_starts_on
  // setting, so this window is always a superset of "this week" either way — fetching it
  // doesn't need to wait to learn week_starts_on from the profile query, so all three queries
  // below run fully in parallel instead of the entries query blocking on the profile query.
  const bufferStart = addDays(today, -6);
  const bufferEnd = addDays(today, 6);

  const [{ data: profile }, { data: food }, { data: activity }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, sedentary_maintenance, active_maintenance, week_starts_on")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("food_entries")
      .select("id, entry_date, label, calories")
      .eq("user_id", user.id)
      .gte("entry_date", bufferStart)
      .lte("entry_date", bufferEnd)
      .order("created_at", { ascending: true }),
    supabase
      .from("activity_entries")
      .select("id, entry_date, label, calories_burned")
      .eq("user_id", user.id)
      .gte("entry_date", bufferStart)
      .lte("entry_date", bufferEnd)
      .order("created_at", { ascending: true }),
  ]);

  if (!profile) {
    redirect("/settings");
  }

  const weekStartsOn = profile.week_starts_on as "monday" | "sunday";
  const weekStart = getWeekStart(today, weekStartsOn);
  const weekEnd = addDays(weekStart, 6);

  const weekFood = (food ?? [])
    .filter((r) => r.entry_date >= weekStart && r.entry_date <= weekEnd)
    .map((r) => ({ id: r.id, entry_date: r.entry_date, label: r.label, amount: r.calories }));
  const weekActivity = (activity ?? [])
    .filter((r) => r.entry_date >= weekStart && r.entry_date <= weekEnd)
    .map((r) => ({
      id: r.id,
      entry_date: r.entry_date,
      label: r.label,
      amount: r.calories_burned,
    }));

  const eatenThisWeek = weekFood.reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return (
    <main className="flex min-h-dvh flex-col items-center gap-4 bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="flex w-full max-w-sm items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {profile.display_name}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
          >
            Settings
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <DailyAllowance
        sedentaryMaintenance={profile.sedentary_maintenance}
        activeMaintenance={profile.active_maintenance}
      />

      <WeekLog
        today={today}
        initialDate={today}
        weekStartsOn={weekStartsOn}
        sedentaryMaintenance={profile.sedentary_maintenance}
        activeMaintenance={profile.active_maintenance}
        initialWeekStart={weekStart}
        initialFood={weekFood}
        initialActivity={weekActivity}
        initialEatenThisWeek={eatenThisWeek}
      />
    </main>
  );
}
