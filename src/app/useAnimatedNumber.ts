"use client";

import { useEffect, useState } from "react";

/** Same expo-out curve as the view-transition timing in globals.css, so every motion in the app
 * — structural morphs and value changes alike — decelerates the same way. */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tweens a displayed number toward `target` over `durationMs` instead of snapping — for hero
 * figures (calories remaining, training score, weight) that would otherwise jump discontinuously
 * whenever an entry is added, edited, or deleted. Skips the tween on first mount, so a number
 * never animates in from zero when a page first loads, and on `prefers-reduced-motion`. Returns
 * a raw float; callers format it (Math.round for calories, .toFixed(1) for weight, etc.) exactly
 * as they format `target` today.
 */
export function useAnimatedNumber(target: number, durationMs = 450): number {
  const [displayed, setDisplayed] = useState(target);
  const [prevTarget, setPrevTarget] = useState(target);
  const [animFrom, setAnimFrom] = useState(target);

  // "Adjusting state when a prop changes" (react.dev) rather than an effect — this runs mid
  // render, before paint, so it can't cause the cascading extra commit an effect-based reset
  // would. On first mount `target === prevTarget` already, so the tween is skipped for free.
  if (target !== prevTarget) {
    setPrevTarget(target);
    setAnimFrom(displayed);
    if (prefersReducedMotion()) {
      setDisplayed(target);
    }
  }

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (animFrom === target) return;

    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, durationMs === 0 ? 1 : elapsed / durationMs);
      setDisplayed(animFrom + (target - animFrom) * easeOutExpo(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, animFrom]);

  return displayed;
}
