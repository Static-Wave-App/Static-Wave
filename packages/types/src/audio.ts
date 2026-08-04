import type { Station } from "./station";

export type AudioPlayerState = {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
};

export type SleepTimerState = {
  endTime: number | null;
};