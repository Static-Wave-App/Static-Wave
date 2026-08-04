import { Audio } from "expo-av";
import { create } from "zustand";

import type { Station } from "@static-wave/types";

import { api } from "@/lib/api";
import { addToRecentlyPlayed } from "@/lib/storage";

type AudioPlayerState = {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  soundObject: Audio.Sound | null;
};

type AudioPlayerActions = {
  play: (station: Station) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  togglePlayback: () => Promise<void>;
};

type AudioPlayerStore = AudioPlayerState & AudioPlayerActions;

let playStartTime: number | null = null;

export const useAudioPlayer = create<AudioPlayerStore>((set, get) => ({
  currentStation: null,
  isPlaying: false,
  isLoading: false,
  error: null,
  isOffline: false,
  soundObject: null,

  play: async (station: Station) => {
    const { soundObject: oldSound } = get();
    if (oldSound) {
      await oldSound.unloadAsync();
    }

    set({ isLoading: true, error: null, isOffline: false, currentStation: station });

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: station.url },
        { shouldPlay: true },
      );

      playStartTime = Date.now();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          set({ isPlaying: false });
        }
      });

      set({ soundObject: sound, isPlaying: true, isLoading: false });

      api.sendStationClick(station.stationuuid).catch(() => {});
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const isOffline = message.includes("Network") || message.includes("network") || message.includes("timeout");
      set({
        isLoading: false,
        error: isOffline ? "No internet connection" : "Failed to play station",
        isOffline,
        isPlaying: false,
      });
    }
  },

  pause: async () => {
    const { soundObject } = get();
    if (!soundObject) return;
    await soundObject.pauseAsync();
    set({ isPlaying: false });
  },

  resume: async () => {
    const { soundObject } = get();
    if (!soundObject) return;
    await soundObject.playAsync();
    set({ isPlaying: true });
  },

  stop: async () => {
    const { soundObject } = get();
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
    }
    playStartTime = null;
    set({
      currentStation: null,
      isPlaying: false,
      isLoading: false,
      error: null,
      isOffline: false,
      soundObject: null,
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
}));

const RECENTLY_PLAYED_THRESHOLD_MS = 5000;

export function checkAndRecordPlayback(station: Station): void {
  if (playStartTime && Date.now() - playStartTime >= RECENTLY_PLAYED_THRESHOLD_MS) {
    addToRecentlyPlayed(station);
  }
}