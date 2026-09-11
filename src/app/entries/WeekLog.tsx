"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, formatDateForDisplay, getWeekStart } from "@/lib/date";
import { fetchWeekEntries, type EntryRow as WeekEntryRow } from "./actions";
import QuickAddForm from "./QuickAddForm";
import EntryRowItem, { type Entry } from "./EntryRow";
import WeekStrip from "./WeekStrip";

function groupByDate(food: WeekEntryRow[]): Record<string, Entry[]> {
  const byDate: Record<string, Entry[]> = {};
  for (const row of food) {
    (byDate[row.entry_date] ??= []).push({ id: row.id, label: row.label, amount: row.amount });
  }
  return byDate;
}

export default function WeekLog({
  initialDate,
  weekStartsOn,
  sedentaryMaintenance,
  activeMaintenance,
  initialWeekStart,
  initialFood,
  initialWorkoutDates,
}: {
  initialDate: string;
  weekStartsOn: "monday" | "sunday";
  sedentaryMaintenance: number;
  activeMaintenance: number;
  initialWeekStart: string;
  initialFood: WeekEntryRow[];
  initialWorkoutDates: string[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [entriesByDate, setEntriesByDate] = useState(() => groupByDate(initialFood));
  const [workoutDates, setWorkoutDates] = useState(() => new Set(initialWorkoutDates));
  const [loading, setLoading] = useState(false);

  async function loadWeek(newWeekStart: string) {
    setLoading(true);
    const { food, workoutDates: newWorkoutDates } = await fetchWeekEntries(
      newWeekStart,
      addDays(newWeekStart, 6),
    );
    setEntriesByDate(groupByDate(food));
    setWorkoutDates(new Set(newWorkoutDates));
    setWeekStart(newWeekStart);
    setLoading(false);
  }

  function changeDate(newDate: string) {
    setSelectedDate(newDate);
    const newWeekStart = getWeekStart(newDate, weekStartsOn);
    if (newWeekStart !== weekStart) {
      loadWeek(newWeekStart);
    }
  }

  function navigateWeek(direction: -1 | 1) {
    const newWeekStart = addDays(weekStart, direction * 7);
    setSelectedDate(newWeekStart);
    loadWeek(newWeekStart);
  }

  // The dashboard's nutrition card lives outside this component now (Module 6) and gets its
  // numbers from page.tsx's server render, so any mutation here needs to refresh that too —
  // this component's own entriesByDate update is just for the instant local list feedback.
  function handleAdded(entry: WeekEntryRow) {
    const newEntry: Entry = { id: entry.id, label: entry.label, amount: entry.amount };
    setEntriesByDate((prev) => ({
      ...prev,
      [entry.entry_date]: [...(prev[entry.entry_date] ?? []), newEntry],
    }));
    router.refresh();
  }

  function handleUpdated(updated: Entry) {
    setEntriesByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((e) => (e.id === updated.id ? updated : e)),
    }));
    router.refresh();
  }

  function handleDeleted(id: string) {
    setEntriesByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter((e) => e.id !== id),
    }));
    router.refresh();
  }

  const entries = entriesByDate[selectedDate] ?? [];

  return (
    <div className="flex w-full flex-col gap-5">
      <WeekStrip
        weekStart={weekStart}
        entriesByDate={entriesByDate}
        workoutDates={workoutDates}
        selectedDate={selectedDate}
        sedentaryMaintenance={sedentaryMaintenance}
        activeMaintenance={activeMaintenance}
        loading={loading}
        onSelectDate={changeDate}
        onNavigateWeek={navigateWeek}
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeDate(addDays(selectedDate, -1))}
          className="px-1 text-muted"
          aria-label="Previous day"
        >
          ‹
        </button>
        <span className="text-sm text-ink">
          {formatDateForDisplay(selectedDate)}
          {loading ? "…" : ""}
        </span>
        <button
          type="button"
          onClick={() => changeDate(addDays(selectedDate, 1))}
          className="px-1 text-muted"
          aria-label="Next day"
        >
          ›
        </button>
      </div>

      <QuickAddForm date={selectedDate} onAdded={handleAdded} />

      {entries.length > 0 ? (
        <div className="divide-y divide-line border-y border-line">
          {entries.map((entry) => (
            <EntryRowItem
              key={entry.id}
              entry={entry}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Nothing logged yet.</p>
      )}
    </div>
  );
}
