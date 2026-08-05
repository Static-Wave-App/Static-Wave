import { create } from "zustand";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from "react-native-track-player";

import type { Station } from "@static-wave/types";

import { api, getStreamUrl } from "@/lib/api";

const NETWORK_ERROR_PATTERN =
  /network|timeout|timed out|connection|unreachable|enotfound|econnrefused|offline/i;

type PlaybackFailure = {
  error: string;
  isOffline: boolean;
};

/**
 * Normalizes anything track-player can throw or emit — an Error from `play()`,
 * a string, or a PlaybackError event payload — into a user-facing message plus
 * an `isOffline` flag so screens can distinguish a dead stream from a dead
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
        await TrackPlayer.setupPlayer({
          autoHandleInterruptions: true,
        });

        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.PausePlayback,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
        });

        TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, () => {
          set({ isPlaying: true, isLoading: false });
        });

        TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
          set({
            isPlaying: false,
            isLoading: false,
            ...classifyPlaybackError(event),
          });
        });

        const playbackState = await TrackPlayer.getPlaybackState();
        set({
          isReady: true,
          isPlaying: playbackState.state === State.Playing,
        });
      } catch {
        set({ isReady: true, error: "Failed to setup audio player" });
      }
    },

    play: async (station: Station) => {
      set({ isLoading: true, error: null, isOffline: false, currentStation: station });

      try {
        await TrackPlayer.reset();

        await TrackPlayer.add({
          id: station.stationuuid,
          url: getStreamUrl(station),
          title: station.name,
          artist: "static wave",
          artwork: station.favicon || undefined,
          isLiveStream: true,
        });

        await TrackPlayer.play();

        set({ isPlaying: true, isLoading: false });

        api.sendStationClick(station.stationuuid).catch(() => {});
      } catch (e) {
        set({
          isLoading: false,
          isPlaying: false,
          ...classifyPlaybackError(e),
        });
      }
    },

    pause: async () => {
      await TrackPlayer.pause();
      set({ isPlaying: false });
    },

    resume: async () => {
      await TrackPlayer.play();
      set({ isPlaying: true });
    },

    stop: async () => {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      set({
        currentStation: null,
        isPlaying: false,
        isLoading: false,
        error: null,
        isOffline: false,
      });
    },

    togglePlayback: async () => {
      const { isPlaying } = get();
      if (isPlaying) {
        await get().pause();
      } else {
        await get().resume();
      }
    },
  }),
);