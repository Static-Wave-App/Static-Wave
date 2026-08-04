import type { Query } from "radio-browser-api";

import { api } from "./client";

type TagResult = { name: string; stationcount: number };
type CountryResult = { name: string; stationcount: number };

let cachedTags: TagResult[] | null = null;
let cachedCountries: CountryResult[] | null = null;

export async function getTags(): Promise<TagResult[]> {
  if (cachedTags) return cachedTags;
  const query: Query = { order: "stationcount", reverse: true, hideBroken: true };
  const tags = (await api.getTags(undefined, query)) as unknown as TagResult[];
  cachedTags = tags;
  return tags;
}

export async function getCountries(): Promise<CountryResult[]> {
  if (cachedCountries) return cachedCountries;
  const query: Query = { order: "stationcount", reverse: true, hideBroken: true };
  const countries = (await api.getCountries(undefined, query)) as unknown as CountryResult[];
  cachedCountries = countries;
  return countries;
}

export function clearMetadataCache(): void {
  cachedTags = null;
  cachedCountries = null;
}