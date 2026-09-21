/**
 * A thin proportional bar — fill carries the value's severity/magnitude, the unfilled track is
 * a lighter step of the same hue so the state reads across the whole bar, not just the tip.
 * Shared by the nutrition and training dashboard cards (Module 6) so both read as one system
 * instead of one card having a visual and the other just text.
 */
export default function Meter({
  fraction,
  fillClassName,
  trackClassName,
  size = "md",
}: {
  /** 0–1+. Values above 1 still render a full bar — color and the accompanying number already
   * say "over"; the bar doesn't need a second way to say it. */
  fraction: number;
  fillClassName: string;
  trackClassName: string;
  size?: "sm" | "md";
}) {
  // A floor once there's anything to show at all, so a small-but-real value (2 cal logged
  // against an 1800 budget) still reads as "something," not rounding away to an empty track.
  const clamped = Math.min(1, Math.max(0, fraction));
  const width = `${clamped > 0 ? Math.max(3, clamped * 100) : 0}%`;
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${trackClassName} ${size === "sm" ? "h-1" : "h-1.5"}`}
    >
      <div
        className={`h-full rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${fillClassName}`}
        style={{ width }}
      />
    </div>
  );
}
