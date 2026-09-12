import { calculateWeeklyBudget, calculateZone, type Zone } from "@/lib/calorie";
import { ZONE_LABEL, ZONE_SWATCH_CLASS, ZONE_TRACK_CLASS } from "@/lib/zoneStyles";
import Meter from "../Meter";

function remainingLabel(remaining: number): string {
  return remaining >= 0 ? `${remaining} cal left` : `${-remaining} cal over`;
}

/**
 * "This week" is the hero — domain-rules.md: "the most important number in the whole app is
 * calories remaining for the rest of the week." Large figure plus a meter, so the week's
 * position inside its budget is visible, not just stated. "Today" is the same shape at a
 * smaller size — a preview of the week, not a second hero.
 */
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
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">{title}</p>
        <p className="text-xs text-muted">
          {used}
          <span className="mx-0.5">/</span>
          {budget}
        </p>
      </div>
      <p
        className={`font-mono text-ink ${size === "large" ? "mt-0.5 text-5xl font-medium tracking-tight" : "text-xl"}`}
      >
        {remainingLabel(remaining)}
      </p>
      <div className={size === "large" ? "mt-3" : "mt-1.5"}>
        <Meter
          fraction={used / budget}
          fillClassName={ZONE_SWATCH_CLASS[zone]}
          trackClassName={ZONE_TRACK_CLASS[zone]}
          size={size === "large" ? "md" : "sm"}
        />
      </div>
      <p className="mt-1 text-xs text-muted">{ZONE_LABEL[zone]}</p>
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
