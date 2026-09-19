import { formatDateForDisplay } from "@/lib/date";
import type { WeightEntry } from "./actions";

function formatWeight(kg: number): string {
  return kg.toFixed(1);
}

// No good/bad zone here, same as the training scores — just more or less, so this stays out of
// the zone triad entirely (see zoneStyles.ts) and reports the plain change instead.
function deltaLabel(current: number, previous: number): string {
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) return "No change since last weigh-in";
  return `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg since last weigh-in`;
}

/**
 * The dashboard's weight card — always the most recently logged weigh-in, whatever day is
 * selected in the Weight tab below (same "card reports stable facts" rule as NutritionCard).
 * Falls back to the profile's onboarding weight until a first weigh-in is logged.
 */
export default function WeightCard({
  latestEntry,
  previousEntry,
  fallbackWeightKg,
}: {
  latestEntry: WeightEntry | null;
  previousEntry: WeightEntry | null;
  fallbackWeightKg: number | null;
}) {
  if (!latestEntry) {
    return (
      <div>
        <p className="text-sm text-muted">Weight</p>
        {fallbackWeightKg ? (
          <>
            <p className="mt-0.5 font-mono text-3xl font-medium tracking-tight text-ink">
              {formatWeight(fallbackWeightKg)}
              <span className="ml-1 text-base text-muted">kg</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              From your profile — log a weigh-in to start tracking
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">Nothing logged yet.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">Weight</p>
      <p className="mt-0.5 font-mono text-3xl font-medium tracking-tight text-ink">
        {formatWeight(latestEntry.weight_kg)}
        <span className="ml-1 text-base text-muted">kg</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {formatDateForDisplay(latestEntry.entry_date)}
        {previousEntry ? ` · ${deltaLabel(latestEntry.weight_kg, previousEntry.weight_kg)}` : ""}
      </p>
    </div>
  );
}
