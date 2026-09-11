"use client";

import { addDays, formatWeekRange, weekdayLabel, todayDateString } from "@/lib/date";
import { calculateWeeklyBudget, calculateZone } from "@/lib/calorie";
import { ZONE_LABEL, ZONE_SWATCH_CLASS } from "@/lib/zoneStyles";
import type { Entry } from "./EntryRow";

type DayEntries = { food: Entry[]; activity: Entry[] };

/**
 * Seven days at a glance for whichever week is currently loaded (see Module 3 in roadmap.md).
 * Purely derived from entriesByDate, already cached by WeekLog — no query of its own. Distinct
 * from CalorieSummary's "This week" row: that one is always the real current week and frames
 * itself as "remaining"; this one can be any week you page back to, so it reports used-vs-budget
 * instead — "remaining" doesn't mean anything for a week that's already over.
 */
export default function WeekStrip({
  weekStart,
  entriesByDate,
  selectedDate,
  sedentaryMaintenance,
  activeMaintenance,
  loading,
  onSelectDate,
  onNavigateWeek,
}: {
  weekStart: string;
  entriesByDate: Record<string, DayEntries>;
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
    const eaten = entries?.food.reduce((sum, e) => sum + (e.amount ?? 0), 0) ?? 0;
    const logged = (entries?.food.length ?? 0) > 0;
    const hasWorkout = (entries?.activity.length ?? 0) > 0;
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
          className="px-1 text-muted"
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
          className="px-1 text-muted"
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

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center gap-1 rounded-md border py-2 text-xs ${
                isSelected ? "border-accent" : "border-transparent"
              }`}
            >
              <span className="text-muted">{weekdayLabel(date)}</span>
              <span
                aria-hidden
                className={`h-1.5 w-1.5 ${zone ? ZONE_SWATCH_CLASS[zone] : "bg-line"}`}
              />
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
        Used {weekUsed} / {weekBudget} · {ZONE_LABEL[weekZone]}
      </p>
    </div>
  );
}
