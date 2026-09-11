import { calculateWeeklyBudget, calculateZone, type Zone } from "@/lib/calorie";
import { ZONE_LABEL, ZONE_SWATCH_CLASS } from "@/lib/zoneStyles";

function remainingLabel(remaining: number): string {
  return remaining >= 0 ? `${remaining} cal left` : `${-remaining} cal over`;
}

function Row({
  title,
  zone,
  remaining,
  used,
  budget,
  size,
}: {
  title: string;
  zone: Zone;
  remaining: number;
  used: number;
  budget: number;
  size: "large" | "small";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <div className="flex items-baseline gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 ${ZONE_SWATCH_CLASS[zone]}`} aria-hidden />
        <div>
          <p className="text-sm text-muted">
            {title} · {ZONE_LABEL[zone]}
          </p>
          <p className={`font-mono text-ink ${size === "large" ? "text-3xl" : "text-xl"}`}>
            {remainingLabel(remaining)}
          </p>
        </div>
      </div>
      <p className="shrink-0 text-right text-sm text-muted">
        {used}
        <span className="mx-0.5">/</span>
        {budget}
      </p>
    </div>
  );
}

/**
 * The dashboard's nutrition card — always today and always the real current week, regardless of
 * which day is being browsed/edited in the Nutrition tab below. A dashboard reports stable
 * facts, not whatever the log's day-switcher currently happens to be pointed at.
 */
export default function NutritionCard({
  sedentaryMaintenance,
  activeMaintenance,
  eatenThisWeek,
  eatenToday,
}: {
  sedentaryMaintenance: number;
  activeMaintenance: number;
  eatenThisWeek: number;
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
    <div>
      <p className="text-sm text-muted">Nutrition</p>
      <div className="divide-y divide-line">
        <Row
          title="This week"
          zone={weekZone}
          remaining={weeklyBudget - eatenThisWeek}
          used={eatenThisWeek}
          budget={weeklyBudget}
          size="large"
        />
        <Row
          title="Today"
          zone={dayZone}
          remaining={sedentaryMaintenance - eatenToday}
          used={eatenToday}
          budget={sedentaryMaintenance}
          size="small"
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        Daily allowance <span className="font-mono text-ink">{sedentaryMaintenance}</span> without
        training, <span className="font-mono text-ink">{activeMaintenance}</span> with
      </p>
    </div>
  );
}
