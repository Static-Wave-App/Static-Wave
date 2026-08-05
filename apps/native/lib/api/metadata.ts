import type { CountryResult, Query, TagResult } from "radio-browser-api";

import { api } from "./client";
import { withRetry } from "./retry";

// `hideBroken` is already applied at the client level (see client.ts).
const METADATA_QUERY: Query = { order: "stationcount", reverse: true };

let cachedTags: TagResult[] | null = null;
let cachedCountries: CountryResult[] | null = null;
let cachedLanguages: CountryResult[] | null = null;

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

/**
 * Backs the Search screen's "Language" filter chip. Same shape as countries —
 * `{ name, stationcount }` — so both feed the same picker.
 */
export async function getLanguages(): Promise<CountryResult[]> {
  if (cachedLanguages) return cachedLanguages;
  const languages = await withRetry(() => api.getLanguages(undefined, METADATA_QUERY));
  cachedLanguages = languages;
  return languages;
}

export function clearMetadataCache(): void {
  cachedTags = null;
  cachedCountries = null;
  cachedLanguages = null;
}

/**
 * Drops the session cache and refetches both lists. This is the pull-to-refresh
 * path described in plans/api.md.
 */
export async function refreshMetadata(): Promise<{
  tags: TagResult[];
  countries: CountryResult[];
  languages: CountryResult[];
}> {
  clearMetadataCache();
  const [tags, countries, languages] = await Promise.all([
    getTags(),
    getCountries(),
    getLanguages(),
  ]);
  return { tags, countries, languages };
}
