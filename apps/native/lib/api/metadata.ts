import type { CountryResult, Query, TagResult } from "radio-browser-api";

import { api } from "./client";
import { withRetry } from "./retry";

// `hideBroken` is already applied at the client level (see client.ts).
const METADATA_QUERY: Query = { order: "stationcount", reverse: true };

let cachedTags: TagResult[] | null = null;
let cachedCountries: CountryResult[] | null = null;

export async function getTags(): Promise<TagResult[]> {
  if (cachedTags) return cachedTags;
  const tags = await withRetry(() => api.getTags(undefined, METADATA_QUERY));
  cachedTags = tags;
  return tags;
}

export async function getCountries(): Promise<CountryResult[]> {
  if (cachedCountries) return cachedCountries;
  const countries = await withRetry(() => api.getCountries(undefined, METADATA_QUERY));
  cachedCountries = countries;
  return countries;
}

export function clearMetadataCache(): void {
  cachedTags = null;
  cachedCountries = null;
}

/**
 * Drops the session cache and refetches both lists. This is the pull-to-refresh
 * path described in plans/api.md.
 */
export async function refreshMetadata(): Promise<{
  tags: TagResult[];
  countries: CountryResult[];
}> {
  clearMetadataCache();
  const [tags, countries] = await Promise.all([getTags(), getCountries()]);
  return { tags, countries };
}
