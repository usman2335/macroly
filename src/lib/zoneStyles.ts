import type { Zone } from "./calorie";

export const ZONE_LABEL: Record<Zone, string> = {
  "on-target": "On target",
  acceptable: "Acceptable",
  over: "Over",
};

/** Text + background classes, using the zone tokens defined in globals.css. */
export const ZONE_CLASS: Record<Zone, string> = {
  "on-target": "bg-zone-target-bg text-zone-target",
  acceptable: "bg-zone-acceptable-bg text-zone-acceptable",
  over: "bg-zone-over-bg text-zone-over",
};

/** A small stamp-like square swatch, for marking a day cell rather than a rounded status pill. */
export const ZONE_SWATCH_CLASS: Record<Zone, string> = {
  "on-target": "bg-zone-target",
  acceptable: "bg-zone-acceptable",
  over: "bg-zone-over",
};

/** Meter track backgrounds — the same lighter tint used behind zone pills, reused here as the
 * unfilled portion of a Meter so the fill (ZONE_SWATCH_CLASS) reads as "more of the same hue,"
 * not an unrelated grey. */
export const ZONE_TRACK_CLASS: Record<Zone, string> = {
  "on-target": "bg-zone-target-bg",
  acceptable: "bg-zone-acceptable-bg",
  over: "bg-zone-over-bg",
};
