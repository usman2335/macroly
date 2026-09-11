import { calculateWeeklyBudget, calculateZone, type Zone } from "@/lib/calorie";
import { ZONE_LABEL, ZONE_CLASS } from "@/lib/zoneStyles";
import { formatDateForDisplay } from "@/lib/date";

function remainingLabel(remaining: number): string {
  return remaining >= 0 ? `${remaining} cal left` : `${-remaining} cal over`;
}

function Row({
  title,
  zone,
  remaining,
  used,
  budget,
}: {
  title: string;
  zone: Zone;
  remaining: number;
  used: number;
  budget: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{title}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ZONE_CLASS[zone]}`}>
          {ZONE_LABEL[zone]}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {remainingLabel(remaining)}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {used} / {budget} used
        </span>
      </div>
    </div>
  );
}

/**
 * Calorie status at both granularities — the week (always the real current week, "the most
 * important number in the whole app", see domain-rules.md) and the currently selected day below
 * (defaults to today). Both use the same sedentary/active maintenance figures, just scaled ×7
 * for the week.
 */
export default function CalorieSummary({
  sedentaryMaintenance,
  activeMaintenance,
  eatenThisWeek,
  selectedDate,
  eatenToday,
}: {
  sedentaryMaintenance: number;
  activeMaintenance: number;
  eatenThisWeek: number;
  selectedDate: string;
  eatenToday: number;
}) {
  const weeklyBudget = calculateWeeklyBudget(sedentaryMaintenance);
  const weeklyActiveBudget = calculateWeeklyBudget(activeMaintenance);
  const weekZone = calculateZone({
    eaten: eatenThisWeek,
    sedentaryMaintenance: weeklyBudget,
    activeMaintenance: weeklyActiveBudget,
  });

  const dayZone = calculateZone({ eaten: eatenToday, sedentaryMaintenance, activeMaintenance });

  return (
    <div className="w-full max-w-sm space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <Row
        title="This week"
        zone={weekZone}
        remaining={weeklyBudget - eatenThisWeek}
        used={eatenThisWeek}
        budget={weeklyBudget}
      />
      <div className="border-t border-neutral-200 dark:border-neutral-800" />
      <Row
        title={formatDateForDisplay(selectedDate)}
        zone={dayZone}
        remaining={sedentaryMaintenance - eatenToday}
        used={eatenToday}
        budget={sedentaryMaintenance}
      />
    </div>
  );
}
