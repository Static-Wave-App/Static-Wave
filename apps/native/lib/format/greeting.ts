/**
 * The Dashboard's time-of-day label. The design shows "Good evening"; the
 * other two are the same line at other hours.
 *
 * Boundaries are the conventional ones — 05:00–11:59 morning, 12:00–17:59
 * afternoon, everything else evening. Uses the device's local hour, which is
 * what the user experiences regardless of the station's timezone.
 */
export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}
