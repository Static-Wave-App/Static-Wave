import type { Station } from "@static-wave/types";

import { api } from "./client";

type SearchOptions = {
  limit?: number;
  offset?: number;
  tag?: string;
  country?: string;
};

export async function searchStations(
  query: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const result = await api.searchStations(query, {
    limit: options.limit ?? 30,
    offset: options.offset ?? 0,
    ...(options.tag ? { tag: options.tag } : {}),
    ...(options.country ? { country: options.country } : {}),
  });
  return result as unknown as Station[];
}

export async function getStationsByTag(
  tag: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const result = await api.getStationsByTag(tag, {
    limit: options.limit ?? 30,
    offset: options.offset ?? 0,
  });
  return result as unknown as Station[];
}

export async function getStationsByCountry(
  country: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const result = await api.getStationsByCountry(country, {
    limit: options.limit ?? 30,
    offset: options.offset ?? 0,
  });
  return result as unknown as Station[];
}