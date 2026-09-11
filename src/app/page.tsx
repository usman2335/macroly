import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays, getWeekStart, todayDateString } from "@/lib/date";
import { DEFAULT_WEEKLY_TARGET } from "@/lib/training";
import { getDailyGreeting } from "@/lib/greetings";
import HomeLayout from "./HomeLayout";
import Dashboard from "./Dashboard";

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
  // doesn't need to wait to learn week_starts_on from the profile query, so all queries below
  // run fully in parallel instead of blocking on the profile query first.
  const bufferStart = addDays(today, -6);
  const bufferEnd = addDays(today, 6);

  const [
    { data: profile },
    { data: food },
    { data: muscles },
    { data: muscleTargets },
    { data: workoutsInWindow },
    { data: todaysWorkout },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, sedentary_maintenance, active_maintenance, week_starts_on, gym_days_per_week",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("food_entries")
      .select("id, entry_date, label, calories")
      .eq("user_id", user.id)
      .gte("entry_date", bufferStart)
      .lte("entry_date", bufferEnd)
      .order("created_at", { ascending: true }),
    supabase.from("muscles").select("id, name, muscle_group").order("sort_order"),
    supabase.from("muscle_targets").select("muscle_id, weekly_target").eq("user_id", user.id),
    supabase
      .from("workouts")
      .select("id, session_date")
      .eq("user_id", user.id)
      .gte("session_date", bufferStart)
      .lte("session_date", bufferEnd),
    supabase
      .from("workouts")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_date", today)
      .maybeSingle(),
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
  const eatenThisWeek = weekFood.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const eatenToday = weekFood
    .filter((row) => row.entry_date === today)
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  const weekWorkouts = (workoutsInWindow ?? []).filter(
    (w) => w.session_date >= weekStart && w.session_date <= weekEnd,
  );
  const workoutsThisWeek = weekWorkouts.length;

  const weekWorkoutIds = weekWorkouts.map((w) => w.id);
  const { data: weekWorkoutMuscles } =
    weekWorkoutIds.length > 0
      ? await supabase.from("workout_muscles").select("muscle_id").in("workout_id", weekWorkoutIds)
      : { data: [] as { muscle_id: string }[] };

  const hitsByMuscle: Record<string, number> = {};
  for (const row of weekWorkoutMuscles ?? []) {
    hitsByMuscle[row.muscle_id] = (hitsByMuscle[row.muscle_id] ?? 0) + 1;
  }

  const targetsByMuscle: Record<string, number> = {};
  for (const muscle of muscles ?? []) targetsByMuscle[muscle.id] = DEFAULT_WEEKLY_TARGET;
  for (const row of muscleTargets ?? []) targetsByMuscle[row.muscle_id] = row.weekly_target;

  const initialMuscleIds = todaysWorkout
    ? (
        await supabase
          .from("workout_muscles")
          .select("muscle_id")
          .eq("workout_id", todaysWorkout.id)
      ).data?.map((row) => row.muscle_id) ?? []
    : [];

  return (
    <main className="min-h-dvh bg-paper px-6 py-8 lg:px-10 lg:py-10">
      {/* Phone: header, then dashboard, then tabs — single narrow column (unchanged). Desktop
          (lg+): header spans the top, then two columns — logging (the primary, wider workspace)
          on the left, dashboard (glance-only) on the right as a distinct, backgrounded, sticky
          panel that never needs to scroll out of view. */}
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5 lg:max-w-5xl">
        <div className="border-b border-line pb-4">
          <p className="font-brand text-3xl text-accent">Macroly</p>
          <p className="mt-1 text-base text-muted">{getDailyGreeting(today)}</p>
        </div>

        {/* Account controls: inline on the phone header (no sidebar there to hold them);
            pinned to the bottom of the desktop sidebar instead — see HomeTabs. */}
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-sm text-ink">{profile.display_name}</p>
          <div className="flex gap-2">
            <Link
              href="/settings"
              className="rounded-md border border-line px-3 py-1.5 text-sm text-ink"
            >
              Settings
            </Link>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-line px-3 py-1.5 text-sm text-muted"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <HomeLayout
          today={today}
          weekStartsOn={weekStartsOn}
          sedentaryMaintenance={profile.sedentary_maintenance}
          activeMaintenance={profile.active_maintenance}
          initialWeekStart={weekStart}
          initialFood={weekFood}
          initialWorkoutDates={weekWorkouts.map((w) => w.session_date)}
          muscles={muscles ?? []}
          initialMuscleIds={initialMuscleIds}
          hitsByMuscle={hitsByMuscle}
          targetsByMuscle={targetsByMuscle}
          dashboard={
            <Dashboard
              sedentaryMaintenance={profile.sedentary_maintenance}
              activeMaintenance={profile.active_maintenance}
              eatenThisWeek={eatenThisWeek}
              eatenToday={eatenToday}
              hitsByMuscle={hitsByMuscle}
              targetsByMuscle={targetsByMuscle}
              sessionsLogged={workoutsThisWeek}
              plannedGymDays={profile.gym_days_per_week}
            />
          }
        />
      </div>
    </main>
  );
}
