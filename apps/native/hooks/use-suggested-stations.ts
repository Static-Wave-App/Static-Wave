import { useCallback, useEffect, useState } from "react";

import type { Station } from "@static-wave/types";

import { getStationsByCountry, getStationsByTag } from "@/lib/api";
import { useOnboarding } from "@/stores";

const SUGGESTION_LIMIT = 10;
const PER_GENRE_LIMIT = 6;
const MAX_GENRES = 3;

type SuggestedStations = {
  stations: Station[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Dashboard suggestions derived from the genres and country picked during
 * onboarding (plans/onboarding.md). Falls back to the user's country when no
 * genres were selected, so the dashboard is never empty.
 *
 * Not persisted — refetched on mount, since station availability changes.
 */
export function useSuggestedStations(): SuggestedStations {
  const genres = useOnboarding((s) => s.selectedGenres);
  const country = useOnboarding((s) => s.selectedCountry);

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Genres come from a store array; joining gives a stable effect dependency.
  const genreKey = genres.join(",");

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const selectedGenres = genreKey ? genreKey.split(",") : [];

    const load = async (): Promise<Station[]> => {
      if (selectedGenres.length > 0) {
        const batches = await Promise.all(
          selectedGenres
            .slice(0, MAX_GENRES)
            .map((genre) =>
              getStationsByTag(genre, { limit: PER_GENRE_LIMIT }).catch(() => []),
            ),
        );
        return batches.flat();
      }

      if (country) {
        return getStationsByCountry(country, { limit: SUGGESTION_LIMIT });
      }

      return [];
    };

    load()
      .then((results) => {
        if (cancelled) return;
        // Interleaved genre batches can repeat a station.
        const seen = new Set<string>();
        const unique = results.filter((s) => {
          if (seen.has(s.stationuuid)) return false;
          seen.add(s.stationuuid);
          return true;
        });
        setStations(unique.slice(0, SUGGESTION_LIMIT));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load suggestions");
        setStations([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [genreKey, country, attempt]);

  const refresh = useCallback(() => setAttempt((a) => a + 1), []);

  return { stations, isLoading, error, refresh };
}
