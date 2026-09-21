"use client";

import { calculateAdherence, calculateCoverage, calculateCombinedScore, formatPercent } from "@/lib/training";
import Meter from "../Meter";
import { useAnimatedNumber } from "../useAnimatedNumber";

// Training scores are a coverage measure, not a severity one — more is always better, there's
// no "over" tier the way calories have. So the meter uses one hue at two strengths (fill/track)
// rather than the zone triad, per the dataviz sequential-value rule (one hue, light → dark).
const FILL = "bg-accent";
const TRACK = "bg-accent/15";

function ScoreRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | null;
  detail?: string;
}) {
  const animatedValue = useAnimatedNumber(value ?? 0);

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-right">
          <span className="font-mono text-ink">
            {value === null ? "—" : formatPercent(animatedValue)}
          </span>
          {detail ? <span className="ml-2 text-sm text-muted">{detail}</span> : null}
        </span>
      </div>
      <div className="mt-1.5">
        <Meter fraction={value ?? 0} fillClassName={FILL} trackClassName={TRACK} size="sm" />
      </div>
    </div>
  );
}

/**
 * The dashboard's training card — the headline combined score plus its two components. Detailed
 * breakdown (focus-next-week list, full muscle grid) stays in the Training tab below; this is
 * the at-a-glance version only.
 */
export default function TrainingCard({
  hitsByMuscle,
  targetsByMuscle,
  sessionsLogged,
  plannedGymDays,
}: {
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
  sessionsLogged: number;
  plannedGymDays: number;
}) {
  const adherence = calculateAdherence(sessionsLogged, plannedGymDays);
  const coverage = calculateCoverage(hitsByMuscle, targetsByMuscle);
  const combined = calculateCombinedScore(adherence, coverage);
  const animatedCombined = useAnimatedNumber(combined ?? 0);

  return (
    <div>
      <p className="text-sm font-medium text-muted">Training</p>
      <p className="mt-0.5 font-mono text-3xl font-medium tracking-tight text-ink">
        {combined === null ? "—" : formatPercent(animatedCombined)}
      </p>
      <div className="divide-y divide-line">
        <ScoreRow
          label="Adherence"
          value={adherence}
          detail={`${sessionsLogged}/${plannedGymDays} days`}
        />
        <ScoreRow label="Coverage" value={coverage} />
      </div>
    </div>
  );
}
