"use client";

import { useState } from "react";
import {
  calculateAdherence,
  calculateCoverage,
  calculateCombinedScore,
  getFocusList,
  formatPercent,
} from "@/lib/training";
import { capitalize, groupMuscles, type Muscle } from "@/lib/muscles";

function Score({ label, value, detail }: { label: string; value: number | null; detail?: string }) {
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

export default function WeeklyTrainingSummary({
  muscles,
  hitsByMuscle,
  targetsByMuscle,
  sessionsLogged,
  plannedGymDays,
}: {
  muscles: Muscle[];
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
  sessionsLogged: number;
  plannedGymDays: number;
}) {
  const [showAll, setShowAll] = useState(false);

  const adherence = calculateAdherence(sessionsLogged, plannedGymDays);
  const coverage = calculateCoverage(hitsByMuscle, targetsByMuscle);
  const combined = calculateCombinedScore(adherence, coverage);
  const focusList = getFocusList(hitsByMuscle, targetsByMuscle);
  const muscleById = new Map(muscles.map((m) => [m.id, m]));
  const groups = groupMuscles(muscles);

  return (
    <div className="space-y-3 border-b border-line pb-4">
      <div className="flex items-baseline justify-between py-1">
        <span className="text-sm text-muted">This week</span>
        <span className="font-mono text-3xl text-ink">
          {combined === null ? "—" : formatPercent(combined)}
        </span>
      </div>

      <div className="divide-y divide-line">
        <Score label="Adherence" value={adherence} detail={`${sessionsLogged}/${plannedGymDays} days`} />
        <Score label="Coverage" value={coverage} />
      </div>

      {focusList.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-sm text-muted">Focus next week</p>
          <ul className="space-y-1">
            {focusList.slice(0, 5).map(({ muscleId, hits, target }) => (
              <li key={muscleId} className="flex items-baseline justify-between text-sm">
                <span className="text-ink">{muscleById.get(muscleId)?.name ?? muscleId}</span>
                <span className="font-mono text-muted">
                  {hits}/{target}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted">Every muscle hit its target this week.</p>
      )}

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="text-sm text-accent underline underline-offset-2"
      >
        {showAll ? "Hide all muscles" : "Show all muscles"}
      </button>

      {showAll ? (
        <div className="space-y-3">
          {groups.map(({ group, muscles: groupMuscleList }) => (
            <div key={group} className="space-y-1">
              <p className="text-sm text-muted">{capitalize(group)}</p>
              {groupMuscleList.map((muscle) => (
                <div key={muscle.id} className="flex items-baseline justify-between text-sm">
                  <span className="text-ink">{muscle.name}</span>
                  <span className="font-mono text-muted">
                    {hitsByMuscle[muscle.id] ?? 0}/{targetsByMuscle[muscle.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
