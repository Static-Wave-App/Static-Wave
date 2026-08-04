import { create } from "zustand";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from "react-native-track-player";

import type { Station } from "@static-wave/types";

import { api } from "@/lib/api";

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

        TrackPlayer.addEventListener(Event.PlaybackError, () => {
          set({ isPlaying: false, isLoading: false, error: "Playback error" });
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
          url: station.url,
          title: station.name,
          artist: "static wave",
          artwork: station.favicon || undefined,
          isLiveStream: true,
        });

        await TrackPlayer.play();

        set({ isPlaying: true, isLoading: false });

        api.sendStationClick(station.stationuuid).catch(() => {});
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const isOffline =
          message.includes("Network") ||
          message.includes("network") ||
          message.includes("timeout");
        set({
          isLoading: false,
          error: isOffline ? "No internet connection" : "Failed to play station",
          isOffline,
          isPlaying: false,
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