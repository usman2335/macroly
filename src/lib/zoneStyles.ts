import type { Zone } from "./calorie";

export const ZONE_LABEL: Record<Zone, string> = {
  "on-target": "On target",
  acceptable: "Acceptable",
  over: "Over",
};

export const ZONE_CLASS: Record<Zone, string> = {
  "on-target": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  acceptable: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  over: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};
