/**
 * Purely cosmetic — a rotating, deliberately sarcastic greeting instead of a plain "Welcome
 * back." Picked deterministically from the date (not random per render) so it doesn't change
 * mid-session every time a mutation triggers a router.refresh().
 */
const GREETINGS = [
  "Welcome back. Let's see today's damage.",
  "Oh, it's you. The calories won't count themselves.",
  "Back again? Bold of you to assume that was one serving.",
  "Welcome back. Time to round everything up, as usual.",
  "You're here. The gym isn't going to guilt-trip itself.",
  "Another day, another creatively estimated paratha.",
];

export function getDailyGreeting(dateString: string): string {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) | 0;
  }
  return GREETINGS[Math.abs(hash) % GREETINGS.length];
}
