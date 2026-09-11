/**
 * Weekly training score — see docs/domain-rules.md ("Weekly training score, two parts") and
 * docs/open-questions.md for how the default-target and combined-score decisions were made.
 */

export const DEFAULT_WEEKLY_TARGET = 2;

/** Sessions logged ÷ planned gym days, capped at 100%. Null if no gym days are planned at all —
 * "adherence to zero" isn't a meaningful percentage. */
export function calculateAdherence(sessionsLogged: number, plannedGymDays: number): number | null {
  if (plannedGymDays <= 0) return null;
  return Math.min(1, sessionsLogged / plannedGymDays);
}

/** sum(min(hits, target)) / sum(targets) — hitting one muscle repeatedly can't compensate for
 * missing another entirely. Null if every target is 0 (nothing to cover). */
export function calculateCoverage(
  hitsByMuscle: Record<string, number>,
  targetsByMuscle: Record<string, number>,
): number | null {
  let hitSum = 0;
  let targetSum = 0;
  for (const muscleId in targetsByMuscle) {
    const target = targetsByMuscle[muscleId];
    const hits = hitsByMuscle[muscleId] ?? 0;
    hitSum += Math.min(hits, target);
    targetSum += target;
  }
  if (targetSum === 0) return null;
  return hitSum / targetSum;
}

/** Plain average of adherence and coverage — a headline convenience shown alongside them, never
 * instead of them (see domain-rules.md). Null if either half isn't meaningful. */
export function calculateCombinedScore(
  adherence: number | null,
  coverage: number | null,
): number | null {
  if (adherence === null || coverage === null) return null;
  return (adherence + coverage) / 2;
}

export type FocusItem = { muscleId: string; hits: number; target: number; shortfall: number };

/** Muscles that fell short of target this week, worst shortfall first. */
export function getFocusList(
  hitsByMuscle: Record<string, number>,
  targetsByMuscle: Record<string, number>,
): FocusItem[] {
  const items: FocusItem[] = [];
  for (const muscleId in targetsByMuscle) {
    const target = targetsByMuscle[muscleId];
    const hits = hitsByMuscle[muscleId] ?? 0;
    if (hits < target) items.push({ muscleId, hits, target, shortfall: target - hits });
  }
  return items.sort((a, b) => b.shortfall - a.shortfall);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
