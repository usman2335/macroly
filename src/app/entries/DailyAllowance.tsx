/**
 * Quick reference for the two daily maintenance figures from Module 1 (see domain-rules.md) —
 * plain reference numbers, not tied to what's actually been eaten, so this is a small caption
 * rather than another card competing with CalorieSummary for attention.
 */
export default function DailyAllowance({
  sedentaryMaintenance,
  activeMaintenance,
}: {
  sedentaryMaintenance: number;
  activeMaintenance: number;
}) {
  return (
    <p className="text-sm text-muted">
      Daily allowance{" "}
      <span className="font-mono text-ink">{sedentaryMaintenance}</span> without training,{" "}
      <span className="font-mono text-ink">{activeMaintenance}</span> with
    </p>
  );
}
