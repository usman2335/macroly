"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, formatDateForDisplay, getWeekStart } from "@/lib/date";
import { fetchWeekEntries, type EntryRow as WeekEntryRow } from "./actions";
import QuickAddForm from "./QuickAddForm";
import EntryRowItem, { type Entry } from "./EntryRow";
import WeekStrip from "./WeekStrip";

type DayEntries = { food: Entry[]; activity: Entry[] };

function groupByDate(food: WeekEntryRow[], activity: WeekEntryRow[]): Record<string, DayEntries> {
  const byDate: Record<string, DayEntries> = {};
  for (const row of food) {
    (byDate[row.entry_date] ??= { food: [], activity: [] }).food.push({
      id: row.id,
      kind: "food",
      label: row.label,
      amount: row.amount,
    });
  }
  for (const row of activity) {
    (byDate[row.entry_date] ??= { food: [], activity: [] }).activity.push({
      id: row.id,
      kind: "activity",
      label: row.label,
      amount: row.amount,
    });
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
  initialActivity,
}: {
  initialDate: string;
  weekStartsOn: "monday" | "sunday";
  sedentaryMaintenance: number;
  activeMaintenance: number;
  initialWeekStart: string;
  initialFood: WeekEntryRow[];
  initialActivity: WeekEntryRow[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [entriesByDate, setEntriesByDate] = useState(() =>
    groupByDate(initialFood, initialActivity),
  );
  const [loading, setLoading] = useState(false);

  async function loadWeek(newWeekStart: string) {
    setLoading(true);
    const { food, activity } = await fetchWeekEntries(newWeekStart, addDays(newWeekStart, 6));
    setEntriesByDate(groupByDate(food, activity));
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
  function handleAdded(entry: WeekEntryRow, kind: "food" | "activity") {
    const newEntry: Entry = { id: entry.id, kind, label: entry.label, amount: entry.amount };
    setEntriesByDate((prev) => {
      const day = prev[entry.entry_date] ?? { food: [], activity: [] };
      return {
        ...prev,
        [entry.entry_date]:
          kind === "food"
            ? { ...day, food: [...day.food, newEntry] }
            : { ...day, activity: [...day.activity, newEntry] },
      };
    });
    router.refresh();
  }

  function handleUpdated(updated: Entry) {
    setEntriesByDate((prev) => {
      const d = prev[selectedDate] ?? { food: [], activity: [] };
      const newList = (updated.kind === "food" ? d.food : d.activity).map((e) =>
        e.id === updated.id ? updated : e,
      );
      return {
        ...prev,
        [selectedDate]:
          updated.kind === "food" ? { ...d, food: newList } : { ...d, activity: newList },
      };
    });
    router.refresh();
  }

  function handleDeleted(id: string, kind: "food" | "activity") {
    setEntriesByDate((prev) => {
      const d = prev[selectedDate] ?? { food: [], activity: [] };
      return {
        ...prev,
        [selectedDate]:
          kind === "food"
            ? { ...d, food: d.food.filter((e) => e.id !== id) }
            : { ...d, activity: d.activity.filter((e) => e.id !== id) },
      };
    });
    router.refresh();
  }

  const dayEntries = entriesByDate[selectedDate] ?? { food: [], activity: [] };
  const entries = [...dayEntries.food, ...dayEntries.activity];

  return (
    <div className="flex w-full flex-col gap-5">
      <WeekStrip
        weekStart={weekStart}
        entriesByDate={entriesByDate}
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

      <div className="space-y-2">
        <QuickAddForm
          kind="food"
          date={selectedDate}
          onAdded={(entry) => handleAdded(entry, "food")}
        />
        <QuickAddForm
          kind="activity"
          date={selectedDate}
          onAdded={(entry) => handleAdded(entry, "activity")}
        />
      </div>

      {entries.length > 0 ? (
        <div className="divide-y divide-line border-y border-line">
          {entries.map((entry) => (
            <EntryRowItem
              key={`${entry.kind}-${entry.id}`}
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
