import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateWeeklyBudget } from "@/lib/calorie";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, sedentary_maintenance, active_maintenance")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/settings");
  }

  const weeklyBudget = calculateWeeklyBudget(profile.sedentary_maintenance);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-neutral-50 px-4 text-center dark:bg-neutral-950">
      <div className="space-y-1">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Signed in as</p>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          {profile.display_name}
        </h1>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-xl border border-neutral-200 bg-white p-6 text-left shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Sedentary maintenance (target)
          </span>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {profile.sedentary_maintenance} cal
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Activity-adjusted maintenance
          </span>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {profile.active_maintenance} cal
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">Weekly budget</span>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {weeklyBudget} cal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
        >
          Settings
        </Link>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
