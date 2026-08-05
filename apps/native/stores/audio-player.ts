import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { create } from "zustand";

import type { Station } from "@static-wave/types";

import { api, getStreamUrl } from "@/lib/api";
import { LOCK_SCREEN_ARTWORK } from "@/lib/lock-screen-artwork";

const NETWORK_ERROR_PATTERN =
  /network|timeout|timed out|connection|unreachable|enotfound|econnrefused|offline/i;

const LOCK_SCREEN_DELAY_MS = 400;

type PlaybackFailure = { error: string; isOffline: boolean };

export function classifyPlaybackError(reason: unknown): PlaybackFailure {
  let message = "";
  if (reason instanceof Error) message = reason.message;
  else if (typeof reason === "string") message = reason;
  else if (reason && typeof reason === "object" && "message" in reason) {
    message = String((reason as { message: unknown }).message);
  }
  const isOffline = NETWORK_ERROR_PATTERN.test(message);
  return {
    error: isOffline ? "No internet connection" : "Failed to play station",
    isOffline,
  };
}

/* ------------------------------------------------------------------------ *
 * Single-player invariant
 *
 * expo-audio players are native objects that outlive the JS that created
 * them. A player that is never released keeps decoding audio even after the
 * app is killed — which is exactly what happened: repeated play() calls
 * stacked orphaned players that could only be stopped by uninstalling.
 *
 * Three rules enforced here:
 *   1. At most ONE player exists at any moment.
 *   2. Every player ever created is tracked, so nothing can be orphaned by a
 *      race, an exception, or a fast double-tap.
 *   3. Releasing pauses FIRST — `remove()` alone does not reliably silence a
 *      player before the native object is torn down.
 * ------------------------------------------------------------------------ */

let player: AudioPlayer | null = null;
let statusSub: { remove: () => void } | null = null;
let lockScreenTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Every player handed out by `createAudioPlayer`. Belt-and-braces: if a race
 * ever leaks one past `player`, `releaseAllPlayers()` still finds it.
 */
const livePlayers = new Set<AudioPlayer>();

/** Bumped on every play(); a call whose token is stale must abort. */
let playToken = 0;

function hardRelease(target: AudioPlayer) {
  livePlayers.delete(target);
  // Order matters: silence, then detach lock screen, then free the object.
  try {
    target.pause();
  } catch {
    /* already gone */
  }
  try {
    target.setActiveForLockScreen(false);
  } catch {
    /* not the active player */
  }
  try {
    target.remove();
  } catch {
    /* already released */
  }
}

/**
 * Tears down the current player. Synchronous and re-entrancy safe: the module
 * reference is cleared BEFORE release, so a concurrent call can neither
 * double-release the same instance nor skip one.
 */
function teardown() {
  if (lockScreenTimer) {
    clearTimeout(lockScreenTimer);
    lockScreenTimer = null;
  }
  if (statusSub) {
    try {
      statusSub.remove();
    } catch {
      /* noop */
    }
    statusSub = null;
  }

  const current = player;
  player = null;
  if (current) hardRelease(current);
}

/**
 * Nuclear option — releases the tracked player and any leaked ones. Called on
 * root-layout teardown so a Fast Refresh or JS reload can't strand audio.
 */
export function releaseAllPlayers() {
  teardown();
  for (const stray of Array.from(livePlayers)) hardRelease(stray);
  livePlayers.clear();
}

type AudioPlayerState = {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  isReady: boolean;
};

type AudioPlayerActions = {
  setup: () => Promise<void>;
  play: (station: Station) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  togglePlayback: () => Promise<void>;
};

export const useAudioPlayer = create<AudioPlayerState & AudioPlayerActions>(
  (set, get) => ({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    error: null,
    isOffline: false,
    isReady: false,

    setup: async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          // Required for lock screen controls to bind to this player.
          interruptionMode: "doNotMix",
        });
        set({ isReady: true });
      } catch {
        set({ isReady: true, error: "Failed to setup audio player" });
      }
    },

    play: async (station: Station) => {
      // Claim this call. Any play() already in flight is now stale.
      const token = ++playToken;

      // Synchronous, before any await — this is what stops stacking.
      teardown();

      set({
        isLoading: true,
        error: null,
        isOffline: false,
        currentStation: station,
        isPlaying: false,
      });

      try {
        const next = createAudioPlayer({ uri: getStreamUrl(station) });
        livePlayers.add(next);

        // A newer play() started while we were constructing — discard this one
        // rather than letting two players coexist.
        if (token !== playToken) {
          hardRelease(next);
          return;
        }

        player = next;

        statusSub = next.addListener("playbackStatusUpdate", (status) => {
          if (token !== playToken) return; // stale player, ignore
          if (status.isLoaded === false && "error" in status && status.error) {
            set({
              isPlaying: false,
              isLoading: false,
              ...classifyPlaybackError(status.error),
            });
          }
        });

        next.play();
        set({ isPlaying: true, isLoading: false });

        lockScreenTimer = setTimeout(() => {
          if (token !== playToken) return;
          try {
            next.setActiveForLockScreen(true, {
              title: station.name,
              artist: "static wave",
              albumTitle: station.country || "Radio",
              artworkUrl: LOCK_SCREEN_ARTWORK,
            });
          } catch {
            /* lock screen metadata is cosmetic */
          }
        }, LOCK_SCREEN_DELAY_MS);

        api.sendStationClick(station.stationuuid).catch(() => {});
      } catch (e) {
        if (token !== playToken) return;
        teardown();
        set({ isLoading: false, isPlaying: false, ...classifyPlaybackError(e) });
      }
    },

    pause: async () => {
      try {
        player?.pause();
      } catch {
        /* noop */
      }
      set({ isPlaying: false });
    },

    resume: async () => {
      const { currentStation } = get();
      // stop() releases the player, so resuming after a stop must reload.
      if (!player && currentStation) {
        await get().play(currentStation);
        return;
      }
      try {
        player?.play();
      } catch {
        /* noop */
      }
      set({ isPlaying: true });
    },

    stop: async () => {
      // Invalidate any in-flight play() so it can't resurrect audio.
      playToken++;
      releaseAllPlayers();
      set({
        currentStation: null,
        isPlaying: false,
        isLoading: false,
        error: null,
        isOffline: false,
      });
    },

    togglePlayback: async () => {
      if (get().isPlaying) await get().pause();
      else await get().resume();
    },
  }),
);
