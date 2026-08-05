import { useCallback, useEffect, useState } from "react";

import type { Station } from "@static-wave/types";

import { api, mapApiStations } from "@/lib/api";
import { useFavorites, useRecentlyPlayed } from "@/stores";

type StationResult = {
  station: Station | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Resolves a station by uuid for the Station Details screen.
 *
 * Checks favorites and history first. That isn't just a cache — most
 * navigations into this screen come from a list the station is already in, so
 * the common path renders immediately and works offline. The network call only
 * happens for a station the user has never touched (a deep link, or a search
 * result they haven't saved).
 */
export function useStation(uuid: string | undefined): StationResult {
  const favorites = useFavorites((s) => s.favorites);
  const recentlyPlayed = useRecentlyPlayed((s) => s.recentlyPlayed);

  const local =
    (uuid
      ? (favorites.find((s) => s.stationuuid === uuid) ??
        recentlyPlayed.find((s) => s.stationuuid === uuid))
      : undefined) ?? null;

  const [fetched, setFetched] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const hasLocal = local !== null;

  useEffect(() => {
    if (!uuid || hasLocal) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    api
      .getStationsById([uuid])
      .then((results) => {
        if (cancelled) return;
        const station = mapApiStations(results)[0] ?? null;
        setFetched(station);
        if (!station) setError("Station not found");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load this station");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uuid, hasLocal, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return {
    // Local data wins even after a fetch: it carries the user's own `addedAt` /
    // `playedAt` fields, which the API response doesn't have.
    station: local ?? fetched,
    isLoading: hasLocal ? false : isLoading,
    error: hasLocal ? null : error,
    retry,
  };
}
