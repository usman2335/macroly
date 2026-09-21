"use client";

import { addDays, formatWeekRange, weekdayLabel, todayDateString } from "@/lib/date";
import { calculateWeeklyBudget, calculateZone } from "@/lib/calorie";
import { ZONE_LABEL, ZONE_SWATCH_CLASS, ZONE_TEXT_CLASS } from "@/lib/zoneStyles";
import type { Entry } from "./EntryRow";

/** Fixed pixel height of the bar track — small enough to stay compact across 7 columns on a
 * phone, tall enough that a half-budget day and a near-zero day are visibly different, which a
 * same-size status dot (the previous design) couldn't show. */
const BAR_HEIGHT = 32;

/**
 * Seven days at a glance for whichever week is currently loaded (see Module 3 in roadmap.md).
 * Purely derived from entriesByDate and workoutDates, already cached by WeekLog — no query of
 * its own. Distinct from the dashboard's NutritionCard "This week" row: that one is always the
 * real current week and frames itself as "remaining"; this one can be any week you page back to,
 * so it reports used-vs-budget instead — "remaining" doesn't mean anything for a week that's
 * already over.
 */
export default function WeekStrip({
  weekStart,
  entriesByDate,
  workoutDates,
  selectedDate,
  sedentaryMaintenance,
  activeMaintenance,
  loading,
  onSelectDate,
  onNavigateWeek,
}: {
  weekStart: string;
  entriesByDate: Record<string, Entry[]>;
  workoutDates: Set<string>;
  selectedDate: string;
  sedentaryMaintenance: number;
  activeMaintenance: number;
  loading: boolean;
  onSelectDate: (date: string) => void;
  onNavigateWeek: (direction: -1 | 1) => void;
}) {
  const today = todayDateString();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayInfo = days.map((date) => {
    const entries = entriesByDate[date];
    const eaten = entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    const logged = (entries?.length ?? 0) > 0;
    const hasWorkout = workoutDates.has(date);
    return { date, eaten, logged, hasWorkout };
  });

  const weekBudget = calculateWeeklyBudget(sedentaryMaintenance);
  const weekUsed = dayInfo.reduce((sum, d) => sum + d.eaten, 0);
  const weekZone = calculateZone({
    eaten: weekUsed,
    sedentaryMaintenance: weekBudget,
    activeMaintenance: calculateWeeklyBudget(activeMaintenance),
  });

  return (
    <div className="space-y-3 border-b border-line pb-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigateWeek(-1)}
          className="flex h-11 w-11 items-center justify-center text-muted"
          aria-label="Previous week"
        >
          ‹
        </button>
        <span className="text-sm text-muted">
          Week of {formatWeekRange(weekStart)}
          {loading ? "…" : ""}
        </span>
        <button
          type="button"
          onClick={() => onNavigateWeek(1)}
          className="flex h-11 w-11 items-center justify-center text-muted"
          aria-label="Next week"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {dayInfo.map(({ date, eaten, logged, hasWorkout }) => {
          const zone = logged ? calculateZone({ eaten, sedentaryMaintenance, activeMaintenance }) : null;
          const isSelected = date === selectedDate;
          const isFuture = date > today;
          // Bar height scales with how much of the day's own budget was eaten — capped at full
          // height rather than growing past it, so an over-budget day reads through color
          // (zone-over) rather than an overflowing bar. A light day still gets a minimum sliver
          // once something is logged, so "barely anything" stays visibly different from "nothing
          // logged yet" instead of both rounding down to an empty bar.
          const fillHeight =
            logged && eaten > 0
              ? Math.max(3, Math.round(Math.min(1, eaten / sedentaryMaintenance) * BAR_HEIGHT))
              : 0;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center gap-1.5 rounded-md border py-2 text-xs ${
                isSelected ? "border-accent" : "border-transparent"
              }`}
            >
              <span className="text-muted">{weekdayLabel(date)}</span>
              <span
                aria-hidden
                className="flex items-end justify-center rounded-sm bg-line"
                style={{ height: BAR_HEIGHT, width: 10 }}
              >
                <span
                  className={`w-full rounded-sm ${zone ? ZONE_SWATCH_CLASS[zone] : ""}`}
                  style={{ height: fillHeight }}
                />
              </span>
              <span className={`font-mono ${isFuture && !logged ? "text-muted" : "text-ink"}`}>
                {logged ? eaten : "—"}
              </span>
              <span aria-hidden className="h-3 text-[10px] leading-3">
                {hasWorkout ? "🏋" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        Used {weekUsed} / {weekBudget} ·{" "}
        <span className={`font-medium ${ZONE_TEXT_CLASS[weekZone]}`}>{ZONE_LABEL[weekZone]}</span>
      </p>
    </div>
  );
}
