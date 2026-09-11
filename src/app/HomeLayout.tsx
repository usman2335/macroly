"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import HomeTabs from "./HomeTabs";
import type { Muscle } from "@/lib/muscles";
import type { EntryRow as WeekEntryRow } from "./entries/actions";

/**
 * Coordinates the desktop two-column layout: measures the dashboard's actual rendered height
 * (it varies with its content, not the viewport) and applies it to the nav sidebar, so the
 * account controls pinned to the sidebar's bottom line up with the dashboard's bottom edge —
 * rather than the viewport's, which is what a fixed 100vh guess would do.
 */
export default function HomeLayout({
  dashboard,
  today,
  weekStartsOn,
  sedentaryMaintenance,
  activeMaintenance,
  initialWeekStart,
  initialFood,
  initialWorkoutDates,
  muscles,
  initialMuscleIds,
  hitsByMuscle,
  targetsByMuscle,
}: {
  dashboard: ReactNode;
  today: string;
  weekStartsOn: "monday" | "sunday";
  sedentaryMaintenance: number;
  activeMaintenance: number;
  initialWeekStart: string;
  initialFood: WeekEntryRow[];
  initialWorkoutDates: string[];
  muscles: Muscle[];
  initialMuscleIds: string[];
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
}) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dashboardHeight, setDashboardHeight] = useState<number>();

  useEffect(() => {
    const el = dashboardRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setDashboardHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // DOM order matches mobile stacking (dashboard, then logging); lg:order flips only the
    // visual position at desktop width, not the markup.
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
      <div ref={dashboardRef} className="lg:sticky lg:top-10 lg:order-2 lg:w-80 lg:shrink-0">
        {dashboard}
      </div>

      <div className="lg:order-1 lg:flex-1">
        <HomeTabs
          today={today}
          weekStartsOn={weekStartsOn}
          sedentaryMaintenance={sedentaryMaintenance}
          activeMaintenance={activeMaintenance}
          initialWeekStart={initialWeekStart}
          initialFood={initialFood}
          initialWorkoutDates={initialWorkoutDates}
          muscles={muscles}
          initialMuscleIds={initialMuscleIds}
          hitsByMuscle={hitsByMuscle}
          targetsByMuscle={targetsByMuscle}
          sidebarMinHeight={dashboardHeight}
        />
      </div>
    </div>
  );
}
