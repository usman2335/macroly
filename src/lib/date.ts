/** Date helpers for the daily log. Dates are plain "YYYY-MM-DD" strings throughout — no times,
 * no timezones — matching entry_date's role as "the day this belongs to" (see data-model.md). */

export function todayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/** Start of the week (as a date string) containing dateString, per the week_starts_on setting. */
export function getWeekStart(dateString: string, weekStartsOn: "monday" | "sunday"): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 = Sunday ... 6 = Saturday
  const startDayOfWeek = weekStartsOn === "monday" ? 1 : 0;
  const daysSinceStart = (dayOfWeek - startDayOfWeek + 7) % 7;
  return addDays(dateString, -daysSinceStart);
}

export function formatDateForDisplay(dateString: string): string {
  const today = todayDateString();
  const yesterday = addDays(today, -1);
  if (dateString === today) return "Today";
  if (dateString === yesterday) return "Yesterday";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
