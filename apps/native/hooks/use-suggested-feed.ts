import { useCallback, useEffect, useRef, useState } from "react";

import type { Station } from "@static-wave/types";

import { getStationsByCountry, getStationsByTag } from "@/lib/api";
import { useOnboarding } from "@/stores";

const PAGE_SIZE = 20;

type SuggestedFeed = {
  stations: Station[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
};

/**
 * The paginated feed behind `/suggested`.
 *
 * Separate from `useSuggestedStations`, which deliberately returns a fixed 10
 * for the dashboard card. This one keeps going, rotating through the user's
 * onboarding genres one page at a time and falling back to their country.
 *
 * Rotating rather than interleaving matters: RadioBrowser paginates per tag, so
 * a page here is "the next 20 of one genre". Asking all genres for page N at
 * once and flattening would re-request the head of each list every time.
 */
export function useSuggestedFeed(): SuggestedFeed {
  const genres = useOnboarding((s) => s.selectedGenres);
  const country = useOnboarding((s) => s.selectedCountry);

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [attempt, setAttempt] = useState(0);

  // Which source we're on, and how deep into it.
  const cursorRef = useRef({ source: 0, offset: 0 });
  const seenRef = useRef(new Set<string>());
  const inFlightRef = useRef(false);
  const sequenceRef = useRef(0);

  const genreKey = genres.join(",");

  // Every source we can page through, in order. Genres first — they're the
  // user's explicit answer; country is the fallback so the feed is never empty.
  const buildSources = useCallback(() => {
    const list: Array<() => Promise<Station[]>> = [];
    const selected = genreKey ? genreKey.split(",") : [];

    for (const genre of selected) {
      list.push(() =>
        getStationsByTag(genre, {
          limit: PAGE_SIZE,
          offset: cursorRef.current.offset,
        }),
      );
    }

    if (country) {
      list.push(() =>
        getStationsByCountry(country, {
          limit: PAGE_SIZE,
          offset: cursorRef.current.offset,
        }),
      );
    }

    return list;
  }, [genreKey, country]);

  const fetchPage = useCallback(
    async (sequence: number, isFirst: boolean) => {
      const sources = buildSources();

      if (sources.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      inFlightRef.current = true;
      if (isFirst) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        // Walk forward until a source yields something new — a genre can run
        // dry long before the others do.
        let collected: Station[] = [];

        while (cursorRef.current.source < sources.length && collected.length === 0) {
          const results = await sources[cursorRef.current.source]();

          if (results.length < PAGE_SIZE) {
            // Source exhausted — advance to the next one on the following call.
            cursorRef.current = { source: cursorRef.current.source + 1, offset: 0 };
          } else {
            cursorRef.current = {
              source: cursorRef.current.source,
              offset: cursorRef.current.offset + results.length,
            };
          }

          collected = results.filter((s) => !seenRef.current.has(s.stationuuid));
          for (const s of collected) seenRef.current.add(s.stationuuid);
        }

        if (sequence !== sequenceRef.current) return;

        setStations((prev) => (isFirst ? collected : [...prev, ...collected]));
        setHasMore(cursorRef.current.source < sources.length);
        setError(null);
      } catch {
        if (sequence !== sequenceRef.current) return;
        setError("Couldn't load suggestions");
        setHasMore(false);
      } finally {
        if (sequence === sequenceRef.current) {
          inFlightRef.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [buildSources],
  );

  useEffect(() => {
    const sequence = ++sequenceRef.current;
    cursorRef.current = { source: 0, offset: 0 };
    seenRef.current = new Set();
    setHasMore(true);
    fetchPage(sequence, true);
  }, [fetchPage, attempt]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMore) return;
    fetchPage(sequenceRef.current, false);
  }, [fetchPage, hasMore]);

  const refresh = useCallback(() => setAttempt((a) => a + 1), []);

  return { stations, isLoading, isLoadingMore, error, hasMore, loadMore, refresh };
}
