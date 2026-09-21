import { flushSync } from "react-dom";

/**
 * Wraps a synchronous state update in the View Transitions API so the resulting DOM change
 * morphs instead of cutting. `flushSync` forces React to commit before the browser captures its
 * "after" snapshot — a plain `setState` is batched and wouldn't be committed in time otherwise.
 * Falls back to a plain synchronous update on browsers without support (Firefox, as of this
 * writing) — same end state, just no transition.
 */
export function withViewTransition(update: () => void): void {
  if (typeof document !== "undefined" && typeof document.startViewTransition === "function") {
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}
