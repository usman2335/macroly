import { calculateWeeklyBudget, calculateZone, type Zone } from "@/lib/calorie";
import { ZONE_LABEL, ZONE_SWATCH_CLASS } from "@/lib/zoneStyles";
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
    <div className="flex items-baseline justify-between gap-3 py-3">
      <div className="flex items-baseline gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 ${ZONE_SWATCH_CLASS[zone]}`} aria-hidden />
        <div>
          <p className="text-sm text-muted">
            {title} · {ZONE_LABEL[zone]}
          </p>
          <p
            className={`font-mono text-ink ${size === "large" ? "text-3xl" : "text-xl"}`}
          >
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
 * Calorie status at both granularities — the week (always the real current week, "the most
 * important number in the whole app", see domain-rules.md) and the currently selected day below
 * (defaults to today). Both use the same sedentary/active maintenance figures, just scaled ×7
 * for the week. The week row is the one bold typographic moment on the page.
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
    <div className="divide-y divide-line border-y border-line">
      <Row
        title="This week"
        zone={weekZone}
        remaining={weeklyBudget - eatenThisWeek}
        used={eatenThisWeek}
        budget={weeklyBudget}
        size="large"
      />
      <Row
        title={formatDateForDisplay(selectedDate)}
        zone={dayZone}
        remaining={sedentaryMaintenance - eatenToday}
        used={eatenToday}
        budget={sedentaryMaintenance}
        size="small"
      />
    </div>
  );
}
