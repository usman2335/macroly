"use client";

import { useState } from "react";
import WeekLog from "./entries/WeekLog";
import TrainingLog from "./training/TrainingLog";
import WeeklyTrainingSummary from "./training/WeeklyTrainingSummary";
import type { Muscle } from "@/lib/muscles";
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
  hitsByMuscle,
  targetsByMuscle,
  sessionsLogged,
  plannedGymDays,
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
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
  sessionsLogged: number;
  plannedGymDays: number;
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
        <div className="flex flex-col gap-5">
          <WeeklyTrainingSummary
            muscles={muscles}
            hitsByMuscle={hitsByMuscle}
            targetsByMuscle={targetsByMuscle}
            sessionsLogged={sessionsLogged}
            plannedGymDays={plannedGymDays}
          />
          <TrainingLog muscles={muscles} initialDate={today} initialMuscleIds={initialMuscleIds} />
        </div>
      )}
    </div>
  );
}
