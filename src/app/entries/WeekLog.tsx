"use client";

import { useState } from "react";
import { addDays, formatDateForDisplay, getWeekStart } from "@/lib/date";
import { fetchWeekEntries, type EntryRow as WeekEntryRow } from "./actions";
import QuickAddForm from "./QuickAddForm";
import EntryRowItem, { type Entry } from "./EntryRow";
import CalorieSummary from "./CalorieSummary";
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
  today,
  initialDate,
  weekStartsOn,
  sedentaryMaintenance,
  activeMaintenance,
  initialWeekStart,
  initialFood,
  initialActivity,
  initialEatenThisWeek,
}: {
  today: string;
  initialDate: string;
  weekStartsOn: "monday" | "sunday";
  sedentaryMaintenance: number;
  activeMaintenance: number;
  initialWeekStart: string;
  initialFood: WeekEntryRow[];
  initialActivity: WeekEntryRow[];
  initialEatenThisWeek: number;
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [entriesByDate, setEntriesByDate] = useState(() =>
    groupByDate(initialFood, initialActivity),
  );
  const [eatenThisWeek, setEatenThisWeek] = useState(initialEatenThisWeek);
  const [loading, setLoading] = useState(false);

  // The weekly summary always reflects the real current week, independent of which week is
  // currently being browsed/edited below it — these can differ (e.g. fixing a forgotten entry
  // from last week), so this range is fixed, not tied to `weekStart`.
  const realCurrentWeekStart = getWeekStart(today, weekStartsOn);
  const realCurrentWeekEnd = addDays(realCurrentWeekStart, 6);
  function isWithinRealCurrentWeek(dateStr: string) {
    return dateStr >= realCurrentWeekStart && dateStr <= realCurrentWeekEnd;
  }

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
    if (kind === "food" && isWithinRealCurrentWeek(entry.entry_date)) {
      setEatenThisWeek((prev) => prev + (entry.amount ?? 0));
    }
  }

  function handleUpdated(updated: Entry) {
    const day = entriesByDate[selectedDate] ?? { food: [], activity: [] };
    const list = updated.kind === "food" ? day.food : day.activity;
    const previous = list.find((e) => e.id === updated.id);

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

    if (updated.kind === "food" && isWithinRealCurrentWeek(selectedDate)) {
      const delta = (updated.amount ?? 0) - (previous?.amount ?? 0);
      setEatenThisWeek((prev) => prev + delta);
    }
  }

  function handleDeleted(id: string, kind: "food" | "activity") {
    const day = entriesByDate[selectedDate] ?? { food: [], activity: [] };
    const removed = (kind === "food" ? day.food : day.activity).find((e) => e.id === id);

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

    if (kind === "food" && removed && isWithinRealCurrentWeek(selectedDate)) {
      setEatenThisWeek((prev) => prev - (removed.amount ?? 0));
    }
  }

  const dayEntries = entriesByDate[selectedDate] ?? { food: [], activity: [] };
  const eatenToday = dayEntries.food.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const entries = [...dayEntries.food, ...dayEntries.activity];

  return (
    <div className="flex w-full flex-col gap-5">
      <CalorieSummary
        sedentaryMaintenance={sedentaryMaintenance}
        activeMaintenance={activeMaintenance}
        eatenThisWeek={eatenThisWeek}
        selectedDate={selectedDate}
        eatenToday={eatenToday}
      />

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
