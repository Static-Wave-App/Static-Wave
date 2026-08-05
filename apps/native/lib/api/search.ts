import type { AdvancedStationQuery } from "radio-browser-api";

import type { Station } from "@static-wave/types";

import { api, mapApiStations } from "./client";
import { withRetry } from "./retry";

const DEFAULT_LIMIT = 30;

/**
 * Drops keys whose value is `undefined` before the query reaches the client.
 *
 * This is not defensive tidying — it is required for search to work at all.
 * `radio-browser-api`'s `createQueryParams` iterates every own key and emits
 * `&{key}={encodeURIComponent(value)}`, with no check for `undefined`. So an
 * unset filter is serialized as the literal string:
 *
 *   stations/search?name=jazz&tag=undefined&country=undefined&...
 *
 * RadioBrowser then filters for a tag named "undefined" and matches nothing,
 * which is why every search returned an empty list regardless of the term.
 */
function compact(query: AdvancedStationQuery): AdvancedStationQuery {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  ) as AdvancedStationQuery;
}

type PaginationOptions = {
  limit?: number;
  offset?: number;
};

/**
 * Sort orders offered by the Search screen's result bar.
 *
 * RadioBrowser sorts server-side, so this must be part of the query rather
 * than applied to the loaded page — sorting only what's on screen would
 * reorder the list every time another page arrives.
 */
export const SEARCH_SORTS = {
  popularity: { label: "Popularity", order: "votes", reverse: true },
  trending: { label: "Trending", order: "clickTrend", reverse: true },
  name: { label: "Name", order: "name", reverse: false },
} as const;

export type SearchSort = keyof typeof SEARCH_SORTS;

/** The design's "HD" chip. RadioBrowser filters this server-side. */
export const HD_MIN_BITRATE = 128;

// `tag`/`country`/`language` only apply to the advanced search endpoint. The
// byTag/byCountry endpoints take their filter as a path segment, so they accept
// pagination only.
type SearchOptions = PaginationOptions & {
  tag?: string;
  country?: string;
  language?: string;
  /** Maps to the "HD" filter chip. */
  hdOnly?: boolean;
  sort?: SearchSort;
};

export async function searchStations(
  query: string,
  options: SearchOptions = {},
): Promise<Station[]> {
  const sort = SEARCH_SORTS[options.sort ?? "popularity"];

  const result = await withRetry(() =>
    api.searchStations(
      compact({
        // An empty `name` is still a filter as far as the serializer is
        // concerned, so browse-by-filter drops it rather than sending name=.
        name: query.trim() || undefined,
        tag: options.tag,
        country: options.country,
        language: options.language,
        // The API takes bitrate bounds as strings.
        bitrateMin: options.hdOnly ? String(HD_MIN_BITRATE) : undefined,
        order: sort.order,
        reverse: sort.reverse,
        limit: options.limit ?? DEFAULT_LIMIT,
        offset: options.offset ?? 0,
      }),
    ),
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
