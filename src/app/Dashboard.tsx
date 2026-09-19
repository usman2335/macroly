import NutritionCard from "./entries/NutritionCard";
import TrainingCard from "./training/TrainingCard";
import WeightCard from "./weight/WeightCard";
import type { WeightEntry } from "./weight/actions";

/**
 * Module 6: "one home screen combining this week's nutrition status and training status"
 * (roadmap.md). Given its own surface color (not just a border) and an explicit heading so it
 * reads as a distinct, titled panel — a glance-only dashboard, separate from the tabs, which are
 * the actual logging workspace.
 */
export default function Dashboard({
  sedentaryMaintenance,
  activeMaintenance,
  eatenThisWeek,
  eatenToday,
  hitsByMuscle,
  targetsByMuscle,
  sessionsLogged,
  plannedGymDays,
  latestWeightEntry,
  previousWeightEntry,
  fallbackWeightKg,
}: {
  sedentaryMaintenance: number;
  activeMaintenance: number;
  eatenThisWeek: number;
  eatenToday: number;
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
  sessionsLogged: number;
  plannedGymDays: number;
  latestWeightEntry: WeightEntry | null;
  previousWeightEntry: WeightEntry | null;
  fallbackWeightKg: number | null;
}) {
  return (
    <div className="space-y-4 rounded-lg bg-surface p-5 shadow-sm ring-1 ring-line/60">
      <div>
        <p className="text-sm font-medium text-ink">Weekly overview</p>
        <p className="text-xs text-muted">Where you stand this week, at a glance</p>
      </div>

      <div className="divide-y divide-line">
        <div className="pb-4">
          <NutritionCard
            sedentaryMaintenance={sedentaryMaintenance}
            activeMaintenance={activeMaintenance}
            eatenThisWeek={eatenThisWeek}
            eatenToday={eatenToday}
          />
        </div>
        <div className="py-4">
          <TrainingCard
            hitsByMuscle={hitsByMuscle}
            targetsByMuscle={targetsByMuscle}
            sessionsLogged={sessionsLogged}
            plannedGymDays={plannedGymDays}
          />
        </div>
        <div className="pt-4">
          <WeightCard
            latestEntry={latestWeightEntry}
            previousEntry={previousWeightEntry}
            fallbackWeightKg={fallbackWeightKg}
          />
        </div>
      </div>
    </div>
  );
}
