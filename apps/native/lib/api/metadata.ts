import { api } from "./client";

type Tag = { name: string; stationcount: string };
type Country = { name: string; stationcount: string };

let cachedTags: Tag[] | null = null;
let cachedCountries: Country[] | null = null;

export async function getTags(): Promise<Tag[]> {
  if (cachedTags) return cachedTags;
  const tags = (await api.getTags({
    hidebroken: true,
    order: "stationcount",
    reverse: true,
  })) as unknown as Tag[];
  cachedTags = tags;
  return tags;
}

export async function getCountries(): Promise<Country[]> {
  if (cachedCountries) return cachedCountries;
  const countries = (await api.getCountries({
    hidebroken: true,
    order: "stationcount",
    reverse: true,
  })) as unknown as Country[];
  cachedCountries = countries;
  return countries;
}

export function clearMetadataCache(): void {
  cachedTags = null;
  cachedCountries = null;
}