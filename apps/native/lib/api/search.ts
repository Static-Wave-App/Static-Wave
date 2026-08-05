import type { Station } from "@static-wave/types";

import { api, mapApiStations } from "./client";
import { withRetry } from "./retry";

const DEFAULT_LIMIT = 30;

type PaginationOptions = {
  limit?: number;
  offset?: number;
};

// `tag`/`country` only apply to the advanced search endpoint. The byTag/byCountry
// endpoints take their filter as a path segment, so they accept pagination only.
type SearchOptions = PaginationOptions & {
  tag?: string;
  country?: string;
};

export async function searchStations(
  query: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const result = await withRetry(() =>
    api.searchStations({
      name: query,
      tag: options.tag,
      country: options.country,
      limit: options.limit ?? DEFAULT_LIMIT,
      offset: options.offset ?? 0,
    }),
  );
  return mapApiStations(result);
}

export async function getStationsByTag(
  tag: string,
  options: PaginationOptions = {},
): Promise<Station[]> {
  const result = await withRetry(() =>
    api.getStationsBy("byTag", tag, {
      limit: options.limit ?? DEFAULT_LIMIT,
      offset: options.offset ?? 0,
    }),
  );
  return mapApiStations(result);
}

export async function getStationsByCountry(
  country: string,
  options: PaginationOptions = {},
): Promise<Station[]> {
  const result = await withRetry(() =>
    api.getStationsBy("byCountry", country, {
      limit: options.limit ?? DEFAULT_LIMIT,
      offset: options.offset ?? 0,
    }),
  );
  return mapApiStations(result);
}
