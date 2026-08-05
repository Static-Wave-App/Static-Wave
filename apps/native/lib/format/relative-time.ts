const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Formats a past timestamp as a short relative label — "just now", "2m ago",
 * "1h ago", "Yesterday", "3d ago", then falls back to a date (flows/05).
 */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const elapsed = now - timestamp;

  if (elapsed < 0) return "just now";
  if (elapsed < MINUTE) return "just now";

  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)}m ago`;
  }

  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)}h ago`;
  }

  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "Yesterday";
  if (elapsed < WEEK) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Formats seconds as `M:SS` (or `H:MM:SS`) for the sleep timer countdown. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}
