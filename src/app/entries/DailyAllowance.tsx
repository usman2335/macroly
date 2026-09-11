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
    <p className="w-full max-w-sm text-center text-xs text-neutral-500 dark:text-neutral-400">
      Daily allowance: {sedentaryMaintenance} cal (no workout) · {activeMaintenance} cal (with
      workout)
    </p>
  );
}
