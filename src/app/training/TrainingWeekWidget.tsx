/**
 * Quick-glance training status, visible regardless of which tab is active. Deliberately just a
 * count — the actual adherence/coverage scoring is Module 5's job (see roadmap.md), not this
 * module's.
 */
export default function TrainingWeekWidget({ workoutsThisWeek }: { workoutsThisWeek: number }) {
  return (
    <p className="text-sm text-muted">
      <span className="font-mono text-ink">{workoutsThisWeek}</span>{" "}
      {workoutsThisWeek === 1 ? "workout" : "workouts"} logged this week
    </p>
  );
}
