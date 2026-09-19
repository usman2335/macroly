"use client";

import { useState } from "react";
import { formatDateForDisplay } from "@/lib/date";
import type { WeightEntry } from "./actions";

const CHART_HEIGHT = 100;

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86_400_000);
}

/**
 * Weight trend over time — a plain SVG line (no charting library, same "hand-built with divs and
 * CSS" approach as WeekStrip). Points sit at their real x position by elapsed days, not evenly
 * spaced by entry — a run of missed days shows as a longer flat stretch, not silently compressed
 * away. Single hue throughout (accent): there's no "good/bad" zone for weight, so this deliberately
 * skips the zone triad, same reasoning as the training scores (see TrainingCard).
 */
export default function WeightTrendChart({ history }: { history: WeightEntry[] }) {
  const [selectedIndex, setSelectedIndex] = useState(history.length - 1);

  if (history.length === 0) {
    return <p className="text-sm text-muted">Log a weigh-in to start your trend.</p>;
  }

  if (history.length === 1) {
    const only = history[0];
    return (
      <div>
        <p className="font-mono text-3xl font-medium tracking-tight text-ink">
          {only.weight_kg.toFixed(1)}
          <span className="ml-1 text-base text-muted">kg</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          {formatDateForDisplay(only.entry_date)} · log another day to see a trend
        </p>
      </div>
    );
  }

  const first = history[0].entry_date;
  const last = history[history.length - 1].entry_date;
  const totalDays = daysBetween(first, last);

  const weights = history.map((h) => h.weight_kg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight;
  const pad = Math.max(0.5, range * 0.2);
  const domainMin = minWeight - pad;
  const domainMax = maxWeight + pad;

  function xPercent(date: string): number {
    return totalDays === 0 ? 0 : (daysBetween(first, date) / totalDays) * 100;
  }

  function yPx(weight: number): number {
    return CHART_HEIGHT - 8 - ((weight - domainMin) / (domainMax - domainMin)) * (CHART_HEIGHT - 16);
  }

  const points = history.map((entry) => ({
    entry,
    xPercent: xPercent(entry.entry_date),
    y: yPx(entry.weight_kg),
  }));

  const selected = points[selectedIndex] ?? points[points.length - 1];
  const yMax = yPx(maxWeight);
  const yMin = yPx(minWeight);

  return (
    <div className="space-y-2">
      <div className="relative" style={{ height: CHART_HEIGHT }}>
        {minWeight === maxWeight ? (
          <div
            className="pointer-events-none absolute right-0 font-mono text-[10px] text-muted"
            style={{ top: yMax - 6 }}
          >
            {maxWeight.toFixed(1)}
          </div>
        ) : (
          <>
            <div
              className="pointer-events-none absolute right-0 font-mono text-[10px] text-muted"
              style={{ top: yMax - 12 }}
            >
              {maxWeight.toFixed(1)}
            </div>
            <div
              className="pointer-events-none absolute right-0 font-mono text-[10px] text-muted"
              style={{ top: yMin + 2 }}
            >
              {minWeight.toFixed(1)}
            </div>
          </>
        )}

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Weight trend over time"
        >
          <line
            x1="0"
            x2="100"
            y1={yMax}
            y2={yMax}
            className="stroke-line"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {minWeight !== maxWeight ? (
            <line
              x1="0"
              x2="100"
              y1={yMin}
              y2={yMin}
              className="stroke-line"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <polyline
            points={points.map((p) => `${p.xPercent},${p.y}`).join(" ")}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {points.map((p, i) => (
          <button
            key={p.entry.id}
            type="button"
            onClick={() => setSelectedIndex(i)}
            aria-label={`${formatDateForDisplay(p.entry.entry_date)}, ${p.entry.weight_kg.toFixed(1)} kg`}
            className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `${p.xPercent}%`, top: p.y }}
          >
            <span
              className={`rounded-full ${i === selectedIndex ? "h-2.5 w-2.5 bg-accent" : "h-1.5 w-1.5 bg-accent/60"}`}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{formatDateForDisplay(first)}</span>
        <span>{formatDateForDisplay(last)}</span>
      </div>

      <p className="text-sm text-ink">
        {formatDateForDisplay(selected.entry.entry_date)}{" "}
        <span className="font-mono">{selected.entry.weight_kg.toFixed(1)} kg</span>
      </p>
    </div>
  );
}
