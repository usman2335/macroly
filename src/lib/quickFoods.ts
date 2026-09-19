/**
 * Ranks "usual" foods out of recent history, so a repeat meal can be logged with one tap instead
 * of retyped — Module 2's founding constraint was "entry must be fast" (roadmap.md); this is the
 * same idea applied to the meals that show up again and again.
 *
 * Grouped by a normalized label (trimmed + lowercased) so "Chicken Karahi" and "chicken karahi"
 * count as the same food, but displayed using whichever exact spelling was typed most recently.
 * The suggested amount is each food's most-frequently-logged calorie figure — the usual portion,
 * not just whatever the last one happened to be (portions vary; see the accuracy note in
 * domain-rules.md — the point here is speed, not a new source of precision).
 */

export type QuickFood = { label: string; amount: number };

type LoggedEntry = { label: string; calories: number; entry_date: string };

/** A food only earns a spot once it's shown up more than once — a single one-off entry isn't a
 * "usual," it's just the last thing that got typed. */
const MIN_OCCURRENCES = 2;

export function rankQuickFoods(entries: LoggedEntry[], limit = 8): QuickFood[] {
  type AmountStat = { count: number; lastDate: string };
  type Group = {
    label: string;
    labelDate: string;
    amounts: Map<number, AmountStat>;
    totalCount: number;
    lastDate: string;
  };

  const groups = new Map<string, Group>();

  for (const entry of entries) {
    const label = entry.label.trim();
    const key = label.toLowerCase();
    if (!key) continue;

    let group = groups.get(key);
    if (!group) {
      group = { label, labelDate: entry.entry_date, amounts: new Map(), totalCount: 0, lastDate: entry.entry_date };
      groups.set(key, group);
    }
    if (entry.entry_date >= group.labelDate) {
      group.label = label;
      group.labelDate = entry.entry_date;
    }
    if (entry.entry_date > group.lastDate) group.lastDate = entry.entry_date;

    const stat = group.amounts.get(entry.calories) ?? { count: 0, lastDate: entry.entry_date };
    stat.count += 1;
    if (entry.entry_date > stat.lastDate) stat.lastDate = entry.entry_date;
    group.amounts.set(entry.calories, stat);

    group.totalCount += 1;
  }

  const ranked = Array.from(groups.values())
    .filter((group) => group.totalCount >= MIN_OCCURRENCES)
    .map((group) => {
      // The usual amount: whichever calorie figure this food was logged with most often, ties
      // broken by whichever was used more recently.
      let bestAmount = 0;
      let best: AmountStat | undefined;
      for (const [amount, stat] of group.amounts) {
        if (!best || stat.count > best.count || (stat.count === best.count && stat.lastDate > best.lastDate)) {
          best = stat;
          bestAmount = amount;
        }
      }
      return { label: group.label, amount: bestAmount, totalCount: group.totalCount, lastDate: group.lastDate };
    });

  ranked.sort((a, b) => b.totalCount - a.totalCount || (a.lastDate < b.lastDate ? 1 : -1));

  return ranked.slice(0, limit).map(({ label, amount }) => ({ label, amount }));
}
