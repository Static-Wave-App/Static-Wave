import type { Station } from "@static-wave/types";

import { formatRelativeTime } from "./relative-time";

/**
 * Honest replacements for the metrics in the mockups that RadioBrowser doesn't
 * actually expose. Each function is documented with what the API *does* give us
 * so nobody re-adds a number the server never sent.
 */

export type StationStatus = {
  isOnline: boolean;
  /** "Online" / "Offline" — replaces the mockup's invented "UPTIME 99.6%". */
  label: string;
  /** "Checked 2h ago", or null when the API gave no usable timestamp. */
  checkedLabel: string | null;
};

/**
 * RadioBrowser has no uptime percentage. What it has is `lastcheckok` (a 0/1
 * flag from its own most recent probe) and `lastchecktime`. That supports a
 * status and a freshness stamp — not a percentage.
 */
export function getStationStatus(station: Station, now: number = Date.now()): StationStatus {
  const isOnline = station.lastcheckok === 1;
  const checkedAt = parseCheckTime(station.lastchecktime);

  return {
    isOnline,
    label: isOnline ? "Online" : "Offline",
    checkedLabel: checkedAt === null ? null : `Checked ${formatRelativeTime(checkedAt, now)}`,
  };
}

function parseCheckTime(value: string): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * RadioBrowser has no per-country ranking, so the mockup's
 * "TRENDING #6 IN FRANCE" isn't derivable. `clicktrend` is the change in click
 * count over the last day — a direction, not a rank. Show it as a direction.
 *
 * Returns null when the station isn't trending, so the badge can be omitted
 * rather than rendering something meaningless.
 */
export function getTrendLabel(station: Station): string | null {
  if (station.clicktrend > 0) {
    return `Trending up · +${formatCompactNumber(station.clicktrend)} today`;
  }
  return null;
}

/** True when the station is worth badging as popular, based on real vote data. */
export function isPopular(station: Station): boolean {
  return station.votes >= 1000;
}

/** "1,284 votes" — `votes` is a real field, so the mockup's copy stands. */
export function formatVotes(votes: number): string {
  const safe = Math.max(0, Math.floor(votes));
  return `${safe.toLocaleString()} ${safe === 1 ? "vote" : "votes"}`;
}

/** "192 kbps", or null when the API reports 0 (meaning "unknown", not silent). */
export function formatBitrate(bitrate: number): string | null {
  return bitrate > 0 ? `${bitrate} kbps` : null;
}

/** Compact bitrate for dense list rows: "192K". */
export function formatBitrateBadge(bitrate: number): string | null {
  return bitrate > 0 ? `${bitrate}K` : null;
}

export function formatCodec(codec: string): string | null {
  const trimmed = codec?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

/**
 * Search results: RadioBrowser returns a page, never a total. The mockup's
 * "248 RESULTS" can't be produced. This reports what we actually know — how
 * many are loaded, and whether more exist.
 */
export function formatResultCount(loaded: number, hasMore: boolean): string {
  if (loaded === 0) return "No results";
  const noun = loaded === 1 ? "result" : "results";
  return hasMore ? `${loaded}+ ${noun}` : `${loaded} ${noun}`;
}

/**
 * Favorites header: "12 stations · 4 countries". Both are derived from local
 * data, so this one needs no API support.
 */
export function formatCollectionSummary(stations: Array<{ country: string }>): string {
  const countries = new Set(
    stations.map((s) => s.country?.trim()).filter((c): c is string => Boolean(c)),
  );

  const stationPart = `${stations.length} ${stations.length === 1 ? "station" : "stations"}`;
  if (countries.size === 0) return stationPart;

  return `${stationPart} · ${countries.size} ${countries.size === 1 ? "country" : "countries"}`;
}

/**
 * Rounds a catalogue size down for marketing copy ("48,000 stations
 * worldwide"), so a live figure never reads as spuriously precise.
 */
export function formatCatalogueSize(total: number): string {
  if (total < 1000) return total.toLocaleString();
  const rounded = Math.floor(total / 1000) * 1000;
  return rounded.toLocaleString();
}

export function formatCompactNumber(value: number): string {
  const safe = Math.max(0, Math.floor(value));
  if (safe < 1000) return String(safe);
  if (safe < 1_000_000) {
    const k = safe / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.floor(k)}K`;
  }
  const m = safe / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.floor(m)}M`;
}

/** Splits the comma-separated `tags` string into display-ready labels. */
export function getStationTags(station: Station, limit = 3): string[] {
  return station.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((t) => t.replace(/\b\w/g, (c) => c.toUpperCase()));
}

/** "Lounge · Paris, France" style subtitle, skipping missing parts. */
export function formatStationSubtitle(station: Station): string {
  const genre = getStationTags(station, 1)[0];
  const place = [station.state?.trim(), station.country?.trim()]
    .filter(Boolean)
    .join(", ");

  return [genre, place].filter(Boolean).join(" · ");
}
