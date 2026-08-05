import { api } from "./client";
import { withRetry } from "./retry";

/**
 * `radio-browser-api` doesn't wrap RadioBrowser's /json/stats endpoint, so the
 * catalogue size behind copy like "Search 48,000 stations worldwide" has to be
 * fetched directly. Without this it would be a hardcoded number that silently
 * drifts from reality.
 */
export type ServerStats = {
  stations: number;
  stationsBroken: number;
  tags: number;
  countries: number;
  languages: number;
};

type RawStats = {
  stations?: number;
  stations_broken?: number;
  tags?: number;
  countries?: number;
  languages?: number;
};

let cached: ServerStats | null = null;

async function resolveBaseUrl(): Promise<string> {
  let base = api.getBaseUrl();

  if (!base) {
    // Populates the base URL for every instance of the client.
    await api.resolveBaseUrl();
    base = api.getBaseUrl();
  }

  if (!base) throw new Error("Could not resolve a RadioBrowser server");

  return base.replace(/\/+$/, "");
}

/**
 * Cached for the session — the catalogue size doesn't move meaningfully within
 * one app run, and this is only ever used for display copy.
 */
export async function getServerStats(): Promise<ServerStats> {
  if (cached) return cached;

  const stats = await withRetry(async () => {
    const base = await resolveBaseUrl();
    const response = await fetch(`${base}/json/stats`, {
      headers: { "User-Agent": "static-wave/1.0.0" },
    });

    if (!response.ok) {
      throw new Error(`Stats request failed: ${response.status}`);
    }

    return (await response.json()) as RawStats;
  });

  cached = {
    stations: stats.stations ?? 0,
    stationsBroken: stats.stations_broken ?? 0,
    tags: stats.tags ?? 0,
    countries: stats.countries ?? 0,
    languages: stats.languages ?? 0,
  };

  return cached;
}

/**
 * Stations minus the ones RadioBrowser has flagged broken — the client is
 * configured with `hideBroken`, so this is the count a user can actually reach.
 */
export function getPlayableStationCount(stats: ServerStats): number {
  return Math.max(0, stats.stations - stats.stationsBroken);
}

export function clearStatsCache(): void {
  cached = null;
}
