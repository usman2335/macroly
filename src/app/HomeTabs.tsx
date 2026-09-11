"use client";

import { useState } from "react";
import Link from "next/link";
import WeekLog from "./entries/WeekLog";
import TrainingLog from "./training/TrainingLog";
import TrainingDetails from "./training/TrainingDetails";
import type { Muscle } from "@/lib/muscles";
import type { EntryRow as WeekEntryRow } from "./entries/actions";

type Tab = "nutrition" | "training";

const TABS: readonly [Tab, string][] = [
  ["nutrition", "Nutrition"],
  ["training", "Training"],
];

export default function HomeTabs({
  today,
  displayName,
  weekStartsOn,
  sedentaryMaintenance,
  activeMaintenance,
  initialWeekStart,
  initialFood,
  initialActivity,
  muscles,
  initialMuscleIds,
  hitsByMuscle,
  targetsByMuscle,
  sidebarMinHeight,
}: {
  today: string;
  displayName: string;
  weekStartsOn: "monday" | "sunday";
  sedentaryMaintenance: number;
  activeMaintenance: number;
  initialWeekStart: string;
  initialFood: WeekEntryRow[];
  initialActivity: WeekEntryRow[];
  muscles: Muscle[];
  initialMuscleIds: string[];
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
  /** The dashboard panel's measured height (desktop only) — see HomeLayout. The nav sidebar
   * matches it so the account controls at its bottom line up with the dashboard's bottom,
   * instead of the previous `100vh` guess, which pinned them to the actual viewport edge. */
  sidebarMinHeight?: number;
}) {
  const [tab, setTab] = useState<Tab>("nutrition");

  return (
    <div className="w-full lg:flex lg:items-start lg:gap-6">
      {/* Desktop: a vertical mini nav on the left, labeled so it reads as "where you add
          entries" rather than an unlabeled pair of buttons — distinct from the Dashboard
          sidebar, which is read-only. Replaces a full-width horizontal tab row that was mostly
          empty space next to two short labels. */}
      <div
        className="hidden lg:sticky lg:top-10 lg:flex lg:w-36 lg:shrink-0 lg:flex-col"
        style={sidebarMinHeight ? { minHeight: sidebarMinHeight } : undefined}
      >
        <div className="flex flex-col gap-1">
          <p className="mb-2 text-sm text-ink">Log</p>
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-md border-l-2 px-3 py-2 text-left text-sm ${
                tab === value
                  ? "border-accent bg-surface text-ink"
                  : "border-transparent text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Account controls, pinned to the bottom of the sidebar (see the phone equivalent in
            page.tsx's header — there's no sidebar to hold them there). */}
        <div className="mt-auto space-y-2">
          {/* <p className="truncate text-sm text-ink">{displayName}</p> */}
          <Link
            href="/settings"
            className="block rounded-md border border-line px-3 py-1.5 text-center text-sm text-ink"
          >
            Settings
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-md border border-line px-3 py-1.5 text-sm text-muted"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Bottom padding (mobile only) clears the fixed tab bar below so the last entry never
          sits behind it. Fixed-position elements aren't confined by a max-w wrapper — they
          position relative to the viewport regardless of DOM nesting — so the mobile bar still
          spans the full screen width even though this content column stays narrow. */}
      <div className="mx-auto w-full max-w-sm pb-28 lg:max-w-none lg:flex-1 lg:pb-0">
        {tab === "nutrition" ? (
          <WeekLog
            initialDate={today}
            weekStartsOn={weekStartsOn}
            sedentaryMaintenance={sedentaryMaintenance}
            activeMaintenance={activeMaintenance}
            initialWeekStart={initialWeekStart}
            initialFood={initialFood}
            initialActivity={initialActivity}
          />
        ) : (
          <div className="flex flex-col gap-5">
            <TrainingDetails
              muscles={muscles}
              hitsByMuscle={hitsByMuscle}
              targetsByMuscle={targetsByMuscle}
            />
            <TrainingLog
              muscles={muscles}
              initialDate={today}
              initialMuscleIds={initialMuscleIds}
            />
          </div>
        )}
      </div>

      {/* Mobile only: fixed bottom tab bar, the native-app pattern. */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto flex max-w-sm">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`flex-1 border-t-2 py-3 text-sm ${
                tab === value ? "border-accent text-ink" : "border-transparent text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
