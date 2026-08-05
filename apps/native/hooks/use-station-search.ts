import { useCallback, useEffect, useRef, useState } from "react";

import type { Station } from "@static-wave/types";

import { searchStations } from "@/lib/api";
import { formatResultCount } from "@/lib/format/station-meta";

import { useDebouncedValue } from "./use-debounced-value";

const PAGE_SIZE = 30;

type Filters = {
  tag?: string;
  country?: string;
};

type StationSearch = {
  stations: Station[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  /**
   * "30+ results" / "12 results". RadioBrowser returns a page with no total,
   * so this reflects what's loaded rather than a server-side count.
   */
  resultLabel: string;
  loadMore: () => void;
  retry: () => void;
};

/**
 * Debounced, paginated station search.
 *
 * Handles the two things every infinite list gets wrong: stale responses
 * overwriting fresh ones (guarded by a request sequence number), and loadMore
 * firing repeatedly while a page is already in flight.
 */
export function useStationSearch(query: string, filters: Filters = {}): StationSearch {
  const debouncedQuery = useDebouncedValue(query);

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);
  // Incremented per search; responses from an older sequence are discarded.
  const sequenceRef = useRef(0);

  const { tag, country } = filters;

  useEffect(() => {
    const sequence = ++sequenceRef.current;
    offsetRef.current = 0;

    if (!debouncedQuery.trim() && !tag && !country) {
      setStations([]);
      setHasMore(false);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    inFlightRef.current = true;

    searchStations(debouncedQuery, { tag, country, limit: PAGE_SIZE, offset: 0 })
      .then((results) => {
        if (sequence !== sequenceRef.current) return;
        setStations(results);
        setHasMore(results.length === PAGE_SIZE);
        offsetRef.current = results.length;
      })
      .catch(() => {
        if (sequence !== sequenceRef.current) return;
        setError("Couldn't load stations");
        setStations([]);
        setHasMore(false);
      })
      .finally(() => {
        if (sequence !== sequenceRef.current) return;
        inFlightRef.current = false;
        setIsLoading(false);
      });
  }, [debouncedQuery, tag, country, attempt]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMore) return;

    const sequence = sequenceRef.current;
    inFlightRef.current = true;
    setIsLoadingMore(true);

    searchStations(debouncedQuery, {
      tag,
      country,
      limit: PAGE_SIZE,
      offset: offsetRef.current,
    })
      .then((results) => {
        if (sequence !== sequenceRef.current) return;
        // Guard against the API returning overlapping pages.
        setStations((prev) => {
          const seen = new Set(prev.map((s) => s.stationuuid));
          return [...prev, ...results.filter((s) => !seen.has(s.stationuuid))];
        });
        setHasMore(results.length === PAGE_SIZE);
        offsetRef.current += results.length;
      })
      .catch(() => {
        if (sequence !== sequenceRef.current) return;
        setHasMore(false);
      })
      .finally(() => {
        if (sequence !== sequenceRef.current) return;
        inFlightRef.current = false;
        setIsLoadingMore(false);
      });
  }, [debouncedQuery, tag, country, hasMore]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return {
    stations,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    resultLabel: formatResultCount(stations.length, hasMore),
    loadMore,
    retry,
  };
}
