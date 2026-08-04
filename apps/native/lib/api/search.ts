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
  const result = await api.searchStations(
    {
      name: query,
      tag: options.tag,
      country: options.country,
      limit: options.limit ?? 30,
      offset: options.offset ?? 0,
    },
  );
  return result as unknown as Station[];
}

export async function getStationsByTag(
  tag: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const result = await api.getStationsBy("byTag", tag, {
    limit: options.limit ?? 30,
    offset: options.offset ?? 0,
  });
  return result as unknown as Station[];
}

export async function getStationsByCountry(
  country: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const result = await api.getStationsBy("byCountry", country, {
    limit: options.limit ?? 30,
    offset: options.offset ?? 0,
  });
  return result as unknown as Station[];
}