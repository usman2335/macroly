"use client";

import { useState } from "react";
import { getFocusList } from "@/lib/training";
import { withViewTransition } from "@/lib/viewTransition";
import { capitalize, groupMuscles, type Muscle } from "@/lib/muscles";

/**
 * The Training tab's detail view — focus-next-week list and the full per-muscle breakdown. The
 * headline scores (combined/adherence/coverage) live in the dashboard's TrainingCard instead;
 * this is the drill-down, not the at-a-glance summary.
 */
export default function TrainingDetails({
  muscles,
  hitsByMuscle,
  targetsByMuscle,
}: {
  muscles: Muscle[];
  hitsByMuscle: Record<string, number>;
  targetsByMuscle: Record<string, number>;
}) {
  const [showAll, setShowAll] = useState(false);

  const focusList = getFocusList(hitsByMuscle, targetsByMuscle);
  const muscleById = new Map(muscles.map((m) => [m.id, m]));
  const groups = groupMuscles(muscles);

  return (
    <div className="space-y-3 border-b border-line pb-4">
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
        <p className="text-sm font-medium text-ink">
          Every muscle hit its target this week. Suspiciously disciplined.
        </p>
      )}

      <button
        type="button"
        onClick={() => withViewTransition(() => setShowAll((v) => !v))}
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
