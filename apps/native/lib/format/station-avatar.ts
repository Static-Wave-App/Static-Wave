/**
 * Fallback avatars for stations with no usable `favicon`.
 *
 * Most RadioBrowser entries either have no favicon or point at a dead URL, so
 * this is the common case rather than the exception.
 */

/**
 * Palette sampled from the brand gradient. Each entry is a [start, end] pair so
 * the avatar can render as a gradient or fall back to `start` as a flat colour.
 */
export const AVATAR_COLORS: ReadonlyArray<readonly [string, string]> = [
  ["#FF2FD6", "#8B3DFF"], // pink → violet
  ["#8B3DFF", "#2E7BFF"], // violet → blue
  ["#2E7BFF", "#22D3EE"], // blue → cyan
  ["#22D3EE", "#3DDC97"], // cyan → green
  ["#FF6B3D", "#FF2FD6"], // orange → pink
  ["#FFB03D", "#FF6B3D"], // amber → orange
];

/**
 * Derives up to two initials from a station name.
 *
 * Takes the first letter of each of the first two words that begin with a
 * letter — so "Smoke & Mirrors" is SM (the ampersand is skipped) and
 * "Cool Nights 101.7" is CN. A single-word name uses its first two letters
 * ("Jazzradio" → JA). Non-latin names fall back to their leading characters.
 *
 * Returns "?" when the name has no usable characters.
 */
export function getStationInitials(name: string): string {
  if (!name) return "?";

  const words = name
    .trim()
    .split(/[\s._/\-–—]+/)
    .filter((word) => {
      const first = Array.from(word)[0];
      // Skip "&", "101.7", "(", etc. — they aren't meaningful initials.
      return first !== undefined && isLetter(first);
    });

  if (words.length === 0) {
    // No latin/alphabetic words — use the raw leading characters instead so
    // non-latin station names still get something readable.
    const chars = Array.from(name.trim()).filter((c) => c.trim().length > 0);
    return chars.length > 0 ? chars.slice(0, 2).join("").toUpperCase() : "?";
  }

  if (words.length === 1) {
    return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();
}

function isLetter(char: string): boolean {
  return char.toLowerCase() !== char.toUpperCase() || /\p{L}/u.test(char);
}

/**
 * Picks a stable colour pair for a station. Keyed on `stationuuid` so a station
 * keeps the same colour across sessions, screens, and list re-orders.
 */
export function getAvatarColors(seed: string): readonly [string, string] {
  return AVATAR_COLORS[hash(seed) % AVATAR_COLORS.length];
}

/** Convenience for flat (non-gradient) surfaces. */
export function getAvatarColor(seed: string): string {
  return getAvatarColors(seed)[0];
}

// djb2 — small, stable, and no dependency. Not for security.
function hash(value: string): number {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

type StationLike = {
  stationuuid: string;
  name: string;
  favicon: string;
};

export type StationAvatar = {
  /** Use the remote image when present, otherwise render initials. */
  uri: string | null;
  initials: string;
  colors: readonly [string, string];
};

/**
 * Single entry point for a station row: gives the component everything it needs
 * to render either the favicon or the fallback, without branching at the call
 * site.
 */
export function getStationAvatar(station: StationLike): StationAvatar {
  return {
    uri: isUsableFavicon(station.favicon) ? station.favicon : null,
    initials: getStationInitials(station.name),
    colors: getAvatarColors(station.stationuuid || station.name),
  };
}

/**
 * RadioBrowser favicons are user-submitted: many are empty strings, plain
 * hostnames, or `http://` URLs that iOS blocks under ATS. Only accept https,
 * and let the image component's own error handler cover the rest.
 */
function isUsableFavicon(favicon: string): boolean {
  if (!favicon) return false;
  const trimmed = favicon.trim();
  if (trimmed.length === 0) return false;
  return trimmed.startsWith("https://");
}
