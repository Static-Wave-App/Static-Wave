import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { create } from "zustand";

import type { Station } from "@static-wave/types";

import { api, getStreamUrl } from "@/lib/api";
import { LOCK_SCREEN_ARTWORK } from "@/lib/lock-screen-artwork";

const NETWORK_ERROR_PATTERN =
  /network|timeout|timed out|connection|unreachable|enotfound|econnrefused|offline/i;

/**
 * `setActiveForLockScreen` only takes effect once the audio session is active,
 * which happens shortly after `play()`. Calling it immediately is a no-op, so
 * it's deferred — see the expo-audio docs on lock screen controls.
 */
const LOCK_SCREEN_DELAY_MS = 400;

type PlaybackFailure = {
  error: string;
  isOffline: boolean;
};

/**
 * Normalizes anything the player can throw or emit into a user-facing message
 * plus an `isOffline` flag, so screens can tell a dead stream from a dead
 * connection. See systems/error-handling.md.
 */
export function classifyPlaybackError(reason: unknown): PlaybackFailure {
  let message = "";

  if (reason instanceof Error) {
    message = reason.message;
  } else if (typeof reason === "string") {
    message = reason;
  } else if (reason && typeof reason === "object" && "message" in reason) {
    message = String((reason as { message: unknown }).message);
  }

  const isOffline = NETWORK_ERROR_PATTERN.test(message);

  return {
    error: isOffline ? "No internet connection" : "Failed to play station",
    isOffline,
  };
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

/**
 * The native player instance lives outside the store. expo-audio players are
 * disposable native objects, not serializable state — keeping one in Zustand
 * would make every subscriber re-render on an object identity change.
 */
let player: AudioPlayer | null = null;
let lockScreenTimer: ReturnType<typeof setTimeout> | null = null;

function disposePlayer() {
  if (lockScreenTimer) {
    clearTimeout(lockScreenTimer);
    lockScreenTimer = null;
  }
  if (player) {
    try {
      player.remove();
    } catch {
      // Already released — nothing to do.
    }
    player = null;
  }
}

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
          // `doNotMix` is REQUIRED for lock screen controls to bind to this
          // player. Ducking other audio is not available alongside it.
          interruptionMode: "doNotMix",
        });

        set({ isReady: true });
      } catch {
        set({ isReady: true, error: "Failed to setup audio player" });
      }
    },

    play: async (station: Station) => {
      set({
        isLoading: true,
        error: null,
        isOffline: false,
        currentStation: station,
      });

      try {
        disposePlayer();

        player = createAudioPlayer({ uri: getStreamUrl(station) });

        player.addListener("playbackStatusUpdate", (status) => {
          // Live radio has no end, so a reported error is the only terminal
          // state worth reacting to.
          if (status.isLoaded === false && "error" in status && status.error) {
            set({
              isPlaying: false,
              isLoading: false,
              ...classifyPlaybackError(status.error),
            });
          }
        });

        player.play();
        set({ isPlaying: true, isLoading: false });

        // Deferred: the audio session isn't active until playback begins.
        lockScreenTimer = setTimeout(() => {
          try {
            player?.setActiveForLockScreen(true, {
              title: station.name,
              artist: "static wave",
              albumTitle: station.country || "Radio",
              // Deliberately a bundled asset, not station.favicon. Remote
              // artwork is a known iOS crash source (expo/expo#44496) and
              // RadioBrowser favicons are frequently dead links.
              artworkUrl: LOCK_SCREEN_ARTWORK,
            });
          } catch {
            // Lock screen metadata is cosmetic — never break playback for it.
          }
        }, LOCK_SCREEN_DELAY_MS);

        api.sendStationClick(station.stationuuid).catch(() => {});
      } catch (e) {
        disposePlayer();
        set({
          isLoading: false,
          isPlaying: false,
          ...classifyPlaybackError(e),
        });
      }
    },

    pause: async () => {
      player?.pause();
      set({ isPlaying: false });
    },

    resume: async () => {
      const { currentStation } = get();

      // The player is disposed on stop, so resuming after a stop has to
      // reload the station rather than un-pause nothing.
      if (!player && currentStation) {
        await get().play(currentStation);
        return;
      }

      player?.play();
      set({ isPlaying: true });
    },

    stop: async () => {
      disposePlayer();
      set({
        currentStation: null,
        isPlaying: false,
        isLoading: false,
        error: null,
        isOffline: false,
      });
    },

    togglePlayback: async () => {
      if (get().isPlaying) {
        await get().pause();
      } else {
        await get().resume();
      }
    },
  }),
);
