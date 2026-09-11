import { calculateAdherence, calculateCoverage, calculateCombinedScore, formatPercent } from "@/lib/training";

function ScoreRow({ label, value, detail }: { label: string; value: number | null; detail?: string }) {
  return (
    <div className="flex items-baseline justify-between py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right">
        <span className="font-mono text-ink">{value === null ? "—" : formatPercent(value)}</span>
        {detail ? <span className="ml-2 text-sm text-muted">{detail}</span> : null}
      </span>
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

  return (
    <div>
      <p className="text-sm text-muted">Training</p>
      <p className="font-mono text-3xl text-ink">{combined === null ? "—" : formatPercent(combined)}</p>
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
