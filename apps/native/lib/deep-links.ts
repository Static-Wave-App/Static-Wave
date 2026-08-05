import * as Linking from "expo-linking";
import { router } from "expo-router";

import { api, mapApiStations } from "@/lib/api";
import { useAudioPlayer, useFavorites, useOnboarding, useRecentlyPlayed } from "@/stores";

/**
 * Deep link handling for `static-wave://`.
 *
 * The scheme is `static-wave` — it must match `expo.scheme` in app.json.
 * (plans/widgets.md previously documented `staticwave://`, which never matched.)
 *
 *   static-wave://play/{uuid}   play a station by id
 *   static-wave://player        open the player
 *   static-wave://timer         open the sleep timer
 *
 * Links are ignored while onboarding is incomplete — deep-linking a user past
 * the gate would leave them with no genres, no country, and an empty dashboard.
 */

type ParsedLink =
  | { type: "play"; uuid: string }
  | { type: "player" }
  | { type: "timer" }
  | { type: "unknown" };

export function parseDeepLink(url: string): ParsedLink {
  const { hostname, path } = Linking.parse(url);

  // `static-wave://play/abc` parses hostname="play", path="abc";
  // some platforms yield hostname=null and path="play/abc".
  const segments = [hostname, ...(path ?? "").split("/")]
    .filter((s): s is string => Boolean(s))
    .map((s) => s.trim());

  const [head, second] = segments;

  if (head === "play" && second) return { type: "play", uuid: second };
  if (head === "player") return { type: "player" };
  if (head === "timer") return { type: "timer" };
  return { type: "unknown" };
}

async function resolveStation(uuid: string) {
  // Prefer local data — avoids a network round trip for a station the user
  // already has, which is the common case from a widget or a share.
  const local =
    useFavorites.getState().favorites.find((s) => s.stationuuid === uuid) ??
    useRecentlyPlayed.getState().recentlyPlayed.find((s) => s.stationuuid === uuid);

  if (local) return local;

  const results = await api.getStationsById([uuid]);
  return mapApiStations(results)[0] ?? null;
}

async function handle(url: string) {
  // Never jump past the onboarding gate.
  if (!useOnboarding.getState().complete) return;

  const link = parseDeepLink(url);

  switch (link.type) {
    case "play": {
      try {
        const station = await resolveStation(link.uuid);
        if (!station) return;
        await useAudioPlayer.getState().play(station);
        router.push("/player");
      } catch {
        // A dead link is not worth an error state.
      }
      return;
    }
    case "player":
      router.push("/player");
      return;
    case "timer":
      router.push("/player");
      return;
    case "unknown":
      return;
  }
}

/**
 * Starts deep link handling. Covers both the cold-start URL and links that
 * arrive while the app is already running. Call once from the root layout.
 */
export function startDeepLinkHandler(): () => void {
  Linking.getInitialURL()
    .then((url) => {
      if (url) handle(url);
    })
    .catch(() => {});

  const subscription = Linking.addEventListener("url", ({ url }) => {
    handle(url);
  });

  return () => subscription.remove();
}
