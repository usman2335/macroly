"use client";

import { useState } from "react";
import WeekLog from "./entries/WeekLog";
import TrainingLog, { type Muscle } from "./training/TrainingLog";
import type { EntryRow as WeekEntryRow } from "./entries/actions";

type Tab = "nutrition" | "training";

export default function HomeTabs({
  today,
  weekStartsOn,
  sedentaryMaintenance,
  activeMaintenance,
  initialWeekStart,
  initialFood,
  initialActivity,
  initialEatenThisWeek,
  muscles,
  initialMuscleIds,
}: {
  today: string;
  weekStartsOn: "monday" | "sunday";
  sedentaryMaintenance: number;
  activeMaintenance: number;
  initialWeekStart: string;
  initialFood: WeekEntryRow[];
  initialActivity: WeekEntryRow[];
  initialEatenThisWeek: number;
  muscles: Muscle[];
  initialMuscleIds: string[];
}) {
  const [tab, setTab] = useState<Tab>("nutrition");

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex gap-5 border-b border-line">
        {(
          [
            ["nutrition", "Nutrition"],
            ["training", "Training"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`-mb-px border-b-2 pb-2 text-sm ${
              tab === value ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "nutrition" ? (
        <WeekLog
          today={today}
          initialDate={today}
          weekStartsOn={weekStartsOn}
          sedentaryMaintenance={sedentaryMaintenance}
          activeMaintenance={activeMaintenance}
          initialWeekStart={initialWeekStart}
          initialFood={initialFood}
          initialActivity={initialActivity}
          initialEatenThisWeek={initialEatenThisWeek}
        />
      ) : (
        <TrainingLog muscles={muscles} initialDate={today} initialMuscleIds={initialMuscleIds} />
      )}
    </div>
  );
}
