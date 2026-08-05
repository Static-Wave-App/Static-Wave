import { useEffect, useState } from "react";

import { getPlayableStationCount, getServerStats } from "@/lib/api/stats";
import { formatCatalogueSize } from "@/lib/format/station-meta";

type CatalogueSize = {
  /** e.g. "48,000" — already rounded for display. Null until loaded. */
  label: string | null;
  count: number | null;
};

/**
 * Live station count for the search screen's subtitle. Returns null rather than
 * a placeholder number so the UI can omit the line until it's real, instead of
 * showing a figure that might be wrong.
 */
export function useCatalogueSize(): CatalogueSize {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getServerStats()
      .then((stats) => {
        if (cancelled) return;
        setCount(getPlayableStationCount(stats));
      })
      .catch(() => {
        // Non-critical copy — stay silent and render nothing.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    count,
    label: count === null ? null : formatCatalogueSize(count),
  };
}
